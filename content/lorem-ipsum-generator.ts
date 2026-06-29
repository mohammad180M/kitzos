import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose text language",
    description:
      "Pick Latin (classic Lorem Ipsum) or Arabic placeholder text. On Arabic pages, Arabic is selected by default.",
  },
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
      "Click Generate, then Copy to paste the placeholder text into your design or document.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is lorem ipsum used for?",
    answer:
      "Placeholder text is used in mockups and drafts to show layout without distracting real content. This tool supports both Latin Lorem Ipsum and Arabic filler text.",
  },
  {
    question: "Can I generate Arabic placeholder text?",
    answer:
      "Yes. Switch the text language to Arabic to generate RTL paragraphs, sentences, or words using common Arabic filler vocabulary.",
  },
  {
    question: "Is the text random each time?",
    answer:
      "Yes. Each click generates new randomized sentences built from classic placeholder vocabulary in the selected language.",
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
