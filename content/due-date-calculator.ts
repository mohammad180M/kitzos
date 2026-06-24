import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Enter your LMP date",
    description:
      "Select the first day of your last menstrual period (LMP) using the date picker. This is the standard starting point for due date estimates.",
  },
  {
    title: "View your estimated due date",
    description:
      "The calculator adds 280 days (40 weeks) to your LMP and displays your estimated delivery date.",
  },
  {
    title: "Check your current pregnancy week",
    description:
      "See how many weeks and days pregnant you are today based on the time elapsed since your LMP.",
  },
  {
    title: "Track days until due",
    description:
      "Review how many days remain until your due date, or how many days past due you are if that date has already passed.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How is a pregnancy due date calculated?",
    answer:
      "This tool uses Naegele's rule: add 280 days (40 weeks) to the first day of your last menstrual period. Most pregnancies deliver within two weeks of that date.",
  },
  {
    question: "Is an LMP due date always accurate?",
    answer:
      "LMP-based estimates assume a regular 28-day cycle. An early ultrasound often gives a more precise due date, especially if your cycle length varies.",
  },
  {
    question: "What does pregnancy week mean?",
    answer:
      "Pregnancy weeks are counted from the first day of your LMP, not from conception. Week 1 starts on that first day, so you are considered about two weeks pregnant at conception.",
  },
  {
    question: "Should I use this instead of medical advice?",
    answer:
      "No. This is an educational estimate only. Always follow guidance from your obstetrician or midwife for prenatal care and delivery planning.",
  },
];
