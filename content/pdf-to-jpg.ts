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
      "Downloads start instantly. Nothing is uploaded to a server — conversion runs entirely on your device inside the browser.",
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
    question: "Can I mix portrait and landscape images in one PDF?",
    answer:
      "Yes. Use Auto orientation to match each image, or force portrait or landscape for every page.",
  },
  {
    question: "Is it private?",
    answer:
      "Yes. Your PDF and images are converted on your device — neither direction uploads files to a server.",
  },
];
