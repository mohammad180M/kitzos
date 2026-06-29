const ARABIC_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function containsArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

/** Latin/symbol segments figlet can render (Arabic stripped). */
export function extractLatinForFiglet(text: string): string {
  return text
    .replace(ARABIC_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasFigletableLatin(text: string): boolean {
  return /[A-Za-z0-9]/.test(extractLatinForFiglet(text));
}

export type AsciiInputMode = "empty" | "arabic-only" | "latin" | "mixed";

export function classifyAsciiInput(text: string): AsciiInputMode {
  const trimmed = text.trim();
  if (!trimmed) return "empty";
  const hasAr = containsArabic(trimmed);
  const latin = extractLatinForFiglet(trimmed);
  if (!latin && hasAr) return "arabic-only";
  if (!latin) return "empty";
  if (hasAr) return "mixed";
  return "latin";
}
