import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose your unit system",
    description:
      "Select metric (cm and kg) or imperial (feet, inches, and pounds) depending on how you measure height and weight.",
  },
  {
    title: "Enter height and weight",
    description:
      "Type your height and weight into the fields. Your BMI updates instantly — no button to press.",
  },
  {
    title: "Read your BMI and category",
    description:
      "Review your Body Mass Index score and whether it falls in the underweight, normal, overweight, or obese range for adults.",
  },
  {
    title: "Use results as a screening guide",
    description:
      "BMI is a quick health screening tool. Share the number with your doctor if you have questions about weight management or fitness goals.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How is BMI calculated?",
    answer:
      "BMI is weight in kilograms divided by height in meters squared (kg/m²). For imperial units, height and weight are converted to metric first, then the same formula is applied.",
  },
  {
    question: "What is a healthy BMI range?",
    answer:
      "For most adults, a BMI between 18.5 and 24.9 is considered normal. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above is obese.",
  },
  {
    question: "Is BMI accurate for everyone?",
    answer:
      "BMI does not distinguish muscle from fat, so athletes and very muscular people may score high despite low body fat. It is less reliable for children, elderly adults, and pregnant women.",
  },
  {
    question: "Does this store my height or weight?",
    answer:
      "No. All calculations run in your browser. Your measurements are never sent to a server.",
  },
];
