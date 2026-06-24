import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Paste your text",
    description:
      "Paste or type text that contains unwanted line breaks or extra spacing.",
  },
  {
    title: "Select a cleaning option",
    description:
      "Remove all line breaks, remove extra spaces while keeping paragraphs, or convert breaks to single spaces.",
  },
  {
    title: "Copy the result",
    description:
      "The cleaned text appears instantly below. Click Copy to use it elsewhere.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "When should I remove all line breaks?",
    answer:
      "Use this when text copied from a PDF or email has hard wraps and you need one continuous line.",
  },
  {
    question: "What does remove extra spaces do?",
    answer:
      "It collapses multiple spaces and tabs into one while keeping paragraph breaks intact.",
  },
  {
    question: "Is this useful for CSV or code?",
    answer:
      "It helps clean prose and pasted content. For structured data, review the output carefully before use.",
  },
  {
    question: "Is my text stored anywhere?",
    answer:
      "No. All processing happens in your browser and nothing is saved.",
  },
];
