import type { CategoryId } from "./categories";
import { categories } from "./categories";

type SortableTool = { slug: string; category: CategoryId };

const CATEGORY_SLUG_ORDER: Record<CategoryId, string[]> = {
  pdf: [
    "merge-pdf",
    "split-pdf",
    "pdf-to-jpg",
    "compress-pdf",
    "rotate-pdf",
    "organize-pdf",
    "extract-pages",
    "pdf-sign",
    "pdf-watermark",
    "pdf-protect",
  ],
  image: [
    "compress-image",
    "image-resizer",
    "crop-image",
    "image-converter",
    "heic-to-jpg",
    "flip-image",
    "image-rotator",
    "blur-image",
    "image-watermark",
    "add-text-to-image",
    "image-collage",
    "passport-photo",
    "gif-maker",
    "image-color-picker",
    "exif-remover",
  ],
  text: [
    "word-counter",
    "case-converter",
    "password-generator",
    "find-and-replace",
    "remove-line-breaks",
    "markdown-to-html",
    "lorem-ipsum-generator",
    "text-diff-checker",
    "slug-generator",
    "arabic-diacritics-remover",
    "line-sorter",
    "word-frequency-counter",
    "online-notepad",
    "text-reverser",
    "text-to-ascii-art",
    "character-map",
  ],
  dev: [
    "qr-code-generator",
    "barcode-generator",
    "json-formatter",
    "base64",
    "hash-generator",
    "uuid-generator",
    "color-picker",
    "color-code-converter",
    "color-palette-generator",
    "regex-tester",
    "jwt-decoder",
    "csv-json-converter",
    "json-to-typescript",
    "url-encoder-decoder",
    "css-minifier",
    "js-minifier",
    "xml-formatter",
    "sql-formatter",
    "gradient-generator",
    "box-shadow-generator",
    "glassmorphism-generator",
    "svg-pattern-generator",
    "og-image-generator",
    "favicon-generator",
    "meta-tag-generator",
    "interaction-fx",
    "htaccess-redirect-generator",
    "cron-expression-parser",
    "lorem-picsum-placeholder",
  ],
  calculators: [
    "percentage-calculator",
    "tip-calculator",
    "discount-calculator",
    "bmi-calculator",
    "calorie-calculator",
    "loan-calculator",
    "mortgage-calculator",
    "compound-interest",
    "age-calculator",
    "date-difference",
    "due-date-calculator",
    "gpa-calculator",
    "fuel-cost-calculator",
    "aspect-ratio-calculator",
  ],
  converters: [
    "unit-converter",
    "temperature-converter",
    "cooking-converter",
    "data-unit-converter",
    "file-size-converter",
    "roman-numeral-converter",
    "number-to-words",
    "hijri-gregorian-converter",
    "timestamp-converter",
    "number-base-converter",
  ],
  misc: ["pomodoro-timer", "stopwatch-timer", "random-picker", "typing-speed-test", "signature-pad"],
  audio: ["mp3-cutter", "audio-converter", "audio-merger", "voice-recorder"],
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
