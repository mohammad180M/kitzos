import { renderPdfPageToCanvas } from "./thumbnails";

export async function renderWatermarkPreview(
  file: File,
  pageIndex: number,
  options: { text: string; fontSize: number; opacity: number; tiled: boolean }
): Promise<string> {
  const canvas = await renderPdfPageToCanvas(file, pageIndex, { scale: 0.5 });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  const { text, fontSize, opacity, tiled } = options;
  const scale = 0.5;
  const size = fontSize * scale;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#808080";
  ctx.font = `bold ${size}px sans-serif`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-35 * Math.PI) / 180);

  const textWidth = ctx.measureText(text).width;

  if (!tiled) {
    ctx.fillText(text, -textWidth / 2, 0);
  } else {
    const stepX = textWidth + size;
    const stepY = size * 2.5;
    for (let y = -canvas.height; y < canvas.height; y += stepY) {
      for (let x = -canvas.width; x < canvas.width; x += stepX) {
        ctx.fillText(text, x - textWidth / 2, y);
      }
    }
  }

  ctx.restore();
  return canvas.toDataURL("image/jpeg", 0.85);
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
