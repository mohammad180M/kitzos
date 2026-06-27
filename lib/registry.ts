import type { CategoryId } from "./categories";
import { sortToolsByCategory } from "./tool-order";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  category: CategoryId;
  icon: string;
  keywords: string[];
  isNew?: boolean;
}

const toolDefinitions: Tool[] = [
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
    slug: "jwt-decoder",
    title: "JWT Decoder",
    description:
      "Decode and inspect JSON Web Tokens. View header, payload, and signature instantly in your browser. No data leaves your device.",
    category: "dev",
    icon: "FileKey",
    keywords: ["jwt decoder", "decode jwt", "jwt parser", "json web token decoder"],
    isNew: true,
  },
  {
    slug: "csv-json-converter",
    title: "CSV ↔ JSON Converter",
    description:
      "Convert CSV to JSON and JSON to CSV instantly in your browser. Paste data or upload a file. Nothing is uploaded to a server.",
    category: "dev",
    icon: "Table2",
    keywords: ["csv to json", "json to csv", "csv json converter", "convert csv"],
    isNew: true,
  },
  {
    slug: "regex-tester",
    title: "Regex Tester",
    description:
      "Test and debug regular expressions with live highlighting. See matches and groups as you type. Runs entirely in your browser.",
    category: "dev",
    icon: "Regex",
    keywords: ["regex tester", "regular expression tester", "regex debugger", "test regex online"],
    isNew: true,
  },
  {
    slug: "bmi-calculator",
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index from height and weight. Supports metric and imperial units.",
    category: "calculators",
    icon: "Scale",
    keywords: ["bmi calculator", "body mass index", "bmi chart", "weight calculator", "health calculator"],
  },
  {
    slug: "calorie-calculator",
    title: "Calorie Calculator",
    description: "Estimate daily calories using the Mifflin-St Jeor equation. BMR and TDEE for maintain, lose, or gain.",
    category: "calculators",
    icon: "Flame",
    keywords: ["calorie calculator", "tdee calculator", "bmr calculator", "daily calories", "calorie deficit"],
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Find percentages, percent of a number, and percentage increase or decrease between values.",
    category: "calculators",
    icon: "Percent",
    keywords: ["percentage calculator", "percent of", "percentage increase", "percentage decrease", "percent change"],
  },
  {
    slug: "loan-calculator",
    title: "Loan Calculator",
    description: "Calculate monthly payments, total interest, and total cost for fixed-rate loans.",
    category: "calculators",
    icon: "Landmark",
    keywords: ["loan calculator", "mortgage calculator", "monthly payment", "amortization", "interest calculator"],
  },
  {
    slug: "due-date-calculator",
    title: "Due Date Calculator",
    description: "Estimate pregnancy due date from your last menstrual period and see current pregnancy week.",
    category: "calculators",
    icon: "CalendarHeart",
    keywords: ["due date calculator", "pregnancy due date", "pregnancy week", "lmp calculator", "edd calculator"],
  },
  {
    slug: "date-difference",
    title: "Date Difference Calculator",
    description: "Find the difference between two dates in days, weeks, months, and years. Count days until or since a date.",
    category: "calculators",
    icon: "CalendarRange",
    keywords: ["date difference", "days between dates", "days until", "days since", "date calculator"],
  },
  {
    slug: "unit-converter",
    title: "Unit Converter",
    description: "Convert length, weight, temperature, area, and volume between common units instantly.",
    category: "converters",
    icon: "Ruler",
    keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "metric converter"],
  },
  {
    slug: "gradient-generator",
    title: "CSS Gradient Generator",
    description: "Create linear and radial CSS gradients with a live preview and copy-ready code.",
    category: "image",
    icon: "Blend",
    keywords: ["gradient generator", "css gradient", "linear gradient", "radial gradient", "color gradient"],
  },
  {
    slug: "pomodoro-timer",
    title: "Pomodoro Timer",
    description: "Focus timer with work and break cycles. Customizable durations, cycle counter, and sound alerts.",
    category: "misc",
    icon: "Timer",
    keywords: ["pomodoro timer", "focus timer", "productivity timer", "work break timer", "pomodoro technique"],
  },
  {
    slug: "random-picker",
    title: "Random Picker & Number Generator",
    description: "Pick a random name or option from a list, or generate a random number in any range.",
    category: "misc",
    icon: "Shuffle",
    keywords: ["random picker", "random name picker", "random number generator", "wheel picker", "lottery picker"],
  },
  {
    slug: "typing-speed-test",
    title: "Typing Speed Test",
    description: "Measure your typing speed in WPM and accuracy with a live typing test.",
    category: "misc",
    icon: "Keyboard",
    keywords: ["typing speed test", "wpm test", "typing test", "words per minute", "typing accuracy"],
  },
  {
    slug: "online-notepad",
    title: "Online Notepad",
    description: "A simple notepad that auto-saves to your browser. Word and character count included.",
    category: "misc",
    icon: "NotebookPen",
    keywords: ["online notepad", "web notepad", "notes app", "auto save notepad", "simple notepad"],
  },
  {
    slug: "mp3-cutter",
    title: "MP3 Cutter Online",
    description: "Cut and trim audio files in your browser. Export as MP3 or WAV — no upload required.",
    category: "audio",
    icon: "Scissors",
    keywords: ["mp3 cutter online", "cut mp3", "trim audio", "audio trimmer", "mp3 editor"],
  },
  {
    slug: "audio-converter",
    title: "Audio Converter",
    description: "Convert WAV to MP3 and other audio formats locally using Web Audio API.",
    category: "audio",
    icon: "ArrowLeftRight",
    keywords: ["wav to mp3 converter", "audio converter", "convert wav to mp3", "mp3 converter online"],
  },
  {
    slug: "audio-merger",
    title: "Audio Merger",
    description: "Merge multiple audio files into one track. Combine clips in order and download.",
    category: "audio",
    icon: "Files",
    keywords: ["merge audio files", "combine audio", "join mp3 files", "audio joiner online"],
  },
  {
    slug: "voice-recorder",
    title: "Online Voice Recorder",
    description: "Record voice from your microphone and download instantly. Private browser recording.",
    category: "audio",
    icon: "Mic",
    keywords: ["online voice recorder", "record audio online", "microphone recorder", "voice memo online"],
  },
  {
    slug: "image-to-text",
    title: "Image to Text — Extract Text from Images (OCR)",
    description:
      "Convert image to text for free. Extract Arabic and English text from images right in your browser. No upload, no sign-up, no limits — fully private.",
    category: "vision",
    icon: "ScanLine",
    keywords: [
      "image to text",
      "convert image to text",
      "extract text from image",
      "ocr online free",
      "arabic ocr",
      "image to text ocr",
    ],
  },
  {
    slug: "pdf-sign",
    title: "Sign PDF Online",
    description: "Draw your signature and stamp it on a PDF document. No account or upload to servers.",
    category: "pdf",
    icon: "PenLine",
    keywords: ["sign pdf online", "pdf signature", "electronic signature pdf", "e-sign pdf"],
  },
  {
    slug: "pdf-watermark",
    title: "Add Watermark to PDF",
    description: "Add a text watermark to every page of your PDF. Adjust opacity before downloading.",
    category: "pdf",
    icon: "Droplets",
    keywords: ["add watermark to pdf", "pdf watermark", "stamp pdf", "watermark pdf online"],
  },
  {
    slug: "pdf-protect",
    title: "Password Protect PDF",
    description: "Encrypt a PDF with a password. Lock your document before sharing.",
    category: "pdf",
    icon: "Lock",
    keywords: ["password protect pdf", "encrypt pdf", "lock pdf", "pdf password online"],
  },
  {
    slug: "exif-remover",
    title: "Remove EXIF Data",
    description: "Strip GPS, camera, and metadata from photos by re-exporting through canvas.",
    category: "image",
    icon: "Eraser",
    keywords: ["remove exif data", "strip metadata", "remove photo metadata", "exif remover"],
  },
  {
    slug: "og-image-generator",
    title: "Open Graph Image Generator",
    description: "Create 1200×630 OG images for social sharing with custom title and colors.",
    category: "dev",
    icon: "Share2",
    keywords: ["open graph image generator", "og image maker", "social preview image", "og card generator"],
  },
  {
    slug: "favicon-generator",
    title: "Favicon Generator",
    description: "Generate favicon PNGs in multiple sizes from one image and download as ZIP.",
    category: "dev",
    icon: "AppWindow",
    keywords: ["favicon generator", "favicon maker", "icon generator", "site icon generator"],
  },
  {
    slug: "svg-pattern-generator",
    title: "SVG Pattern Generator",
    description: "Create repeating SVG background patterns and copy the CSS code.",
    category: "dev",
    icon: "Shapes",
    keywords: ["svg pattern generator", "css background pattern", "repeating pattern svg"],
  },
  {
    slug: "box-shadow-generator",
    title: "Box Shadow Generator",
    description: "Design CSS box shadows with live preview and copy ready-to-use code.",
    category: "dev",
    icon: "Box",
    keywords: ["box shadow generator", "css shadow generator", "drop shadow css"],
  },
  {
    slug: "meme-generator",
    title: "Meme Generator",
    description: "Add top and bottom text to any image. Classic meme layout, export as PNG.",
    category: "image",
    icon: "Smile",
    keywords: ["meme generator", "meme maker", "add text to image meme", "meme creator online"],
  },
  {
    slug: "signature-pad",
    title: "Signature Generator PNG",
    description: "Draw a transparent signature and download as PNG for documents and forms.",
    category: "dev",
    icon: "PenLine",
    keywords: ["signature generator png", "draw signature online", "transparent signature", "signature pad"],
  },
  {
    slug: "color-palette-generator",
    title: "Color Palette Generator",
    description: "Generate complementary, analogous, and triadic color palettes from a base color.",
    category: "dev",
    icon: "Paintbrush",
    keywords: ["color palette generator", "color scheme generator", "complementary colors", "palette maker"],
  },
  {
    slug: "glassmorphism-generator",
    title: "Glassmorphism Generator",
    description: "Design frosted-glass CSS effects with live preview. Copy blur, border, and background code.",
    category: "dev",
    icon: "Sparkles",
    keywords: ["glassmorphism generator", "glass effect css", "frosted glass css", "glassmorphism css"],
  },
  {
    slug: "certificate-generator",
    title: "Certificate Generator",
    description:
      "Create a professional achievement or project certificate. Customize text, colors, and logo with a live preview, then download as PNG or PDF. Runs entirely in your browser.",
    category: "misc",
    icon: "Award",
    keywords: [
      "certificate generator",
      "achievement certificate maker",
      "project certificate",
      "certificate template",
      "download certificate pdf",
    ],
    isNew: true,
  },
  {
    slug: "interaction-fx",
    title: "Click Ripple Effect Generator",
    description: "Preview material-style ripple clicks and export CSS + JS using Pointer Events.",
    category: "misc",
    icon: "MousePointer",
    keywords: ["click ripple effect", "ripple animation css", "material ripple", "button click effect"],
  },
];

export const tools = sortToolsByCategory(toolDefinitions);

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
