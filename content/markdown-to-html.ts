import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Write or paste Markdown",
    description:
      "Enter Markdown in the left panel. Headings, lists, links, and emphasis are all supported.",
  },
  {
    title: "Preview the HTML",
    description:
      "The right panel updates live with rendered HTML. Output is sanitized for safe preview.",
  },
  {
    title: "Copy the HTML",
    description:
      "Click Copy HTML to copy the generated markup to your clipboard for use in emails, CMSs, or templates.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Is the HTML preview safe to use?",
    answer:
      "Yes. Scripts and unsafe tags are stripped from the rendered output before preview and before you copy the HTML.",
  },
  {
    question: "What Markdown features are supported?",
    answer:
      "Common web-style Markdown: headings, bold, italic, lists, links, code blocks, and single line breaks (GitHub-style).",
  },
  {
    question: "Can I paste HTML back into the Markdown field?",
    answer:
      "No. This tool converts Markdown to HTML only. Paste Markdown source, not HTML.",
  },
  {
    question: "Does this work offline?",
    answer:
      "Yes. After the page loads, conversion runs locally in your browser with no server calls.",
  },
];
