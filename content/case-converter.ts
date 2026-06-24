import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Enter your text",
    description:
      "Type or paste the text you want to transform into the textarea.",
  },
  {
    title: "Choose a case style",
    description:
      "Click UPPERCASE, lowercase, Title Case, Sentence case, camelCase, or snake_case to convert instantly.",
  },
  {
    title: "Copy the result",
    description:
      "Use the Copy button to copy the converted text to your clipboard in one click.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is Title Case?",
    answer:
      "Title Case capitalizes the first letter of each word, which is common for headlines and titles.",
  },
  {
    question: "How does Sentence case work?",
    answer:
      "Sentence case lowercases the entire text, then capitalizes only the first letter of each sentence.",
  },
  {
    question: "Can I convert to camelCase or snake_case?",
    answer:
      "Yes. camelCase joins words without spaces and capitalizes subsequent words. snake_case uses lowercase words separated by underscores.",
  },
  {
    question: "Does this work with special characters?",
    answer:
      "Yes. Accented letters and unicode characters are preserved. Only casing rules are applied.",
  },
];
