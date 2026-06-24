import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF files",
    description:
      "Click the upload area or drag and drop multiple PDF files. You can add as many documents as you need to combine.",
  },
  {
    title: "Reorder the files",
    description:
      "Drag files up or down to set the order they will appear in the merged PDF. The first file in the list becomes the first pages.",
  },
  {
    title: "Merge and download",
    description:
      "Click Merge PDF to combine all files into one document. Your merged PDF downloads instantly — nothing is sent to a server.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Is it safe to merge PDFs online with kitzos?",
    answer:
      "Yes. All processing happens in your browser using pdf-lib. Your files never leave your device and are not uploaded to any server.",
  },
  {
    question: "How many PDF files can I merge at once?",
    answer:
      "There is no hard limit, but very large files or dozens of documents may slow down your browser depending on available memory.",
  },
  {
    question: "Will the merged PDF keep the original quality?",
    answer:
      "Yes. Merging combines the original page content without re-compressing images, so quality stays the same as your source files.",
  },
  {
    question: "Can I merge password-protected PDFs?",
    answer:
      "Password-protected PDFs must be unlocked before merging. This tool does not support encrypted files.",
  },
];
