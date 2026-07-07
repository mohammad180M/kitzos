/** Region bounds in normalized image space (0–1). */
export interface BlurRegion {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Blur slider is calibrated at this natural image width. */
export const BLUR_REFERENCE_WIDTH = 1000;

export function ratioRegionToPixels(
  region: BlurRegion,
  canvasW: number,
  canvasH: number
): { x: number; y: number; w: number; h: number } {
  return {
    x: region.x * canvasW,
    y: region.y * canvasH,
    w: region.w * canvasW,
    h: region.h * canvasH,
  };
}

export function naturalPixelSize(
  region: BlurRegion,
  naturalW: number,
  naturalH: number
): { w: number; h: number } {
  return {
    w: Math.round(region.w * naturalW),
    h: Math.round(region.h * naturalH),
  };
}

/** Blur radius in canvas pixels for a given output width and natural width. */
export function blurRadiusForCanvas(
  slider: number,
  canvasW: number,
  naturalW: number
): number {
  const naturalRadius = (slider * naturalW) / BLUR_REFERENCE_WIDTH;
  return Math.max(1, (naturalRadius * canvasW) / naturalW);
}

function clampRegionPixels(
  x: number,
  y: number,
  rw: number,
  rh: number,
  canvasW: number,
  canvasH: number
) {
  const ix = Math.max(0, Math.floor(x));
  const iy = Math.max(0, Math.floor(y));
  const irw = Math.min(canvasW - ix, Math.floor(rw));
  const irh = Math.min(canvasH - iy, Math.floor(rh));
  return { x: ix, y: iy, w: irw, h: irh };
}

function applyPixelateRegion(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  rw: number,
  rh: number,
  blocksAcross: number
) {
  const blocksX = Math.max(2, Math.round(blocksAcross));
  const blockPx = rw / blocksX;
  const blocksY = Math.max(1, Math.round(rh / blockPx));

  const small = document.createElement("canvas");
  small.width = blocksX;
  small.height = blocksY;
  const sctx = small.getContext("2d");
  if (!sctx) return;
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(sourceCanvas, x, y, rw, rh, 0, 0, blocksX, blocksY);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, blocksX, blocksY, x, y, rw, rh);
  ctx.imageSmoothingEnabled = true;
  ctx.restore();
}

function applyBlurRegion(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  rw: number,
  rh: number,
  blurPx: number
) {
  const bleed = Math.ceil(blurPx * 2);
  const padW = rw + bleed * 2;
  const padH = rh + bleed * 2;

  const extract = document.createElement("canvas");
  extract.width = padW;
  extract.height = padH;
  const exCtx = extract.getContext("2d");
  if (!exCtx) return;
  exCtx.drawImage(sourceCanvas, x - bleed, y - bleed, padW, padH, 0, 0, padW, padH);

  const blurred = document.createElement("canvas");
  blurred.width = padW;
  blurred.height = padH;
  const blCtx = blurred.getContext("2d");
  if (!blCtx) return;
  blCtx.filter = `blur(${blurPx}px)`;
  blCtx.drawImage(extract, 0, 0);
  blCtx.filter = "none";

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, rw, rh);
  ctx.clip();
  ctx.drawImage(blurred, bleed, bleed, rw, rh, x, y, rw, rh);
  ctx.restore();
}

export function applyRegionsToCanvas(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  regions: BlurRegion[],
  mode: "blur" | "pixelate",
  intensity: number,
  naturalW: number,
  naturalH: number
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const canvasW = canvas.width;
  const canvasH = canvas.height;
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.drawImage(source, 0, 0, canvasW, canvasH);

  for (const region of regions) {
    const px = ratioRegionToPixels(region, canvasW, canvasH);
    const { x, y, w: rw, h: rh } = clampRegionPixels(px.x, px.y, px.w, px.h, canvasW, canvasH);
    if (rw < 2 || rh < 2) continue;

    if (mode === "pixelate") {
      applyPixelateRegion(ctx, canvas, x, y, rw, rh, intensity);
    } else {
      const blurPx = blurRadiusForCanvas(intensity, canvasW, naturalW);
      applyBlurRegion(ctx, canvas, x, y, rw, rh, blurPx);
    }
  }
}

export function outlineRegion(
  ctx: CanvasRenderingContext2D,
  region: BlurRegion,
  canvasW: number,
  canvasH: number
) {
  const px = ratioRegionToPixels(region, canvasW, canvasH);
  ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(px.x, px.y, px.w, px.h);
  ctx.setLineDash([]);
}
