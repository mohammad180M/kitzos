export type TextOverlayFontId =
  | "archivo"
  | "plex-sans"
  | "plex-sans-arabic"
  | "plex-mono"
  | "arial"
  | "georgia"
  | "comic-sans"
  | "impact";

export interface TextOverlayFontOption {
  id: TextOverlayFontId;
  label: string;
  /** CSS font-family for <select> preview */
  cssFamily: string;
  /** Canvas 2D font-family fragment */
  canvasFamily: string;
}

export const TEXT_OVERLAY_FONTS: TextOverlayFontOption[] = [
  {
    id: "archivo",
    label: "Archivo",
    cssFamily: "var(--font-archivo), Archivo, sans-serif",
    canvasFamily: '"Archivo", sans-serif',
  },
  {
    id: "plex-sans",
    label: "IBM Plex Sans",
    cssFamily: "var(--font-plex-sans), 'IBM Plex Sans', sans-serif",
    canvasFamily: '"IBM Plex Sans", sans-serif',
  },
  {
    id: "plex-sans-arabic",
    label: "IBM Plex Sans Arabic",
    cssFamily: "var(--font-plex-arabic), 'IBM Plex Sans Arabic', sans-serif",
    canvasFamily: '"IBM Plex Sans Arabic", sans-serif',
  },
  {
    id: "plex-mono",
    label: "IBM Plex Mono",
    cssFamily: "var(--font-plex-mono), 'IBM Plex Mono', monospace",
    canvasFamily: '"IBM Plex Mono", monospace',
  },
  {
    id: "arial",
    label: "Arial",
    cssFamily: "Arial, sans-serif",
    canvasFamily: "Arial, sans-serif",
  },
  {
    id: "georgia",
    label: "Georgia",
    cssFamily: "Georgia, serif",
    canvasFamily: "Georgia, serif",
  },
  {
    id: "comic-sans",
    label: "Comic Sans MS",
    cssFamily: '"Comic Sans MS", cursive, sans-serif',
    canvasFamily: '"Comic Sans MS", cursive, sans-serif',
  },
  {
    id: "impact",
    label: "Impact",
    cssFamily: "Impact, Haettenschweiler, sans-serif",
    canvasFamily: "Impact, Haettenschweiler, sans-serif",
  },
];

export function getTextOverlayFont(id: TextOverlayFontId): TextOverlayFontOption {
  return TEXT_OVERLAY_FONTS.find((f) => f.id === id) ?? TEXT_OVERLAY_FONTS[1];
}

export function defaultFontForLocale(locale: string): TextOverlayFontId {
  return locale === "ar" ? "plex-sans-arabic" : "plex-sans";
}

export async function ensureTextOverlayFonts(
  layers: Array<{ fontFamily: TextOverlayFontId; fontSize: number }>,
  scale = 1
): Promise<void> {
  if (typeof document === "undefined") return;
  await document.fonts.ready;
  const loads: Promise<FontFace[]>[] = [];
  for (const layer of layers) {
    const family = getTextOverlayFont(layer.fontFamily).canvasFamily;
    const size = Math.max(8, Math.round(layer.fontSize * scale));
    loads.push(document.fonts.load(`bold ${size}px ${family}`));
  }
  await Promise.all(loads);
}
