import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose a measurement category",
    description:
      "Select length, weight, area, or volume depending on what you need to convert.",
  },
  {
    title: "Pick source and target units",
    description:
      "Choose the unit you are converting from and the unit you want the result in — for example, miles to kilometers or cups to milliliters.",
  },
  {
    title: "Enter a value",
    description:
      "Type the number to convert. The equivalent value in your target unit appears instantly.",
  },
  {
    title: "Swap or change units anytime",
    description:
      "Switch categories or flip units to convert in the opposite direction without re-entering your number.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What units can I convert?",
    answer:
      "Length (mm, cm, m, km, in, ft, yd, mi), weight (mg, g, kg, oz, lb), area (m², ft², acres, hectares), and volume (ml, L, fl oz, cups, gallons).",
  },
  {
    question: "Where do I convert temperature?",
    answer:
      "Use the dedicated Temperature Converter for Celsius, Fahrenheit, and Kelvin — linked from this tool.",
  },
  {
    question: "Are conversions accurate?",
    answer:
      "Yes. Conversions use standard international factors for length, weight, area, and volume.",
  },
  {
    question: "Which gallon does the volume converter use?",
    answer:
      "US customary units — US fluid ounces, US cups, and US gallons. This matches common American cooking and packaging labels.",
  },
];
