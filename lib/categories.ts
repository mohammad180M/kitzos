export type CategoryId = "pdf" | "image" | "text" | "dev";

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
];

export function getCategoryById(id: CategoryId): Category | undefined {
  return categories.find((c) => c.id === id);
}
