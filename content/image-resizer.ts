import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your image",
    description:
      "Choose any JPG, PNG, or WebP image. The current dimensions are displayed automatically.",
  },
  {
    title: "Set new dimensions",
    description:
      "Enter the desired width and height in pixels. Toggle aspect ratio lock to keep proportions when changing one dimension.",
  },
  {
    title: "Download the resized image",
    description:
      "Click Download to save the resized version. The output keeps the same format as your original file.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Can I resize without distorting the image?",
    answer:
      "Yes. Enable the aspect ratio lock to automatically calculate the matching dimension when you change width or height.",
  },
  {
    question: "What is the maximum image size?",
    answer:
      "There is no fixed limit, but very large images (above 8000px) may be slow to process depending on your device and browser.",
  },
  {
    question: "Does resizing lower image quality?",
    answer:
      "Shrinking an image generally looks sharp. Enlarging beyond the original size may appear blurry because new pixels are interpolated.",
  },
  {
    question: "Is this tool free and private?",
    answer:
      "Completely free with no signup. All resizing happens locally — your images are never uploaded.",
  },
];
