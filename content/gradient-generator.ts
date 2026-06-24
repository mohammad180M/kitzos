import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose linear or radial",
    description:
      "Select a linear gradient for directional blends or a radial gradient for circular color spreads from the center outward.",
  },
  {
    title: "Set colors and angle",
    description:
      "Pick color stops with the color inputs, adjust the angle for linear gradients, and add or remove stops (up to six colors).",
  },
  {
    title: "Preview the gradient live",
    description:
      "A large preview box updates in real time so you can fine-tune colors and direction before copying the code.",
  },
  {
    title: "Copy the CSS",
    description:
      "Click copy to get a ready-to-paste background property for your stylesheet, Tailwind arbitrary value, or inline style.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What CSS does this gradient generator output?",
    answer:
      "It produces a complete background declaration — either linear-gradient(angle, colors) or radial-gradient(circle, colors) — ready to paste into your CSS.",
  },
  {
    question: "How many color stops can I use?",
    answer:
      "You can use between two and six colors. Add stops with the plus button and remove extras with the trash icon (minimum two colors).",
  },
  {
    question: "What does the angle setting do?",
    answer:
      "For linear gradients, the angle in degrees controls direction — 0° points upward, 90° to the right, and 180° downward. Radial gradients ignore the angle.",
  },
  {
    question: "Can I use the CSS in Tailwind or React?",
    answer:
      "Yes. Paste the background value into your CSS file, use it as an inline style in React, or wrap it in Tailwind's arbitrary value syntax.",
  },
];
