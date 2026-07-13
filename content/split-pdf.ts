import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF",
    description:
      "Click the upload area or drag and drop a single PDF file. The tool reads the document and shows how many pages it contains.",
  },
  {
    title: "Choose a split mode",
    description:
      "Split every page into separate files, or enter custom ranges like 1-3, 5, 7-10 where each range becomes its own PDF.",
  },
  {
    title: "Download the results",
    description:
      "Click Split & Download. Multiple outputs are packaged in a ZIP file; a single result downloads as one PDF.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Is my file uploaded?",
    answer:
      "No. Your PDF is split on your own device inside the browser — the document never goes to a server.",
  },
  {
    question: "How do page ranges work?",
    answer:
      "Use commas to separate groups. For example, 1-3, 5 creates two PDFs: pages 1–3 and page 5 alone.",
  },
  {
    question: "What if my PDF is password-protected?",
    answer:
      "Unlock it first. Encrypted files cannot be split here.",
  },
  {
    question: "What happens when I split into individual pages?",
    answer:
      "Each page is saved as a separate PDF inside a ZIP archive named after your original file.",
  },
];
