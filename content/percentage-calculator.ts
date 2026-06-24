import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Select a calculation mode",
    description:
      "Choose X% of Y, X is what % of Y, or percentage change between two values depending on what you need to solve.",
  },
  {
    title: "Enter your numbers",
    description:
      "Fill in the two input fields labeled for your selected mode. Results update automatically as you type.",
  },
  {
    title: "Read the result",
    description:
      "The answer appears below the inputs — for example, 20% of 150, what fraction one number is of another, or the percent increase or decrease.",
  },
  {
    title: "Switch modes for related problems",
    description:
      "Use percent-of for discounts and tips, what-percent for share or completion rates, and percent change for price hikes or growth comparisons.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How do I calculate a percentage of a number?",
    answer:
      "Select the X% of Y mode, enter the percentage in the first field and the number in the second. The result is (percentage ÷ 100) × number.",
  },
  {
    question: "How is percentage change calculated?",
    answer:
      "Percentage change is ((new value − original value) ÷ original value) × 100. A positive result is an increase; a negative result is a decrease.",
  },
  {
    question: "Can I use decimals?",
    answer:
      "Yes. Enter whole numbers or decimals in either field. Results are shown with up to four decimal places when needed.",
  },
  {
    question: "What if I divide by zero?",
    answer:
      "If the divisor is zero — for example, finding what percent X is of 0 — the calculator cannot produce a valid result and will show no answer.",
  },
];
