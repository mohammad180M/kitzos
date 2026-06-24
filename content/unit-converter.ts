import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose a measurement category",
    description:
      "Select length, weight, temperature, area, or volume depending on what you need to convert.",
  },
  {
    title: "Pick source and target units",
    description:
      "Choose the unit you are converting from and the unit you want the result in — for example, miles to kilometers or °F to °C.",
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
      "Length (mm, cm, m, km, in, ft, yd, mi), weight (mg, g, kg, oz, lb), temperature (°C, °F, K), area (m², ft², acres, hectares), and volume (ml, L, fl oz, cups, gallons).",
  },
  {
    question: "Are conversions accurate?",
    answer:
      "Yes. Conversions use standard international factors. Temperature uses the correct offset formulas between Celsius, Fahrenheit, and Kelvin.",
  },
  {
    question: "Which gallon does the volume converter use?",
    answer:
      "US customary units — US fluid ounces, US cups, and US gallons. This matches common American cooking and packaging labels.",
  },
  {
    question: "Can I convert metric to imperial?",
    answer:
      "Absolutely. Pick any category and select one metric unit and one imperial unit. The converter works in both directions.",
  },
];
