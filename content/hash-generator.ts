import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Enter your text",
    description:
      "Type or paste any string in the input field. Hashes update automatically as you type.",
  },
  {
    title: "Review the hashes",
    description:
      "MD5, SHA-1, SHA-256, and SHA-512 digests are shown in hexadecimal format.",
  },
  {
    title: "Copy a hash",
    description:
      "Click the copy button next to any algorithm to copy that hash to your clipboard.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Are hashes computed locally?",
    answer:
      "Yes. All hashes are computed locally in your browser. Nothing is sent online.",
  },
  {
    question: "Which hash should I use?",
    answer:
      "SHA-256 is the modern default for integrity checks. MD5 and SHA-1 are legacy and not recommended for security.",
  },
  {
    question: "Does an empty input produce hashes?",
    answer:
      "Hashes appear only when text is entered. Clearing the input clears all results.",
  },
  {
    question: "Can I hash files?",
    answer:
      "This tool hashes text input only. Paste file contents as text, or use a dedicated file checksum tool for binaries.",
  },
];
