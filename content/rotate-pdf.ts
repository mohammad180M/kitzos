import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF",
    description:
      "Select or drop a PDF file. The tool renders page thumbnails so you can see every page at a glance.",
  },
  {
    title: "Rotate pages",
    description:
      "Click the rotate button on any thumbnail to turn it 90°. Use Rotate all to apply the same turn to every page.",
  },
  {
    title: "Download the result",
    description:
      "Click Download rotated PDF. Existing page rotations are preserved and combined with your changes.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Does rotation affect PDF quality?",
    answer:
      "No. Pages are rotated without re-rendering content, so text and images stay sharp.",
  },
  {
    question: "Are my files uploaded?",
    answer:
      "No. Rotation runs locally in your browser using pdf-lib and pdf.js.",
  },
  {
    question: "What if a page was already rotated?",
    answer:
      "The tool reads the existing rotation and adds your turns on top, so the final angle is always correct.",
  },
  {
    question: "Can I rotate password-protected PDFs?",
    answer:
      "Encrypted PDFs must be unlocked first. This tool does not support password-protected files.",
  },
];
