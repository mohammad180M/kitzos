import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload an image",
    description:
      "Choose any common image format (PNG, JPG, WebP, etc.). A preview appears with a crop selection over it.",
  },
  {
    title: "Pick a shape mode",
    description:
      "Select Rectangle for freeform or fixed aspect ratios (1:1, 4:3, 16:9), Circle for profile photos, or Rounded square with an adjustable corner radius.",
  },
  {
    title: "Adjust the crop area",
    description:
      "Drag the selection to reposition it. Drag the corner handle to resize. Circle and rounded modes keep a square selection.",
  },
  {
    title: "Download the crop",
    description:
      "Rectangle mode exports in the source format when possible. Circle and rounded-square modes export PNG with transparency outside the shape.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Is cropping done on a server?",
    answer:
      "No. The image is processed on a canvas in your browser. Nothing is uploaded.",
  },
  {
    question: "What aspect ratios are available for rectangles?",
    answer:
      "Free (any shape), 1:1 (square), 4:3, and 16:9. The crop box adjusts when you switch presets.",
  },
  {
    question: "Does circle or rounded export keep transparency?",
    answer:
      "Yes. Circle and rounded-square modes export PNG with real alpha outside the shape — ideal for profile pictures and stickers.",
  },
  {
    question: "What format is rectangle output?",
    answer:
      "Rectangle crops download as PNG or JPEG depending on the source format. Transparency is preserved when the source supports it.",
  },
  {
    question: "Can I crop very large images?",
    answer:
      "Yes, though very large files may take a moment to process depending on your device memory.",
  },
];
