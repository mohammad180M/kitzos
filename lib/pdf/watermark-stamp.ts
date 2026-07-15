/**
 * Build stamp bitmaps used by BOTH preview and PDF export (§6.6 parity).
 * Rotation is always baked in (clockwise-positive UI). Embeds stay axis-aligned.
 */

import { ensureWatermarkFontById } from "@/lib/pdf/watermark-font-loader";
import {
  bakeRotationToCanvas,
  fontSizeForContentWidth,
  normalizePlacement,
  stampDrawBox,
  tileStampCenters,
  type WatermarkPlacement,
} from "@/lib/pdf/watermark-geometry";

const EXPORT_PIXEL_SCALE = 4;

export interface StampBitmap {
  /** PNG bytes of axis-aligned AABB (rotation baked). */
  png: Uint8Array;
  /** AABB width ÷ page width */
  aabbWidthRatio: number;
  /** AABB height ÷ page width */
  aabbHeightRatio: number;
  canvas: HTMLCanvasElement;
}

async function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG failed"))), "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function toStamp(
  baked: { canvas: HTMLCanvasElement; aabbWidth: number; aabbHeight: number },
  pageWidthPt: number,
  png: Uint8Array
): StampBitmap {
  return {
    canvas: baked.canvas,
    png,
    aabbWidthRatio: baked.aabbWidth / pageWidthPt,
    aabbHeightRatio: baked.aabbHeight / pageWidthPt,
  };
}

/**
 * Text stamp: widthRatio = unrotated text advance width ÷ page width.
 * Font size is solved via measureText so that equality holds.
 */
export async function createTextStampBitmap(opts: {
  text: string;
  fontId: string;
  color: string;
  pageWidthPt: number;
  widthRatio: number;
  rotationDeg: number;
  pixelScale?: number;
}): Promise<StampBitmap> {
  const pixelScale = opts.pixelScale ?? EXPORT_PIXEL_SCALE;
  const font = await ensureWatermarkFontById(opts.fontId);
  const family = `"${font.family}", sans-serif`;
  const label = opts.text || " ";
  const targetContentW = Math.max(1, opts.pageWidthPt * opts.widthRatio);

  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) throw new Error("Canvas unsupported");
  const fontSize = fontSizeForContentWidth((size) => {
    probe.font = `400 ${size}px ${family}`;
    return probe.measureText(label).width;
  }, targetContentW);

  const contentW = targetContentW;
  const contentH = fontSize * 1.35;
  const pad = fontSize * 0.2;
  const boxW = contentW + pad * 2;
  const boxH = contentH + pad * 2;

  // High-res flat stamp; bakeRotation scales it into page units × pixelScale.
  const flat = document.createElement("canvas");
  flat.width = Math.max(1, Math.ceil(boxW * pixelScale));
  flat.height = Math.max(1, Math.ceil(boxH * pixelScale));
  const fctx = flat.getContext("2d");
  if (!fctx) throw new Error("Canvas unsupported");
  fctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  fctx.clearRect(0, 0, boxW, boxH);
  fctx.font = `400 ${fontSize}px ${family}`;
  fctx.fillStyle = opts.color;
  fctx.textAlign = "center";
  fctx.textBaseline = "middle";
  fctx.fillText(label, boxW / 2, boxH / 2);

  const baked = bakeRotationToCanvas(flat, boxW, boxH, opts.rotationDeg, pixelScale);
  return toStamp(baked, opts.pageWidthPt, await canvasToPng(baked.canvas));
}

export async function createImageStampBitmap(opts: {
  image: CanvasImageSource;
  pageWidthPt: number;
  widthRatio: number;
  intrinsicW: number;
  intrinsicH: number;
  rotationDeg: number;
  pixelScale?: number;
}): Promise<StampBitmap> {
  const pixelScale = opts.pixelScale ?? EXPORT_PIXEL_SCALE;
  const contentW = Math.max(1, opts.pageWidthPt * opts.widthRatio);
  const contentH = contentW / Math.max(0.01, opts.intrinsicW / Math.max(1, opts.intrinsicH));

  const baked = bakeRotationToCanvas(
    opts.image,
    contentW,
    contentH,
    opts.rotationDeg,
    pixelScale
  );
  return toStamp(baked, opts.pageWidthPt, await canvasToPng(baked.canvas));
}

/** Paint a prepared stamp onto a page-sized canvas context (y-down from top). */
export function paintStampOnPage(
  ctx: CanvasRenderingContext2D,
  pageW: number,
  pageH: number,
  placement:
    | WatermarkPlacement
    | {
        cx: number;
        cy: number;
        rotationDeg: number;
        opacity: number;
        tiled: boolean;
      },
  stamp: Pick<StampBitmap, "canvas" | "aabbWidthRatio" | "aabbHeightRatio">
): void {
  const p = normalizePlacement(placement as WatermarkPlacement & { cx?: number; cy?: number });
  const drawW = stamp.aabbWidthRatio * pageW;
  const drawH = stamp.aabbHeightRatio * pageW;
  ctx.save();
  ctx.globalAlpha = p.opacity;

  const drawAt = (centerXRatio: number, centerYRatio: number) => {
    const box = stampDrawBox(pageW, pageH, centerXRatio, centerYRatio, drawW, drawH);
    ctx.drawImage(stamp.canvas, box.canvasX, box.canvasY, box.drawW, box.drawH);
  };

  if (!p.tiled) {
    drawAt(p.centerXRatio, p.centerYRatio);
  } else {
    for (const c of tileStampCenters(pageW, pageH, drawW, drawH)) {
      drawAt(c.x / pageW, c.y / pageH);
    }
  }
  ctx.restore();
}
