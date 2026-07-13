import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF",
    description:
      "Select or drop a PDF. Page thumbnails appear in a grid showing the current order.",
  },
  {
    title: "Reorder and remove pages",
    description:
      "Drag thumbnails to reorder pages. Click the X on a page to mark it for deletion — use Undo to restore.",
  },
  {
    title: "Export the new PDF",
    description:
      "Click Download organized PDF to save a new file with your final page order. At least one page must remain.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Is the original PDF modified?",
    answer:
      "No. A new PDF is created with your chosen pages and order. Your original file is untouched.",
  },
  {
    question: "Can I undo a deleted page?",
    answer:
      "Yes. Each deleted page shows an Undo button until you export or clear the file.",
  },
  {
    question: "Does my document leave my device?",
    answer:
      "No. Reordering and deletions happen on your device inside the browser — the PDF stays local until you download the new file.",
  },
  {
    question: "What happens if I delete every page?",
    answer:
      "Export is blocked until at least one page remains in the document.",
  },
];
