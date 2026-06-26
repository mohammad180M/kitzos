const MIN_WIDTH_FOR_UPSCALE = 1500;
const UPSCALE_FACTOR = 2;
const DEFAULT_MAX_DIMENSION = 3000;

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
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function sourceSize(source: HTMLImageElement | HTMLCanvasElement): { width: number; height: number } {
  if (source instanceof HTMLImageElement) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  return { width: source.width, height: source.height };
}

export function rotateImageSource(
  source: HTMLImageElement | HTMLCanvasElement,
  degrees: number
): HTMLCanvasElement {
  const normalized = ((degrees % 360) + 360) % 360;
  const { width: srcW, height: srcH } = sourceSize(source);

  if (normalized === 0) {
    const canvas = document.createElement("canvas");
    canvas.width = srcW;
    canvas.height = srcH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(source, 0, 0);
    return canvas;
  }

  const rad = (normalized * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const width = Math.round(srcW * cos + srcH * sin);
  const height = Math.round(srcW * sin + srcH * cos);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.translate(width / 2, height / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -srcW / 2, -srcH / 2);
  return canvas;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toGrayscale(data: ImageData): Uint8Array {
  const gray = new Uint8Array(data.width * data.height);
  const { data: px, width, height } = data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      gray[y * width + x] = Math.round(
        px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114
      );
    }
  }
  return gray;
}

function enhanceContrast(gray: Uint8Array, factor: number): void {
  for (let i = 0; i < gray.length; i++) {
    gray[i] = clamp(Math.round((gray[i] - 128) * factor + 128), 0, 255);
  }
}

function computeOtsuThreshold(gray: Uint8Array): number {
  const hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;

  const total = gray.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) ** 2;
    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

function moderateThreshold(otsu: number): number {
  return clamp(otsu, 95, 165);
}

function applyBinaryThreshold(data: ImageData, gray: Uint8Array, threshold: number): void {
  const { data: px, width, height } = data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const g = gray[y * width + x];
      const v = g >= threshold ? 255 : 0;
      const i = (y * width + x) * 4;
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] = 255;
    }
  }
}

export interface PreprocessOptions {
  maxDimension?: number;
}

export function preprocessImageForOcr(
  source: HTMLImageElement | HTMLCanvasElement,
  options: PreprocessOptions = {}
): HTMLCanvasElement {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const { width: srcW, height: srcH } = sourceSize(source);

  let scale = srcW < MIN_WIDTH_FOR_UPSCALE ? UPSCALE_FACTOR : 1;
  let width = Math.round(srcW * scale);
  let height = Math.round(srcH * scale);

  const largest = Math.max(width, height);
  if (largest > maxDimension) {
    const cap = maxDimension / largest;
    width = Math.round(width * cap);
    height = Math.round(height * cap);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const gray = toGrayscale(imageData);
  enhanceContrast(gray, 1.25);
  const threshold = moderateThreshold(computeOtsuThreshold(gray));
  applyBinaryThreshold(imageData, gray, threshold);
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

export function prepareOcrCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  rotation: number,
  enhance: boolean,
  options?: PreprocessOptions
): HTMLCanvasElement {
  const rotated = rotateImageSource(source, rotation);
  if (!enhance) return rotated;
  return preprocessImageForOcr(rotated, options);
}
