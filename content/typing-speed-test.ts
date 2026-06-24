import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Read the sample text",
    description:
      "A random passage appears above the input area. This is the text you need to type exactly to complete the test.",
  },
  {
    title: "Start typing in the box",
    description:
      "Click the textarea and begin typing. The timer starts automatically on your first keystroke.",
  },
  {
    title: "Watch live feedback",
    description:
      "Correct characters turn green, mistakes turn red, and your cursor position is highlighted as you type.",
  },
  {
    title: "Finish and review your score",
    description:
      "Complete the full passage to see your words per minute (WPM) and accuracy percentage. Click reset for a new random sample.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "How is WPM calculated in this typing test?",
    answer:
      "WPM uses the standard formula: correct characters typed divided by 5, divided by elapsed minutes. Only correctly typed characters count toward speed.",
  },
  {
    question: "How is typing accuracy measured?",
    answer:
      "Accuracy is the percentage of characters you typed correctly out of all characters entered so far. Mistakes lower your accuracy even if you correct them later.",
  },
  {
    question: "Does backspacing affect my score?",
    answer:
      "You can backspace to fix errors. WPM is based on correct characters at each position; accuracy reflects how many keystrokes matched the sample.",
  },
  {
    question: "What is a good typing speed?",
    answer:
      "Average adult typing speed is around 40 WPM. 60–80 WPM is considered proficient, and 100+ WPM is fast. Accuracy matters as much as raw speed.",
  },
];
