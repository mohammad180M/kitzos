import { renderPdfPageToCanvas } from "./thumbnails";
import {
  createImageStampBitmap,
  createTextStampBitmap,
  paintStampOnPage,
} from "./watermark-stamp";
import { normalizePlacement, type WatermarkPlacement } from "./watermark-geometry";

export interface WatermarkPreviewText {
  text: string;
  fontId: string;
  /** Unrotated text width ÷ page width */
  widthRatio: number;
  color?: string;
}

export interface WatermarkPreviewImage {
  src: string;
  widthRatio: number;
  intrinsicW: number;
  intrinsicH: number;
}

/**
 * Preview uses the SAME stamp bitmap builder as export, scaled onto the
 * preview canvas. Placement math is shared via paintStampOnPage / stampDrawBox.
 */
export async function renderWatermarkPreview(
  file: File,
  pageIndex: number,
  placement: WatermarkPlacement | {
    cx: number;
    cy: number;
    rotationDeg: number;
    opacity: number;
    tiled: boolean;
  },
  stamp:
    | { mode: "text"; text: WatermarkPreviewText }
    | { mode: "image"; image: WatermarkPreviewImage }
): Promise<string> {
  const canvas = await renderPdfPageToCanvas(file, pageIndex, { scale: 0.5 });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  // Canvas is page × 0.5; PDF user units ≈ canvas px / 0.5.
  // Stamp ratios are page-relative, so build against the full page width
  // (canvas.width / previewScale) then paint in canvas pixels.
  const previewScale = 0.5;
  const pageWpt = canvas.width / previewScale;
  const pageW = canvas.width;
  const pageH = canvas.height;
  const p = normalizePlacement(placement);

  if (stamp.mode === "text") {
    const built = await createTextStampBitmap({
      text: stamp.text.text,
      fontId: stamp.text.fontId,
      color: stamp.text.color ?? "#808080",
      pageWidthPt: pageWpt,
      widthRatio: stamp.text.widthRatio,
      rotationDeg: p.rotationDeg,
      // Match export sharpness relative to preview resolution
      pixelScale: 2,
    });
    paintStampOnPage(ctx, pageW, pageH, p, built);
  } else {
    const img = await loadHtmlImage(stamp.image.src);
    const built = await createImageStampBitmap({
      image: img,
      pageWidthPt: pageWpt,
      widthRatio: stamp.image.widthRatio,
      intrinsicW: stamp.image.intrinsicW,
      intrinsicH: stamp.image.intrinsicH,
      rotationDeg: p.rotationDeg,
      pixelScale: 2,
    });
    paintStampOnPage(ctx, pageW, pageH, p, built);
  }

  return canvas.toDataURL("image/jpeg", 0.85);
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

export async function renderSignPreview(
  file: File,
  pageIndex: number,
  signatureCanvas: HTMLCanvasElement | null
): Promise<string> {
  const canvas = await renderPdfPageToCanvas(file, pageIndex, { scale: 0.45 });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  if (signatureCanvas) {
    const sigW = 150 * 0.45;
    const sigH = (signatureCanvas.height / signatureCanvas.width) * sigW;
    const x = canvas.width - sigW - 50 * 0.45;
    const y = 50 * 0.45;
    ctx.drawImage(signatureCanvas, x, y, sigW, sigH);
  }

  return canvas.toDataURL("image/jpeg", 0.85);
}
