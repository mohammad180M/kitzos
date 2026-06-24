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
    question: "Which format should I choose?",
    answer:
      "Use PNG or WebP for images with transparency. Use JPG for photos where smaller file size matters.",
  },
  {
    question: "What happens to transparency when converting to JPG?",
    answer:
      "JPG does not support transparency, so transparent areas are filled with a white background before export.",
  },
  {
    question: "Is WebP widely supported?",
    answer:
      "WebP is supported by all modern browsers and many design tools. It offers good compression with optional transparency.",
  },
  {
    question: "Are images uploaded anywhere?",
    answer:
      "No. Conversion uses the HTML canvas API entirely in your browser.",
  },
];
