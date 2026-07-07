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
    question: "Are files sent to a server?",
    answer:
      "No. Reordering and deletion are applied locally with pdf-lib and pdf.js in your browser.",
  },
  {
    question: "What happens if I delete every page?",
    answer:
      "Export is blocked until at least one page remains in the document.",
  },
];
