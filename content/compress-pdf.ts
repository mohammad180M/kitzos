import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF",
    description:
      "Select or drop a PDF file. The tool shows the original file size before compression.",
  },
  {
    title: "Choose a mode and settings",
    description:
      "Re-save & tidy keeps text selectable (size may shrink slightly or grow). Strong rasterizes pages to JPEG — pick size/quality and optional grayscale; a quick estimate runs first.",
  },
  {
    title: "Compare and download",
    description:
      "Review original vs compressed size and percentage saved. Download the smaller file, or keep the original if the result is larger.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is the difference between Re-save and Strong?",
    answer:
      "Re-save & tidy rewrites PDF structure without changing page content; size may shrink slightly or occasionally grow, and text stays selectable. Strong renders each page as a JPEG — useful for scans, but text is no longer selectable.",
  },
  {
    question: "Why does Strong mode warn that the file would grow?",
    answer:
      "Long text PDFs with shared fonts are already small per page. Full-page JPEGs can cost more. The tool samples pages first and warns before processing; try Smallest size and grayscale, or keep the original.",
  },
  {
    question: "Does my PDF leave my device?",
    answer:
      "No. Compression runs on your own device inside the browser — the file you shrink never leaves your machine.",
  },
  {
    question: "Which mode should I use for scanned documents?",
    answer:
      "Strong mode — Balanced or Smallest size, with grayscale when color is not needed — usually shrinks image-heavy scans the most.",
  },
];
