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
    question: "Does it show word-level changes inside a line?",
    answer:
      "Yes. When the same line number changes on both sides, added and removed words are highlighted within that line — not just the whole line.",
  },
  {
    question: "Does it compare word by word?",
    answer:
      "It compares line by line first, which suits code, configs, and multi-line documents. Changed lines also get word-level highlights.",
  },
  {
    question: "Can I diff very large files?",
    answer:
      "Large texts may slow the browser slightly, but there is no file size limit beyond your device memory.",
  },
  {
    question: "What do the colors mean?",
    answer:
      "Red with strikethrough means removed content. Green means added content. Amber means a line changed with mixed word-level edits.",
  },
];
