import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose list or number mode",
    description:
      "Pick from list to randomly select a name or option, or switch to number mode to generate a random integer in a range.",
  },
  {
    title: "Enter your options or range",
    description:
      "In list mode, type one item per line. In number mode, set the minimum and maximum values for the random draw.",
  },
  {
    title: "Spin or generate",
    description:
      "Click to pick. List mode spins a colorful wheel animation before revealing the winner; number mode instantly shows a random integer.",
  },
  {
    title: "Copy the result",
    description:
      "Use the copy button to paste the winning name or number into a message, spreadsheet, or game.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How does the random name picker work?",
    answer:
      "Enter names or options one per line, then spin the wheel. The tool randomly selects one entry using your browser's built-in random number generator.",
  },
  {
    question: "Is the random number generator fair?",
    answer:
      "Yes. Each integer in your chosen range has an equal chance of being selected. The result is uniformly random within min and max, inclusive.",
  },
  {
    question: "Can I use this for giveaways or team selection?",
    answer:
      "Yes. Paste participant names into the list and spin once to pick a winner. For high-stakes draws, consider recording the screen for transparency.",
  },
  {
    question: "Are duplicate names in the list treated separately?",
    answer:
      "Each line is a separate entry. If you add the same name twice, it appears twice on the wheel and has twice the chance of being picked.",
  },
];
