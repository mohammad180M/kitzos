import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Paste your JSON",
    description:
      "Paste raw or minified JSON into the input area. The tool accepts objects, arrays, and nested structures.",
  },
  {
    title: "Format or minify",
    description:
      "Click Format to beautify with proper indentation, or Minify to remove whitespace. Invalid JSON shows an error with the line number.",
  },
  {
    title: "Copy the output",
    description:
      "Once formatted, use Copy to grab the result. Valid JSON is highlighted with clear structure for easy reading.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How does JSON validation work?",
    answer:
      "The tool parses your input with JSON.parse(). If syntax is invalid, you see an error message with the approximate line where the problem occurs.",
  },
  {
    question: "Can I format large JSON files?",
    answer:
      "Yes, though very large files (several megabytes) may take a moment to process depending on your browser.",
  },
  {
    question: "Does this support JSON with comments?",
    answer:
      "Standard JSON does not allow comments. If your input contains comments or trailing commas, the validator will report an error.",
  },
  {
    question: "Is my JSON data sent anywhere?",
    answer:
      "No. All parsing and formatting happens locally in your browser. Your data never leaves your device.",
  },
];
