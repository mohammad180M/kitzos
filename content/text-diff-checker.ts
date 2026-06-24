import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Paste the original text",
    description:
      "Enter or paste the baseline version in the Original field on the left.",
  },
  {
    title: "Paste the changed text",
    description:
      "Enter the revised version in the Changed field. Differences appear automatically below.",
  },
  {
    title: "Review highlighted changes",
    description:
      "Removed lines appear in red with strikethrough. Added lines appear in green.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Is my text sent to a server?",
    answer:
      "No. The diff is computed locally in your browser using the diff library.",
  },
  {
    question: "Does it compare word by word?",
    answer:
      "This tool compares line by line, which works well for code, configs, and multi-line documents.",
  },
  {
    question: "Can I diff very large files?",
    answer:
      "Large texts may slow the browser slightly, but there is no file size limit beyond your device memory.",
  },
  {
    question: "What do the colors mean?",
    answer:
      "Red with strikethrough means content removed from the original. Green means content added in the changed version.",
  },
];
