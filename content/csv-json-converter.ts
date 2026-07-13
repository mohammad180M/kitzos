import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose direction",
    description:
      "Toggle between CSV to JSON and JSON to CSV. For CSV input, pick comma, semicolon, or tab delimiter.",
  },
  {
    title: "Paste or upload",
    description:
      "Paste your data into the input area or upload a local .csv or .json file. Files are read in your browser only.",
  },
  {
    title: "Copy or download",
    description:
      "The converted output updates live. Copy it to the clipboard or download as a .json or .csv file.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Can I change the CSV delimiter?",
    answer:
      "Yes. Pick comma, semicolon, or tab before converting CSV to JSON.",
  },
  {
    question: "How are CSV headers handled?",
    answer:
      "The first row of CSV is treated as column headers. Each following row becomes a JSON object with those keys.",
  },
  {
    question: "What JSON format is required for CSV output?",
    answer:
      "JSON to CSV expects an array of objects. Each object's keys become column headers.",
  },
  {
    question: "Are quoted fields supported?",
    answer:
      "Yes. Fields wrapped in double quotes can contain delimiters and line breaks. Escaped quotes (\"\") are supported.",
  },
];
