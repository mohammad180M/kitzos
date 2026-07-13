import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF",
    description: "Select or drop a PDF. Page thumbnails appear in the preview pane.",
  },
  {
    title: "Select pages",
    description:
      "Click thumbnails to select pages, or type a range like 1-3, 7. Use Select all or Clear to manage the selection quickly.",
  },
  {
    title: "Choose output and download",
    description:
      "Export selected pages as one PDF in original order, or download each page as a separate PDF in a ZIP file.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How is this different from Split PDF?",
    answer:
      "Split PDF cuts a document into parts by ranges (e.g. pages 1–3 as one file, 4–6 as another). Extract pages lets you cherry-pick any specific pages — like 2, 4, and 7 — into a new PDF or separate files.",
  },
  {
    question: "Is the original PDF modified?",
    answer: "No. A new PDF (or ZIP of PDFs) is created. Your original file stays unchanged.",
  },
  {
    question: "Is my file uploaded?",
    answer:
      "No. Selected pages are copied into a new PDF on your device — the source file never leaves your browser.",
  },
  {
    question: "What order are extracted pages saved in?",
    answer: "Pages are always exported in their original document order, regardless of selection order.",
  },
];
