import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Pick two dates to compare",
    description:
      "Enter a start date and end date to find the exact span between them in days, weeks, months, and years.",
  },
  {
    title: "Read the full breakdown",
    description:
      "See total days between the dates plus a calendar-style breakdown of years, months, and remaining days.",
  },
  {
    title: "Count days until or since an event",
    description:
      "Use the single-date section to see how many days remain until a future date or how many days have passed since a past one.",
  },
  {
    title: "Plan deadlines and milestones",
    description:
      "Handy for project timelines, vacation countdowns, anniversaries, contract periods, and age calculations.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How are days between dates counted?",
    answer:
      "The calculator measures the difference in calendar days between the two dates you select. The total day count and the years/months/days breakdown are both shown.",
  },
  {
    question: "Does the order of dates matter?",
    answer:
      "The absolute difference is the same either way. The breakdown also indicates whether the end date falls before or after the start date.",
  },
  {
    question: "How does the days until / days since feature work?",
    answer:
      "Pick any target date and the tool compares it to today. Future dates show days remaining; past dates show days elapsed.",
  },
  {
    question: "Are leap years handled correctly?",
    answer:
      "Yes. Date math accounts for varying month lengths and leap years, so February 29 and other edge cases are calculated accurately.",
  },
];
