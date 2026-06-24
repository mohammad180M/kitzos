import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Enter your profile details",
    description:
      "Select sex, choose metric or imperial units, and enter your age, height, and weight.",
  },
  {
    title: "Pick your activity level",
    description:
      "Choose how active you are — from sedentary to very active — based on your typical weekly exercise and daily movement.",
  },
  {
    title: "Review BMR and TDEE",
    description:
      "See your Basal Metabolic Rate (calories burned at rest) and Total Daily Energy Expenditure (calories burned including activity).",
  },
  {
    title: "Choose a calorie target",
    description:
      "Use the maintain, lose (~500 cal deficit), or gain (~500 cal surplus) targets as a starting point for meal planning or weight goals.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What formula does this calorie calculator use?",
    answer:
      "BMR is calculated with the Mifflin-St Jeor equation, which uses sex, weight, height, and age. TDEE multiplies BMR by your selected activity factor.",
  },
  {
    question: "What is the difference between BMR and TDEE?",
    answer:
      "BMR is the calories your body needs at complete rest. TDEE adds calories burned through daily activity and exercise, giving a more realistic daily target.",
  },
  {
    question: "How many calories should I eat to lose weight?",
    answer:
      "A deficit of about 500 calories per day typically leads to roughly one pound of weight loss per week. This tool shows a lose target based on that guideline.",
  },
  {
    question: "Are these calorie estimates exact?",
    answer:
      "They are estimates, not medical advice. Individual metabolism, health conditions, and body composition vary. Adjust based on progress and consult a professional if needed.",
  },
];
