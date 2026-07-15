import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync("public/fonts/watermark/catalog.json", "utf8"));
const licenses = fs.readFileSync("public/fonts/watermark/LICENSES.md", "utf8").trimEnd();
const extra = [
  "- **Literata** (`literata`): OFL",
  "- **EB Garamond** (`eb-garamond`): OFL",
  "- **JetBrains Mono** (`jetbrains-mono`): OFL",
  "- **Stardos Stencil** (`stardos-stencil`): OFL",
];
if (!licenses.includes("literata")) {
  fs.writeFileSync("public/fonts/watermark/LICENSES.md", `${licenses}\n${extra.join("\n")}\n`);
}

const body = `/**
 * Watermark font catalog — files in public/fonts/watermark/ (self-hosted).
 * WOFF2 for preview (FontFace); TTF for pdf-lib embed. Never import font files into JS chunks.
 */

export type WatermarkFontStyle =
  | "sans"
  | "serif"
  | "slab"
  | "mono"
  | "rounded"
  | "condensed"
  | "display"
  | "script"
  | "stencil";

export interface WatermarkFontMeta {
  id: string;
  label: string;
  family: string;
  style: WatermarkFontStyle;
  arabic: boolean;
  license: string;
  woff2: string;
  ttf: string;
}

export const WATERMARK_FONTS: WatermarkFontMeta[] = ${JSON.stringify(catalog, null, 2)} as WatermarkFontMeta[];

export function getWatermarkFont(id: string): WatermarkFontMeta {
  return WATERMARK_FONTS.find((f) => f.id === id) ?? WATERMARK_FONTS[0];
}

export function defaultWatermarkFontId(locale: string): string {
  return locale === "ar" ? "cairo" : "inter";
}

export function containsArabicScript(text: string): boolean {
  return /[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/.test(text);
}

export function fontsForPicker(locale: string, preferArabicCapable: boolean): WatermarkFontMeta[] {
  const arabic = WATERMARK_FONTS.filter((f) => f.arabic);
  const latin = WATERMARK_FONTS.filter((f) => !f.arabic);
  if (locale === "ar" || preferArabicCapable) return [...arabic, ...latin];
  return [...latin, ...arabic];
}
`;

fs.writeFileSync("lib/pdf/watermark-fonts.ts", body);
console.log("synced", catalog.length, "fonts");
