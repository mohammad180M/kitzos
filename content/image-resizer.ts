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
      "Yes. Keep aspect-ratio lock on (it is on by default) so changing width or height updates the other dimension proportionally.",
  },
  {
    question: "Is there a maximum image size?",
    answer:
      "There is no fixed pixel limit in the tool. Very large dimensions may be slow depending on your device and browser.",
  },
  {
    question: "Does resizing lower image quality?",
    answer:
      "Shrinking usually stays sharp. Enlarging past the original size can look soft because new pixels are invented. Export uses the same format as your source.",
  },
  {
    question: "Are my photos uploaded when I resize?",
    answer:
      "No. Resizing happens locally in your browser — your photos never leave your device.",
  },
];
