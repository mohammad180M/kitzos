import {
  containsArabicScript,
  getWatermarkFont,
  type WatermarkFontMeta,
} from "@/lib/pdf/watermark-fonts";

const loadedFaces = new Set<string>();
const loadPromises = new Map<string, Promise<void>>();

export async function ensureWatermarkFontFace(font: WatermarkFontMeta): Promise<void> {
  if (typeof document === "undefined") return;
  if (loadedFaces.has(font.id)) return;
  const existing = loadPromises.get(font.id);
  if (existing) return existing;

  const promise = (async () => {
    const face = new FontFace(font.family, `url(${font.woff2})`, {
      weight: "400",
      style: "normal",
      display: "swap",
    });
    await face.load();
    document.fonts.add(face);
    loadedFaces.add(font.id);
  })();

  loadPromises.set(font.id, promise);
  try {
    await promise;
  } catch {
    loadPromises.delete(font.id);
    throw new Error(`Failed to load font ${font.id}`);
  }
}

export async function ensureWatermarkFontById(id: string): Promise<WatermarkFontMeta> {
  const font = getWatermarkFont(id);
  await ensureWatermarkFontFace(font);
  return font;
}

/** Fetch TTF bytes for pdf-lib embed — only at export time. */
export async function fetchWatermarkFontTtf(id: string): Promise<ArrayBuffer> {
  const font = getWatermarkFont(id);
  const res = await fetch(font.ttf);
  if (!res.ok) throw new Error(`Missing font file ${font.ttf}`);
  return res.arrayBuffer();
}

export function watermarkNeedsRasterPath(text: string): boolean {
  return containsArabicScript(text);
}
