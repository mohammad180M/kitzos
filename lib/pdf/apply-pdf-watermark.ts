import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import {
  createImageStampBitmap,
  createTextStampBitmap,
  type StampBitmap,
} from "@/lib/pdf/watermark-stamp";
import {
  normalizePlacement,
  stampDrawBox,
  tileStampCenters,
  type WatermarkPlacement,
} from "@/lib/pdf/watermark-geometry";

export type WatermarkMode = "text" | "image";

export interface ApplyWatermarkOptions {
  mode: WatermarkMode;
  placement: WatermarkPlacement | {
    cx?: number;
    cy?: number;
    centerXRatio?: number;
    centerYRatio?: number;
    rotationDeg: number;
    opacity: number;
    tiled: boolean;
  };
  text?: {
    text: string;
    fontId: string;
    /** Unrotated text width ÷ page width */
    widthRatio: number;
    color: string;
  };
  imageBytes?: Uint8Array;
  imageMeta?: {
    widthRatio: number;
    intrinsicW: number;
    intrinsicH: number;
  };
}

function loadPdfLib() {
  return import("pdf-lib");
}

export async function prepareLogoBytes(
  file: File,
  maxEdge = 2000
): Promise<{ bytes: Uint8Array; isPng: boolean; width: number; height: number }> {
  let width: number;
  let height: number;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

  if (isSvg) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("SVG load failed"));
        el.src = url;
      });
      width = Math.max(1, img.naturalWidth || 1024);
      height = Math.max(1, img.naturalHeight || 1024);
      const scale = Math.min(1, maxEdge / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    } finally {
      URL.revokeObjectURL(url);
    }
  } else {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG failed"))), "image/png");
  });
  return { bytes: new Uint8Array(await blob.arrayBuffer()), isPng: true, width, height };
}

export async function applyPdfWatermark(
  file: File,
  options: ApplyWatermarkOptions
): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const pdfBytes = await readPdfFileBytes(file);
  const pdfDoc = await PDFDocument.load(bytesForPdfLoad(pdfBytes));
  const pages = pdfDoc.getPages();
  const placement = normalizePlacement(options.placement);

  type CacheEntry = {
    stamp: StampBitmap;
    embed: Awaited<ReturnType<typeof pdfDoc.embedPng>>;
  };
  const cache = new Map<string, CacheEntry>();

  const stampForPageWidth = async (pageWidth: number): Promise<StampBitmap> => {
    if (options.mode === "image") {
      if (!options.imageBytes || !options.imageMeta) throw new Error("Missing image stamp");
      const meta = options.imageMeta;
      const copy = new Uint8Array(options.imageBytes);
      const url = URL.createObjectURL(new Blob([copy], { type: "image/png" }));
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("Image decode failed"));
          el.src = url;
        });
        return createImageStampBitmap({
          image: img,
          pageWidthPt: pageWidth,
          widthRatio: meta.widthRatio,
          intrinsicW: meta.intrinsicW,
          intrinsicH: meta.intrinsicH,
          rotationDeg: placement.rotationDeg,
        });
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (!options.text) throw new Error("Missing text stamp");
    return createTextStampBitmap({
      text: options.text.text,
      fontId: options.text.fontId,
      color: options.text.color,
      pageWidthPt: pageWidth,
      widthRatio: options.text.widthRatio,
      rotationDeg: placement.rotationDeg,
    });
  };

  for (const page of pages) {
    const { width, height } = page.getSize();
    const key = `${Math.round(width * 100) / 100}x${Math.round(height * 100) / 100}`;
    let entry = cache.get(key);
    if (!entry) {
      const stamp = await stampForPageWidth(width);
      const embed = await pdfDoc.embedPng(stamp.png);
      entry = { stamp, embed };
      cache.set(key, entry);
    }
    const { stamp, embed } = entry;
    const drawW = stamp.aabbWidthRatio * width;
    const drawH = stamp.aabbHeightRatio * width;

    const drawAt = (centerXRatio: number, centerYRatio: number) => {
      const box = stampDrawBox(width, height, centerXRatio, centerYRatio, drawW, drawH);
      page.drawImage(embed, {
        x: box.pdfX,
        y: box.pdfY,
        width: box.drawW,
        height: box.drawH,
        opacity: placement.opacity,
      });
    };

    if (!placement.tiled) {
      drawAt(placement.centerXRatio, placement.centerYRatio);
    } else {
      for (const c of tileStampCenters(width, height, drawW, drawH)) {
        drawAt(c.x / width, c.y / height);
      }
    }
  }

  const out = await pdfDoc.save();
  return pdfBytesToBlob(out);
}
