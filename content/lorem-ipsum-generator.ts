import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose a unit type",
    description:
      "Select paragraphs, sentences, or words depending on how much placeholder text you need.",
  },
  {
    title: "Set the count",
    description:
      "Use the slider to pick how many paragraphs, sentences, or words to generate.",
  },
  {
    title: "Generate and copy",
    description:
      "Click Generate, then Copy to paste the lorem ipsum text into your design or document.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is lorem ipsum used for?",
    answer:
      "Lorem ipsum is placeholder text used in mockups and drafts to show layout without distracting real content.",
  },
  {
    question: "Is the text random each time?",
    answer:
      "Yes. Each click generates new randomized sentences built from classic lorem ipsum vocabulary.",
  },
  {
    question: "What is the maximum count?",
    answer:
      "Up to 50 paragraphs or sentences, or up to 500 words per generation.",
  },
  {
    question: "Can I use this commercially?",
    answer:
      "Yes. Generated placeholder text is free to use in any project.",
  },
];
