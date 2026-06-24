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
    question: "Is the HTML output sanitized?",
    answer:
      "Yes. Rendered HTML passes through DOMPurify to strip scripts and unsafe tags before preview and copy.",
  },
  {
    question: "What Markdown features are supported?",
    answer:
      "GitHub Flavored Markdown including headings, bold, italic, lists, links, code blocks, and line breaks.",
  },
  {
    question: "Can I paste HTML back into the Markdown field?",
    answer:
      "This tool converts Markdown to HTML only, not the reverse. Paste Markdown source, not HTML.",
  },
  {
    question: "Does this work offline?",
    answer:
      "Yes. Conversion runs locally with the marked library after the page loads.",
  },
];
