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
    isNew: true,
  },
  {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images. Download a single page or all pages as a zip.",
    category: "pdf",
    icon: "FileImage",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpeg", "pdf page to image"],
    isNew: true,
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
    isNew: true,
  },
  {
    slug: "image-converter",
    title: "Image Converter",
    description: "Convert images between PNG, JPG, and WebP formats in your browser.",
    category: "image",
    icon: "ArrowLeftRight",
    keywords: ["image converter", "png to jpg", "jpg to png", "webp converter", "convert image format"],
    isNew: true,
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
    isNew: true,
  },
  {
    slug: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder paragraphs, sentences, or words for mockups and drafts.",
    category: "text",
    icon: "TextQuote",
    keywords: ["lorem ipsum", "placeholder text", "dummy text", "lorem generator"],
    isNew: true,
  },
  {
    slug: "text-diff-checker",
    title: "Text Diff Checker",
    description: "Compare two texts side by side with highlighted additions and deletions.",
    category: "text",
    icon: "GitCompare",
    keywords: ["text diff", "compare text", "diff checker", "text comparison"],
    isNew: true,
  },
  {
    slug: "remove-line-breaks",
    title: "Remove Line Breaks",
    description: "Clean up text by removing line breaks, extra spaces, or converting breaks to spaces.",
    category: "text",
    icon: "WrapText",
    keywords: ["remove line breaks", "delete line breaks", "clean text", "remove newlines"],
    isNew: true,
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
    isNew: true,
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text.",
    category: "dev",
    icon: "Fingerprint",
    keywords: ["hash generator", "md5 hash", "sha256", "sha512", "checksum"],
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
