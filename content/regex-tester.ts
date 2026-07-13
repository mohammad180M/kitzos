import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Enter a pattern",
    description:
      "Type a regular expression in the pattern field and select flags (g, i, m, s, u, y) as needed.",
  },
  {
    title: "Add test text",
    description:
      "Paste or type sample text. Matches are highlighted live as you edit the pattern or text.",
  },
  {
    title: "Inspect matches",
    description:
      "Review the match count, each match index, capture groups, and named groups in the results list.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Which regex flags are supported?",
    answer:
      "g, i, m, s, u, and y — toggle them below the pattern field to change matching behavior.",
  },
  {
    question: "What if my pattern is invalid?",
    answer:
      "Invalid syntax shows a clear error message without breaking the page. Fix the pattern and testing resumes automatically.",
  },
  {
    question: "How are global (g) matches handled?",
    answer:
      "With the g flag, all non-overlapping matches are found. Empty matches advance the search index to avoid infinite loops.",
  },
  {
    question: "Can I try quick examples?",
    answer:
      "Yes. Use the example buttons for email, phone, and URL patterns to fill the pattern and test text instantly.",
  },
];
