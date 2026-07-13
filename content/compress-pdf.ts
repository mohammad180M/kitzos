import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF",
    description:
      "Select or drop a PDF file. The tool shows the original file size before compression.",
  },
  {
    title: "Choose a compression mode",
    description:
      "Optimize re-saves the PDF structure for modest gains while keeping text selectable. Strong rasterizes pages for maximum reduction.",
  },
  {
    title: "Compare and download",
    description:
      "Review original vs compressed size and percentage saved. Download the smaller file, or keep the original if compression did not help.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is the difference between Optimize and Strong?",
    answer:
      "Optimize adjusts PDF structure without changing page content. Strong renders each page as a JPEG image, which shrinks scans but removes selectable text.",
  },
  {
    question: "Why is my compressed file sometimes larger?",
    answer:
      "Text-only or already-optimized PDFs may grow when rasterized. The tool warns you and lets you keep the original.",
  },
  {
    question: "Does my PDF leave my device?",
    answer:
      "No. Compression runs on your own device inside the browser — the file you shrink never leaves your machine.",
  },
  {
    question: "Which mode should I use for scanned documents?",
    answer:
      "Strong mode with Medium or Low quality usually gives the biggest size reduction on image-heavy PDFs.",
  },
];
