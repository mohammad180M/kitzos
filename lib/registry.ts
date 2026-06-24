import type { CategoryId } from "./categories";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  category: CategoryId;
  icon: string;
  keywords: string[];
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
