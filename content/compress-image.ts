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
    question: "What image formats can I compress?",
    answer:
      "JPEG and PNG only. Transparent PNGs stay PNG; opaque PNGs can optionally convert to JPEG for smaller files.",
  },
  {
    question: "How much smaller will my file get?",
    answer:
      "It depends on the photo. Use the quality slider (10–100, default 80) — high-resolution photos often shrink a lot around 70–80%, while already-compressed images may gain less.",
  },
  {
    question: "Do my photos leave my device?",
    answer:
      "No. Compression runs in your browser and the download stays on your device — nothing is uploaded.",
  },
  {
    question: "Does compression change the image dimensions?",
    answer:
      "No. Width and height stay the same; only file size/quality change. If the result is not smaller, the tool offers the original as already optimized. Use Image Resizer to change dimensions.",
  },
];
