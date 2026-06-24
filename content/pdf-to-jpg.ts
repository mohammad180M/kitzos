import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload a PDF",
    description:
      "Select or drop a PDF file. The tool detects the number of pages and prepares them for conversion.",
  },
  {
    title: "Choose your download option",
    description:
      "For single-page PDFs, download one JPG. For multi-page documents, download all pages as a ZIP of JPG images.",
  },
  {
    title: "Save your images",
    description:
      "Images are rendered at high resolution in your browser and download instantly — no upload required.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What image quality are the JPGs?",
    answer:
      "Pages are rendered at 2× scale with 92% JPEG quality, producing sharp images suitable for sharing or printing.",
  },
  {
    question: "Does this work offline?",
    answer:
      "Yes, once the page is loaded. Conversion uses pdf.js locally in your browser with no server processing.",
  },
  {
    question: "Can I convert only one page from a long PDF?",
    answer:
      "Use the Page 1 as JPG button for a quick single-page export, or download all pages as a ZIP for the full document.",
  },
  {
    question: "Why did my PDF fail to convert?",
    answer:
      "Password-protected, corrupted, or non-standard PDFs may not render. Try unlocking or re-saving the file first.",
  },
];
