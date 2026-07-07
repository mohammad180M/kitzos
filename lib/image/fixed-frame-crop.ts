export type CropShape = "rect" | "rounded" | "circle";

/** Pan offsets normalized by natural size × cover scale; scale is 1…4× over minimum cover. */
export interface CropState {
  x: number;
  y: number;
  scale: number;
}

export interface FrameSpec {
  aspect: number;
  shape: CropShape;
  radiusPct?: number;
}

export interface ViewportLayout {
  vw: number;
  vh: number;
  fw: number;
  fh: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
export const OVERLAY_ALPHA = 0.55;

export function computeFrameSize(
  viewportW: number,
  viewportH: number,
  aspect: number
): { fw: number; fh: number } {
  const maxW = Math.max(1, viewportW);
  const maxH = Math.max(1, viewportH);
  const viewAspect = maxW / maxH;

  if (aspect >= viewAspect) {
    return { fw: maxW, fh: Math.round(maxW / aspect) };
  }
  return { fw: Math.round(maxH * aspect), fh: maxH };
}

export function computeCoverScale(
  imageW: number,
  imageH: number,
  frameW: number,
  frameH: number
): number {
  return Math.max(frameW / imageW, frameH / imageH);
}

export function stateToPan(
  state: CropState,
  imageW: number,
  imageH: number,
  coverScale: number
): { panX: number; panY: number; scaleMult: number } {
  return {
    panX: state.x * imageW * coverScale,
    panY: state.y * imageH * coverScale,
    scaleMult: state.scale,
  };
}

export function panToState(
  panX: number,
  panY: number,
  scaleMult: number,
  imageW: number,
  imageH: number,
  coverScale: number
): CropState {
  const denomX = imageW * coverScale || 1;
  const denomY = imageH * coverScale || 1;
  return {
    x: panX / denomX,
    y: panY / denomY,
    scale: scaleMult,
  };
}

export function clampPanZoom(
  panX: number,
  panY: number,
  scaleMult: number,
  imageW: number,
  imageH: number,
  frameW: number,
  frameH: number,
  coverScale: number
): { panX: number; panY: number; scaleMult: number } {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scaleMult));
  const actualScale = coverScale * zoom;
  const dispW = imageW * actualScale;
  const dispH = imageH * actualScale;
  const maxPanX = Math.max(0, (dispW - frameW) / 2);
  const maxPanY = Math.max(0, (dispH - frameH) / 2);
  return {
    panX: Math.min(maxPanX, Math.max(-maxPanX, panX)),
    panY: Math.min(maxPanY, Math.max(-maxPanY, panY)),
    scaleMult: zoom,
  };
}

export function centeredCoverState(): CropState {
  return { x: 0, y: 0, scale: MIN_ZOOM };
}

export interface SourceCropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function cropStateToSourceRect(
  state: CropState,
  imageW: number,
  imageH: number,
  frameW: number,
  frameH: number
): SourceCropRect {
  const coverScale = computeCoverScale(imageW, imageH, frameW, frameH);
  const { panX, panY, scaleMult } = stateToPan(state, imageW, imageH, coverScale);
  const { panX: cx, panY: cy, scaleMult: cz } = clampPanZoom(
    panX,
    panY,
    scaleMult,
    imageW,
    imageH,
    frameW,
    frameH,
    coverScale
  );
  const actualScale = coverScale * cz;
  const dispW = imageW * actualScale;
  const dispH = imageH * actualScale;

  const sx = (dispW / 2 - cx - frameW / 2) / actualScale;
  const sy = (dispH / 2 - cy - frameH / 2) / actualScale;
  const sw = frameW / actualScale;
  const sh = frameH / actualScale;

  return { sx, sy, sw, sh };
}

function clipShapePath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  shape: CropShape,
  radiusPct: number
) {
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    ctx.clip();
    return;
  }
  if (shape === "rounded") {
    const radius = (Math.min(w, h) / 2) * (radiusPct / 100);
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, radius);
    ctx.clip();
  }
}

export interface RenderCropOptions {
  backgroundColor?: string;
  transparentOutsideShape?: boolean;
}

/** Renders the visible frame region to an output canvas (used by all crop consumers). */
export function renderCrop(
  image: CanvasImageSource & { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number },
  cropState: CropState,
  frameSpec: FrameSpec,
  frameSize: { fw: number; fh: number },
  outputSize: { w: number; h: number },
  options: RenderCropOptions = {}
): HTMLCanvasElement {
  const iw = "naturalWidth" in image && image.naturalWidth ? image.naturalWidth : image.width ?? 1;
  const ih = "naturalHeight" in image && image.naturalHeight ? image.naturalHeight : image.height ?? 1;
  const { fw, fh } = frameSize;
  const { sx, sy, sw, sh } = cropStateToSourceRect(cropState, iw, ih, fw, fh);
  const radiusPct = frameSpec.radiusPct ?? 24;
  const transparent =
    options.transparentOutsideShape ?? (frameSpec.shape === "circle" || frameSpec.shape === "rounded");

  const canvas = document.createElement("canvas");
  canvas.width = outputSize.w;
  canvas.height = outputSize.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  if (transparent) {
    ctx.clearRect(0, 0, outputSize.w, outputSize.h);
  } else if (options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, outputSize.w, outputSize.h);
  }

  if (frameSpec.shape !== "rect") {
    ctx.save();
    clipShapePath(ctx, outputSize.w, outputSize.h, frameSpec.shape, radiusPct);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outputSize.w, outputSize.h);

  if (frameSpec.shape !== "rect") {
    ctx.restore();
  }

  return canvas;
}

export function drawCropPreview(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cropState: CropState,
  frameSpec: FrameSpec,
  layout: ViewportLayout,
  options: {
    checkerboard?: boolean;
    borderColor?: string;
  } = {}
) {
  const { vw, vh, fw, fh } = layout;
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  if (!iw || !ih) return;

  const coverScale = computeCoverScale(iw, ih, fw, fh);
  const { panX, panY, scaleMult } = stateToPan(cropState, iw, ih, coverScale);
  const clamped = clampPanZoom(panX, panY, scaleMult, iw, ih, fw, fh, coverScale);
  const actualScale = coverScale * clamped.scaleMult;
  const dispW = iw * actualScale;
  const dispH = ih * actualScale;

  const frameLeft = (vw - fw) / 2;
  const frameTop = (vh - fh) / 2;
  const frameCenterX = frameLeft + fw / 2;
  const frameCenterY = frameTop + fh / 2;
  const imgLeft = frameCenterX + clamped.panX - dispW / 2;
  const imgTop = frameCenterY + clamped.panY - dispH / 2;

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, vw, vh);

  if (options.checkerboard) {
    const tile = 16;
    for (let y = 0; y < vh; y += tile) {
      for (let x = 0; x < vw; x += tile) {
        ctx.fillStyle = (x / tile + y / tile) % 2 === 0 ? "#e5e7eb" : "#d1d5db";
        ctx.fillRect(x, y, tile, tile);
      }
    }
  } else {
    ctx.fillStyle = "#182031";
    ctx.fillRect(0, 0, vw, vh);
  }

  ctx.drawImage(image, imgLeft, imgTop, dispW, dispH);
  ctx.fillStyle = `rgba(0, 0, 0, ${OVERLAY_ALPHA})`;
  ctx.fillRect(0, 0, vw, vh);

  ctx.save();
  if (frameSpec.shape === "circle") {
    ctx.beginPath();
    ctx.arc(frameLeft + fw / 2, frameTop + fh / 2, Math.min(fw, fh) / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (frameSpec.shape === "rounded") {
    const radius = (Math.min(fw, fh) / 2) * ((frameSpec.radiusPct ?? 24) / 100);
    ctx.beginPath();
    ctx.roundRect(frameLeft, frameTop, fw, fh, radius);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(frameLeft, frameTop, fw, fh);
    ctx.clip();
  }
  ctx.drawImage(image, imgLeft, imgTop, dispW, dispH);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = options.borderColor ?? "var(--accent)";
  ctx.lineWidth = 2;
  if (frameSpec.shape === "circle") {
    ctx.beginPath();
    ctx.arc(frameLeft + fw / 2, frameTop + fh / 2, Math.min(fw, fh) / 2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (frameSpec.shape === "rounded") {
    const radius = (Math.min(fw, fh) / 2) * ((frameSpec.radiusPct ?? 24) / 100);
    ctx.beginPath();
    ctx.roundRect(frameLeft, frameTop, fw, fh, radius);
    ctx.stroke();
  } else {
    ctx.strokeRect(frameLeft + 1, frameTop + 1, fw - 2, fh - 2);
  }
  ctx.restore();
}
