import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload your PDF",
    description:
      "Select or drop a PDF file. The tool renders page thumbnails so you can see every page at a glance.",
  },
  {
    title: "Rotate pages",
    description:
      "Click the rotate button on any thumbnail to turn it 90°. Use Rotate all to apply the same turn to every page.",
  },
  {
    title: "Download the result",
    description:
      "Click Download rotated PDF. Existing page rotations are preserved and combined with your changes.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Does turning pages reduce quality?",
    answer:
      "No. Only the page orientation changes; text and images are not re-drawn, so they stay sharp.",
  },
  {
    question: "Is it private?",
    answer:
      "Yes. Your PDF is rotated on your device inside the browser — pages never upload.",
  },
  {
    question: "What if a page was already rotated?",
    answer:
      "The tool reads the existing rotation and adds your turns on top, so the final angle is always correct.",
  },
  {
    question: "What if my PDF is password-protected?",
    answer:
      "Unlock it first. Encrypted files cannot be rotated here.",
  },
];
