import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose wheel or number mode",
    description:
      "Use the spin wheel to pick a name or option from a list, or switch to number mode to generate a random integer in a range.",
  },
  {
    title: "Enter your options or range",
    description:
      "In wheel mode, type one item per line (any language). In number mode, set the minimum and maximum for the random draw.",
  },
  {
    title: "Spin the wheel or generate",
    description:
      "Click Spin to turn the wheel of fortune and reveal the winner under the pointer, or generate an instant random number.",
  },
  {
    title: "Copy the result",
    description:
      "Use the copy button to paste the winning name or number into a message, spreadsheet, or game.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How does the spin wheel picker work?",
    answer:
      "Enter names or options one per line, then spin the wheel. Segments follow your list order clockwise from the top pointer. One entry is chosen at random with your browser’s random number generator.",
  },
  {
    question: "Is the random number generator fair?",
    answer:
      "Yes. Each integer in your chosen range has an equal chance of being selected. The result is uniformly random within min and max, inclusive.",
  },
  {
    question: "Can I use the wheel of fortune for giveaways or team selection?",
    answer:
      "Yes. Paste participant names into the list and spin once to pick a winner. For high-stakes draws, consider recording the screen for transparency.",
  },
  {
    question: "Are duplicate names on the wheel treated separately?",
    answer:
      "Each line is a separate segment. If you add the same name twice, it appears twice on the wheel and has twice the chance of being picked.",
  },
];
