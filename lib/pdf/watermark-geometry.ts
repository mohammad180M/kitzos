/**
 * Shared watermark geometry — ONE source for preview and export (§6.6).
 *
 * Coordinates:
 * - centerXRatio / centerYRatio: stamp center, 0–1 of page (Y from TOP).
 * - widthRatio: unrotated stamp content width ÷ page width.
 * - rotationDeg: UI angle, positive = clockwise (HTML canvas convention).
 *   Rotation is baked into rasters; PDF embeds are axis-aligned.
 */

export interface WatermarkPlacement {
  centerXRatio: number;
  centerYRatio: number;
  rotationDeg: number;
  opacity: number;
  tiled: boolean;
}

/** @deprecated alias fields kept in sync by callers migrating from cx/cy */
export type WatermarkPlacementLegacy = WatermarkPlacement & {
  cx: number;
  cy: number;
};

export const DEFAULT_WATERMARK_PLACEMENT: WatermarkPlacement = {
  centerXRatio: 0.5,
  centerYRatio: 0.5,
  rotationDeg: -35,
  opacity: 0.3,
  tiled: false,
};

/** Normalize legacy {cx,cy} shapes into the shared placement. */
export function normalizePlacement(p: {
  centerXRatio?: number;
  centerYRatio?: number;
  cx?: number;
  cy?: number;
  rotationDeg: number;
  opacity: number;
  tiled: boolean;
}): WatermarkPlacement {
  return {
    centerXRatio: p.centerXRatio ?? p.cx ?? 0.5,
    centerYRatio: p.centerYRatio ?? p.cy ?? 0.5,
    rotationDeg: p.rotationDeg,
    opacity: p.opacity,
    tiled: p.tiled,
  };
}

export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Axis-aligned draw box for a stamp whose center is at ratios,
 * with size (drawW × drawH) in the same unit system as pageW/pageH.
 * Returns both canvas (y-down) and pdf-lib (y-up) origins.
 */
export function stampDrawBox(
  pageW: number,
  pageH: number,
  centerXRatio: number,
  centerYRatio: number,
  drawW: number,
  drawH: number
): { canvasX: number; canvasY: number; pdfX: number; pdfY: number; drawW: number; drawH: number } {
  const cx = centerXRatio * pageW;
  const cyTop = centerYRatio * pageH;
  const canvasX = cx - drawW / 2;
  const canvasY = cyTop - drawH / 2;
  return {
    canvasX,
    canvasY,
    pdfX: canvasX,
    pdfY: pageH - cyTop - drawH / 2,
    drawW,
    drawH,
  };
}

/**
 * Tile centers (stamp centers) in top-left / y-down page space.
 * Spacing derived from the stamp's axis-aligned AABB size.
 */
export function tileStampCenters(
  pageW: number,
  pageH: number,
  stampW: number,
  stampH: number
): Array<{ x: number; y: number }> {
  const stepX = stampW * 1.35 + pageW * 0.04;
  const stepY = stampH * 2.2 + pageH * 0.04;
  const out: Array<{ x: number; y: number }> = [];
  for (let y = -stepY; y < pageH + stepY; y += stepY) {
    for (let x = -stepX; x < pageW + stepX; x += stepX) {
      out.push({ x: x + stampW / 2, y: y + stampH / 2 });
    }
  }
  return out;
}

/**
 * Solve font size so measureText(text) ≈ targetWidth (same unit as ctx font px).
 */
export function fontSizeForContentWidth(
  measure: (fontSize: number) => number,
  targetWidth: number,
  min = 4,
  max = 2000
): number {
  let lo = min;
  let hi = max;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (measure(mid) < targetWidth) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Clockwise degrees → canvas radians (canvas already uses clockwise-positive). */
export function clockwiseDegToCanvasRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Draw a source (pre-sized content) into a new canvas with rotation baked in
 * (clockwise-positive). Returns the AABB bitmap + content/AABB metrics in
 * page-width ratios for a reference page width.
 */
export function bakeRotationToCanvas(
  source: CanvasImageSource,
  contentW: number,
  contentH: number,
  rotationDeg: number,
  pixelScale: number
): { canvas: HTMLCanvasElement; aabbWidth: number; aabbHeight: number } {
  const rad = clockwiseDegToCanvasRad(rotationDeg);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const aabbW = contentW * cos + contentH * sin;
  const aabbH = contentW * sin + contentH * cos;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(aabbW * pixelScale));
  canvas.height = Math.max(1, Math.ceil(aabbH * pixelScale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  ctx.clearRect(0, 0, aabbW, aabbH);
  ctx.translate(aabbW / 2, aabbH / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -contentW / 2, -contentH / 2, contentW, contentH);
  return { canvas, aabbWidth: aabbW, aabbHeight: aabbH };
}
