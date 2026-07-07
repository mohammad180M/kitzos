import { canvasToBlob } from "@/lib/canvas-utils";

const MAX_SIGNATURE_BYTES = 10 * 1024 * 1024;

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image."));
    };
    img.src = url;
  });
}

/** Chroma-key near-white pixels to transparent (tolerance per channel, 0–255). */
export function removeNearWhitePixels(imageData: ImageData, tolerance: number): void {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance) {
      data[i + 3] = 0;
    }
  }
}

export async function normalizeImageToPng(
  file: File,
  options?: { removeWhiteBackground?: boolean; tolerance?: number }
): Promise<{ blob: Blob; aspectRatio: number }> {
  if (file.size > MAX_SIGNATURE_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const img = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  ctx.drawImage(img, 0, 0);

  if (options?.removeWhiteBackground) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    removeNearWhitePixels(imageData, options.tolerance ?? 28);
    ctx.putImageData(imageData, 0, 0);
  }

  const blob = await canvasToBlob(canvas, "image/png");
  return { blob, aspectRatio: canvas.width / canvas.height };
}

export function canvasHasInk(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) return true;
  }
  return false;
}

/** Export signature pad at 2× logical resolution for sharp embedding. */
export async function exportPadAt2x(
  canvas: HTMLCanvasElement,
  logicalW: number,
  logicalH: number
): Promise<Blob> {
  const out = document.createElement("canvas");
  out.width = logicalW * 2;
  out.height = logicalH * 2;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, logicalW * 2, logicalH * 2);
  return canvasToBlob(out, "image/png");
}

export interface SignaturePlacement {
  xRatio: number;
  yRatio: number;
  widthRatio: number;
}

/** Convert top-left ratios to pdf-lib bottom-left coordinates. */
export function placementToPdfCoords(
  placement: SignaturePlacement,
  pageW: number,
  pageH: number,
  sigAspectRatio: number
): { x: number; y: number; width: number; height: number } {
  const width = placement.widthRatio * pageW;
  const height = width / sigAspectRatio;
  const x = placement.xRatio * pageW;
  const y = pageH - placement.yRatio * pageH - height;
  return { x, y, width, height };
}

export const DEFAULT_PLACEMENT: SignaturePlacement = {
  xRatio: 0.58,
  yRatio: 0.78,
  widthRatio: 0.28,
};
