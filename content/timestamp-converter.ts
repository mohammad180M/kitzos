import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "See the current timestamp",
    description:
      "The current Unix time in seconds and milliseconds is shown at the top and updates every second.",
  },
  {
    title: "Convert timestamp to date",
    description:
      "Enter a Unix timestamp (seconds or milliseconds). The human-readable date appears automatically.",
  },
  {
    title: "Convert date to timestamp",
    description:
      "Pick a date and time using the datetime picker. The equivalent Unix timestamp in seconds is shown below.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Does this accept seconds or milliseconds?",
    answer:
      "Both. Values with 13 or more digits are treated as milliseconds; shorter values are treated as seconds.",
  },
  {
    question: "What timezone is used?",
    answer:
      "Displayed dates use your browser's local timezone. The Unix timestamp itself is always UTC-based.",
  },
  {
    question: "Can I copy the current timestamp?",
    answer:
      "Yes. Use the Copy seconds or Copy ms buttons next to the live clock at the top.",
  },
  {
    question: "Why do logs use Unix timestamps?",
    answer:
      "Unix time is a standard integer format that avoids timezone ambiguity and is easy to sort and compare.",
  },
];
