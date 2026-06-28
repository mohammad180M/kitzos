import type { CategoryId } from "./categories";
import { categories } from "./categories";

type SortableTool = { slug: string; category: CategoryId };

const CATEGORY_SLUG_ORDER: Record<CategoryId, string[]> = {
  pdf: ["merge-pdf", "split-pdf", "pdf-to-jpg", "pdf-sign", "pdf-watermark", "pdf-protect"],
  image: [
    "compress-image",
    "image-resizer",
    "crop-image",
    "image-converter",
    "gradient-generator",
    "exif-remover",
    "meme-generator",
    "image-rotator",
    "add-text-to-image",
    "image-collage",
    "pixelate-image",
    "image-to-ascii",
    "image-border-adder",
  ],
  text: [
    "word-counter",
    "case-converter",
    "password-generator",
    "markdown-to-html",
    "lorem-ipsum-generator",
    "text-diff-checker",
    "remove-line-breaks",
    "word-frequency-counter",
    "arabic-diacritics-remover",
    "line-sorter",
    "text-reverser",
    "slug-generator",
    "find-and-replace",
    "whitespace-remover",
    "text-to-ascii-art",
    "character-map",
  ],
  dev: [
    "qr-code-generator",
    "json-formatter",
    "base64",
    "color-picker",
    "timestamp-converter",
    "hash-generator",
    "jwt-decoder",
    "csv-json-converter",
    "regex-tester",
    "og-image-generator",
    "favicon-generator",
    "svg-pattern-generator",
    "box-shadow-generator",
    "signature-pad",
    "color-palette-generator",
    "glassmorphism-generator",
    "css-minifier",
    "js-minifier",
    "xml-formatter",
    "sql-formatter",
    "url-encoder-decoder",
    "uuid-generator",
    "cron-expression-parser",
    "color-code-converter",
    "meta-tag-generator",
    "htaccess-redirect-generator",
    "lorem-picsum-placeholder",
    "json-to-typescript",
  ],
  calculators: [
    "bmi-calculator",
    "calorie-calculator",
    "percentage-calculator",
    "loan-calculator",
    "due-date-calculator",
    "date-difference",
    "age-calculator",
    "tip-calculator",
    "gpa-calculator",
    "compound-interest",
    "mortgage-calculator",
    "fuel-cost-calculator",
    "discount-calculator",
    "aspect-ratio-calculator",
    "number-base-converter",
  ],
  converters: [
    "unit-converter",
    "roman-numeral-converter",
    "number-to-words",
    "file-size-converter",
    "temperature-converter",
    "data-unit-converter",
    "cooking-converter",
    "hijri-gregorian-converter",
  ],
  misc: [
    "pomodoro-timer",
    "random-picker",
    "typing-speed-test",
    "online-notepad",
    "interaction-fx",
    "barcode-generator",
    "stopwatch-timer",
    "certificate-generator",
  ],
  audio: ["mp3-cutter", "audio-converter", "audio-merger", "voice-recorder"],
  vision: ["image-to-text"],
};

export function sortToolsByCategory<T extends SortableTool>(tools: T[]): T[] {
  const categoryOrder = categories.map((c) => c.id);

  return [...tools].sort((a, b) => {
    const catCmp = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (catCmp !== 0) return catCmp;

    const order = CATEGORY_SLUG_ORDER[a.category];
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}
