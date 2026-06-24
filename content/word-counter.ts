import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Paste or type your text",
    description:
      "Enter or paste any text into the textarea. Counts update instantly as you type.",
  },
  {
    title: "Review the statistics",
    description:
      "See word count, character count (with and without spaces), sentences, paragraphs, and estimated reading time.",
  },
  {
    title: "Use the counts for your project",
    description:
      "Perfect for essays, blog posts, social media limits, and SEO meta descriptions. No need to click a button — everything is live.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How is the word count calculated?",
    answer:
      "Words are counted by splitting on whitespace. Numbers and hyphenated words each count as a single word.",
  },
  {
    question: "How is reading time estimated?",
    answer:
      "Reading time assumes an average speed of 200 words per minute, which is typical for adult readers of English prose.",
  },
  {
    question: "Does this count characters with spaces?",
    answer:
      "Yes. We show both total characters and characters excluding spaces, so you can match any platform's requirements.",
  },
  {
    question: "Is there a character or word limit?",
    answer:
      "No. You can paste very long documents. Performance depends on your browser, but most texts process instantly.",
  },
];
