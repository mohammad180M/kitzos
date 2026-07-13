import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Paste your text",
    description:
      "Paste or type text with unwanted line breaks, extra spaces, or blank lines.",
  },
  {
    title: "Choose cleanup toggles",
    description:
      "Turn on the options you need — remove line breaks, collapse spaces, drop blank lines, or trim line edges. Each works independently and updates live.",
  },
  {
    title: "Copy the result",
    description:
      "The cleaned text appears instantly below with before/after character and line counts. Click Copy to use it elsewhere.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What does each toggle do?",
    answer:
      "Remove line breaks joins lines into one block (optionally with a space between them). Collapse multiple spaces turns runs of spaces and tabs into a single space. Remove blank lines drops empty lines. Trim line edges removes leading and trailing whitespace on each line.",
  },
  {
    question: "Should I join lines directly or replace breaks with a space?",
    answer:
      "Join directly when you want one continuous string (e.g. text copied from a PDF). Replace breaks with a space when words on separate lines should stay separated — like turning hard-wrapped paragraphs into normal sentences.",
  },
  {
    question: "Can I combine several options at once?",
    answer:
      "Yes. All toggles apply together in one pass — for example remove blank lines, trim edges, then join remaining lines with a space.",
  },
  {
    question: "Does my pasted text leave my device?",
    answer:
      "No. Whitespace cleanup runs entirely in your browser; nothing is saved or uploaded.",
  },
];
