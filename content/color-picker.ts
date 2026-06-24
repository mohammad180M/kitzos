import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Pick a color",
    description:
      "Use the color picker or type a HEX value to select any color. All formats update in real time.",
  },
  {
    title: "View all formats",
    description:
      "See the color displayed as HEX, RGB, and HSL values side by side for easy reference.",
  },
  {
    title: "Copy any format",
    description:
      "Click the copy button next to HEX, RGB, or HSL to copy that value to your clipboard for use in CSS or design tools.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is the difference between HEX, RGB, and HSL?",
    answer:
      "HEX uses a six-digit hexadecimal code (#RRGGBB). RGB defines red, green, and blue channels from 0–255. HSL uses hue, saturation, and lightness, which many designers find more intuitive for adjustments.",
  },
  {
    question: "Can I enter a HEX code directly?",
    answer:
      "Yes. Type or paste any valid HEX code (with or without the #) and the picker, RGB, and HSL values update automatically.",
  },
  {
    question: "Are the conversions accurate?",
    answer:
      "Yes. Conversions use standard color space math. RGB and HSL values are rounded to whole numbers for practical use in CSS.",
  },
  {
    question: "Can I use these values in CSS?",
    answer:
      "Absolutely. Copy HEX as #rrggbb, RGB as rgb(r, g, b), or HSL as hsl(h, s%, l%) — all are valid CSS color formats.",
  },
];
