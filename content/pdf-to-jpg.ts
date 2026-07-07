import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose a direction",
    description:
      "Use the switcher at the top: PDF → Images to export pages as JPG, or Images → PDF to build a document from photos.",
  },
  {
    title: "PDF to JPG",
    description:
      "Upload a PDF. For single-page files, download one JPG. For multi-page documents, download all pages as a ZIP of JPG images rendered at high resolution.",
  },
  {
    title: "JPG to PDF",
    description:
      "Upload JPG, PNG, or WebP images. Drag to reorder, set page size, orientation, and margins, then create your PDF — all in the browser.",
  },
  {
    title: "Save your file",
    description:
      "Downloads start instantly. Nothing is uploaded to a server — conversion runs locally with pdf.js and pdf-lib.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What image quality are the JPGs?",
    answer:
      "PDF pages are rendered at 2× scale with 92% JPEG quality, producing sharp images suitable for sharing or printing.",
  },
  {
    question: "Which image formats can I turn into a PDF?",
    answer:
      "JPG, PNG, and WebP are supported. WebP images are converted locally before embedding in the PDF.",
  },
  {
    question: "Can I convert only one page from a long PDF?",
    answer:
      "Yes. Use the Page 1 as JPG button for a quick single-page export, or download all pages as a ZIP for the full document.",
  },
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. Both directions run entirely in your browser. Your PDF and images never leave your device.",
  },
  {
    question: "Can I mix portrait and landscape images in one PDF?",
    answer:
      "Yes. Use Auto orientation to match each image, or force portrait or landscape for every page.",
  },
  {
    question: "Why did my PDF fail to convert?",
    answer:
      "Password-protected, corrupted, or non-standard PDFs may not render. Try unlocking or re-saving the file first.",
  },
];
