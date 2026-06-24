import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload an image",
    description:
      "Select a JPG or PNG file from your device. The original file size is shown so you can compare results.",
  },
  {
    title: "Adjust the quality",
    description:
      "Use the quality slider to balance file size and visual quality. Lower values produce smaller files with more compression.",
  },
  {
    title: "Download the compressed image",
    description:
      "Preview the new file size, then click Download to save the optimized image. Processing is done locally in your browser.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What image formats are supported?",
    answer:
      "This tool supports JPEG and PNG images. Other formats like WebP or GIF are not supported at this time.",
  },
  {
    question: "How much can I reduce the file size?",
    answer:
      "Results depend on the original image. Photos with high resolution often shrink dramatically at 70–80% quality, while already-compressed images may see smaller gains.",
  },
  {
    question: "Are my images uploaded to a server?",
    answer:
      "No. Compression uses the HTML Canvas API entirely in your browser. Your images stay on your device.",
  },
  {
    question: "Will compressing reduce image dimensions?",
    answer:
      "No. This tool only reduces file size through quality compression. Pixel dimensions remain unchanged. Use our Image Resizer if you need smaller dimensions.",
  },
];
