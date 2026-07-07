export type PageSize = "a4" | "letter" | "fit";
export type Orientation = "auto" | "portrait" | "landscape";
export type Margin = "none" | "small" | "normal";

const A4 = { width: 595.28, height: 841.89 };
const LETTER = { width: 612, height: 792 };
const MARGIN_PT: Record<Margin, number> = { none: 0, small: 18, normal: 36 };

const PREVIEW_SCALE = 0.45;

function resolvePageDimensions(
  pageSize: PageSize,
  imageW: number,
  imageH: number,
  orientation: Orientation
): { width: number; height: number } {
  if (pageSize === "fit") return { width: imageW, height: imageH };
  const base = pageSize === "a4" ? A4 : LETTER;
  let width = base.width;
  let height = base.height;
  const landscape =
    orientation === "landscape" || (orientation === "auto" && imageW > imageH);
  if (landscape) {
    width = base.height;
    height = base.width;
  }
  return { width, height };
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported.");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const url = canvas.toDataURL("image/jpeg", 0.92);
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed."));
      img.src = url;
    });
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed."));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function renderImagePdfPagePreview(
  file: File,
  options: { pageSize: PageSize; orientation: Orientation; margin: Margin }
): Promise<string> {
  const img = await loadImageElement(file);
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const { width: pageW, height: pageH } = resolvePageDimensions(
    options.pageSize,
    imgW,
    imgH,
    options.orientation
  );
  const marginPt = MARGIN_PT[options.margin];
  const maxW = pageW - marginPt * 2;
  const maxH = pageH - marginPt * 2;
  const scale = Math.min(maxW / imgW, maxH / imgH, 1);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(pageW * PREVIEW_SCALE);
  canvas.height = Math.round(pageH * PREVIEW_SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const s = PREVIEW_SCALE;
  ctx.drawImage(img, x * s, y * s, drawW * s, drawH * s);
  return canvas.toDataURL("image/jpeg", 0.85);
}
