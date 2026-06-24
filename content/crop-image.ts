import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload an image",
    description:
      "Choose any common image format (PNG, JPG, WebP, etc.). A preview appears with a crop box over it.",
  },
  {
    title: "Adjust the crop area",
    description:
      "Drag the box to reposition it. Drag the corner handle to resize. Pick an aspect ratio preset or use freeform cropping.",
  },
  {
    title: "Download the crop",
    description:
      "Click Download cropped image to save only the selected region as a PNG file.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Is cropping done on a server?",
    answer:
      "No. The image is processed on a canvas in your browser. Nothing is uploaded.",
  },
  {
    question: "What aspect ratios are available?",
    answer:
      "Free (any shape), 1:1 (square), 4:3, and 16:9. The crop box adjusts when you switch presets.",
  },
  {
    question: "What format is the output?",
    answer:
      "Cropped images download as PNG to preserve quality. Transparency is kept when the source image supports it.",
  },
  {
    question: "Can I crop very large images?",
    answer:
      "Yes, though very large files may take a moment to process depending on your device memory.",
  },
];
