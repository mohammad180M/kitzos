import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your image",
    description:
      "Select any image file. A preview appears so you can confirm the source before converting.",
  },
  {
    title: "Pick an output format",
    description:
      "Choose PNG, JPG, or WebP. Adjust quality for JPG and WebP using the slider.",
  },
  {
    title: "Download the converted file",
    description:
      "Click Download converted image. The file saves in your chosen format with the correct extension.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Which output formats can I choose?",
    answer:
      "PNG, JPG, and WebP. You can select one or more; multiple formats download together as a ZIP.",
  },
  {
    question: "What happens to transparency when converting to JPG?",
    answer:
      "JPG has no transparency, so transparent areas are filled with white before export. Prefer PNG or WebP to keep alpha.",
  },
  {
    question: "Can I control compression quality?",
    answer:
      "Yes. When JPG or WebP is selected, a quality slider (50–100, default 92) applies. PNG is lossless and ignores that slider.",
  },
  {
    question: "Are images uploaded during conversion?",
    answer:
      "No. Format conversion runs entirely in your browser on your device.",
  },
];
