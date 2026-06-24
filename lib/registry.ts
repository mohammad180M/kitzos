import type { CategoryId } from "./categories";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  category: CategoryId;
  icon: string;
  keywords: string[];
  isNew?: boolean;
}

export const tools: Tool[] = [
  {
    slug: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document. Drag to reorder pages.",
    category: "pdf",
    icon: "Files",
    keywords: ["merge pdf", "combine pdf", "join pdf", "pdf merger", "pdf combiner"],
  },
  {
    slug: "split-pdf",
    title: "Split PDF",
    description: "Split a PDF into separate files by page ranges or individual pages.",
    category: "pdf",
    icon: "Scissors",
    keywords: ["split pdf", "extract pdf pages", "pdf splitter", "separate pdf pages"],
  },
  {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images. Download a single page or all pages as a zip.",
    category: "pdf",
    icon: "FileImage",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpeg", "pdf page to image"],
  },
  {
    slug: "compress-image",
    title: "Compress Image",
    description: "Reduce JPG and PNG file size with adjustable quality. No upload required.",
    category: "image",
    icon: "Minimize2",
    keywords: ["compress image", "reduce image size", "jpg compressor", "png compressor", "optimize image"],
  },
  {
    slug: "image-resizer",
    title: "Image Resizer",
    description: "Resize images to exact pixel dimensions with optional aspect ratio lock.",
    category: "image",
    icon: "Scaling",
    keywords: ["resize image", "image resizer", "scale image", "change image dimensions"],
  },
  {
    slug: "crop-image",
    title: "Crop Image",
    description: "Crop images with a draggable selection and optional fixed aspect ratios.",
    category: "image",
    icon: "Crop",
    keywords: ["crop image", "image cropper", "trim image", "cut image"],
  },
  {
    slug: "image-converter",
    title: "Image Converter",
    description: "Convert images between PNG, JPG, and WebP formats in your browser.",
    category: "image",
    icon: "ArrowLeftRight",
    keywords: ["image converter", "png to jpg", "jpg to png", "webp converter", "convert image format"],
  },
  {
    slug: "word-counter",
    title: "Word Counter",
    description: "Count words, characters, sentences, paragraphs, and estimated reading time.",
    category: "text",
    icon: "Hash",
    keywords: ["word counter", "character count", "text counter", "reading time"],
  },
  {
    slug: "case-converter",
    title: "Case Converter",
    description: "Convert text to uppercase, lowercase, title case, camelCase, and more.",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["case converter", "uppercase", "lowercase", "title case", "camelcase", "snake case"],
  },
  {
    slug: "password-generator",
    title: "Password Generator",
    description: "Create strong random passwords with customizable length and character sets.",
    category: "text",
    icon: "KeyRound",
    keywords: ["password generator", "random password", "secure password", "strong password"],
  },
  {
    slug: "markdown-to-html",
    title: "Markdown to HTML",
    description: "Convert Markdown to HTML with a live preview and copy-ready output.",
    category: "text",
    icon: "FileCode",
    keywords: ["markdown to html", "md to html", "markdown converter", "markdown preview"],
  },
  {
    slug: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder paragraphs, sentences, or words for mockups and drafts.",
    category: "text",
    icon: "TextQuote",
    keywords: ["lorem ipsum", "placeholder text", "dummy text", "lorem generator"],
  },
  {
    slug: "text-diff-checker",
    title: "Text Diff Checker",
    description: "Compare two texts side by side with highlighted additions and deletions.",
    category: "text",
    icon: "GitCompare",
    keywords: ["text diff", "compare text", "diff checker", "text comparison"],
  },
  {
    slug: "remove-line-breaks",
    title: "Remove Line Breaks",
    description: "Clean up text by removing line breaks, extra spaces, or converting breaks to spaces.",
    category: "text",
    icon: "WrapText",
    keywords: ["remove line breaks", "delete line breaks", "clean text", "remove newlines"],
  },
  {
    slug: "qr-code-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from text or URLs. Download as PNG or SVG.",
    category: "dev",
    icon: "QrCode",
    keywords: ["qr code generator", "qr code maker", "create qr code", "qr code download"],
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Format, validate, and minify JSON with clear error messages.",
    category: "dev",
    icon: "Braces",
    keywords: ["json formatter", "json beautifier", "json validator", "json minify"],
  },
  {
    slug: "base64",
    title: "Base64 Encoder / Decoder",
    description: "Encode and decode text or images to Base64. Works entirely offline.",
    category: "dev",
    icon: "Binary",
    keywords: ["base64 encoder", "base64 decoder", "base64 converter", "image to base64"],
  },
  {
    slug: "color-picker",
    title: "Color Picker",
    description: "Pick a color and convert between HEX, RGB, and HSL formats.",
    category: "dev",
    icon: "Palette",
    keywords: ["color picker", "hex to rgb", "rgb to hex", "hsl converter", "color converter"],
  },
  {
    slug: "timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert Unix timestamps to dates and back. Supports seconds and milliseconds.",
    category: "dev",
    icon: "Clock",
    keywords: ["timestamp converter", "unix timestamp", "epoch converter", "date to timestamp"],
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text.",
    category: "dev",
    icon: "Fingerprint",
    keywords: ["hash generator", "md5 hash", "sha256", "sha512", "checksum"],
  },
  {
    slug: "bmi-calculator",
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index from height and weight. Supports metric and imperial units.",
    category: "calculators",
    icon: "Scale",
    keywords: ["bmi calculator", "body mass index", "bmi chart", "weight calculator", "health calculator"],
    isNew: true,
  },
  {
    slug: "calorie-calculator",
    title: "Calorie Calculator",
    description: "Estimate daily calories using the Mifflin-St Jeor equation. BMR and TDEE for maintain, lose, or gain.",
    category: "calculators",
    icon: "Flame",
    keywords: ["calorie calculator", "tdee calculator", "bmr calculator", "daily calories", "calorie deficit"],
    isNew: true,
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Find percentages, percent of a number, and percentage increase or decrease between values.",
    category: "calculators",
    icon: "Percent",
    keywords: ["percentage calculator", "percent of", "percentage increase", "percentage decrease", "percent change"],
    isNew: true,
  },
  {
    slug: "loan-calculator",
    title: "Loan Calculator",
    description: "Calculate monthly payments, total interest, and total cost for fixed-rate loans.",
    category: "calculators",
    icon: "Landmark",
    keywords: ["loan calculator", "mortgage calculator", "monthly payment", "amortization", "interest calculator"],
    isNew: true,
  },
  {
    slug: "due-date-calculator",
    title: "Due Date Calculator",
    description: "Estimate pregnancy due date from your last menstrual period and see current pregnancy week.",
    category: "calculators",
    icon: "CalendarHeart",
    keywords: ["due date calculator", "pregnancy due date", "pregnancy week", "lmp calculator", "edd calculator"],
    isNew: true,
  },
  {
    slug: "date-difference",
    title: "Date Difference Calculator",
    description: "Find the difference between two dates in days, weeks, months, and years. Count days until or since a date.",
    category: "calculators",
    icon: "CalendarRange",
    keywords: ["date difference", "days between dates", "days until", "days since", "date calculator"],
    isNew: true,
  },
  {
    slug: "unit-converter",
    title: "Unit Converter",
    description: "Convert length, weight, temperature, area, and volume between common units instantly.",
    category: "converters",
    icon: "Ruler",
    keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "metric converter"],
    isNew: true,
  },
  {
    slug: "gradient-generator",
    title: "CSS Gradient Generator",
    description: "Create linear and radial CSS gradients with a live preview and copy-ready code.",
    category: "image",
    icon: "Blend",
    keywords: ["gradient generator", "css gradient", "linear gradient", "radial gradient", "color gradient"],
    isNew: true,
  },
  {
    slug: "pomodoro-timer",
    title: "Pomodoro Timer",
    description: "Focus timer with work and break cycles. Customizable durations, cycle counter, and sound alerts.",
    category: "misc",
    icon: "Timer",
    keywords: ["pomodoro timer", "focus timer", "productivity timer", "work break timer", "pomodoro technique"],
    isNew: true,
  },
  {
    slug: "random-picker",
    title: "Random Picker & Number Generator",
    description: "Pick a random name or option from a list, or generate a random number in any range.",
    category: "misc",
    icon: "Shuffle",
    keywords: ["random picker", "random name picker", "random number generator", "wheel picker", "lottery picker"],
    isNew: true,
  },
  {
    slug: "typing-speed-test",
    title: "Typing Speed Test",
    description: "Measure your typing speed in WPM and accuracy with a live typing test.",
    category: "misc",
    icon: "Keyboard",
    keywords: ["typing speed test", "wpm test", "typing test", "words per minute", "typing accuracy"],
    isNew: true,
  },
  {
    slug: "online-notepad",
    title: "Online Notepad",
    description: "A simple notepad that auto-saves to your browser. Word and character count included.",
    category: "misc",
    icon: "NotebookPen",
    keywords: ["online notepad", "web notepad", "notes app", "auto save notepad", "simple notepad"],
    isNew: true,
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: CategoryId): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;

  return tools.filter((tool) => {
    const haystack = [
      tool.title,
      tool.description,
      tool.category,
      ...tool.keywords,
    ]
      .join(" ")
      .toLowerCase();

    const terms = q.split(/\s+/);
    return terms.every((term) => haystack.includes(term));
  });
}
