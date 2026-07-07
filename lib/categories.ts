export type CategoryId =
  | "pdf"
  | "image"
  | "text"
  | "dev"
  | "calculators"
  | "converters"
  | "misc"
  | "audio"
  | "vision";

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "pdf",
    name: "PDF Tools",
    icon: "FileText",
    description: "Merge, split, and work with PDF files entirely in your browser.",
  },
  {
    id: "image",
    name: "Image Tools",
    icon: "Image",
    description: "Compress, resize, and optimize images without uploading to a server.",
  },
  {
    id: "text",
    name: "Text Tools",
    icon: "Type",
    description: "Count words, convert case, and transform text instantly.",
  },
  {
    id: "dev",
    name: "Developer Tools",
    icon: "Code",
    description: "Format JSON, encode Base64, generate QR codes, and more.",
  },
  {
    id: "calculators",
    name: "Calculators",
    icon: "Calculator",
    description: "Free online calculators for health, finance, dates, and more.",
  },
  {
    id: "converters",
    name: "Converters",
    icon: "ArrowLeftRight",
    description: "Convert units, measurements, and values instantly.",
  },
  {
    id: "misc",
    name: "Utilities",
    icon: "Sparkles",
    description: "Handy everyday utilities and productivity tools.",
  },
  {
    id: "audio",
    name: "Audio Tools",
    icon: "Mic",
    description: "Cut, convert, merge, and record audio entirely in your browser.",
  },
  {
    id: "vision",
    name: "Vision & OCR",
    icon: "ScanLine",
    description: "Extract text from images with optical character recognition.",
  },
];

export function getCategoryById(id: CategoryId): Category | undefined {
  return categories.find((c) => c.id === id);
}
