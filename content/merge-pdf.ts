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
    question: "Does my data leave my device?",
    answer:
      "No. The PDFs you combine stay on your device and are merged inside the browser — nothing is uploaded to any server.",
  },
  {
    question: "How many PDFs can I combine in one go?",
    answer:
      "There is no fixed cap. Very large files or dozens of documents may slow your browser depending on available memory.",
  },
  {
    question: "Do images and text look the same after merging?",
    answer:
      "Yes. Pages are copied as-is into the new file without re-compressing images, so quality matches your sources.",
  },
  {
    question: "Can I merge password-protected PDFs?",
    answer:
      "Unlock them first. This tool cannot open encrypted PDFs.",
  },
];
