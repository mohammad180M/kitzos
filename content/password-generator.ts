import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Set password length",
    description:
      "Use the slider to choose a length between 8 and 64 characters. Longer passwords are generally more secure.",
  },
  {
    title: "Choose character types",
    description:
      "Toggle uppercase, lowercase, numbers, and symbols. At least one type must be enabled.",
  },
  {
    title: "Generate and copy",
    description:
      "Click Generate to create a new random password. Use Copy to save it to your clipboard. Check the strength indicator for guidance.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What password length can I choose?",
    answer:
      "Use the slider to pick 8–64 characters. The strength meter updates with your length and character-type choices.",
  },
  {
    question: "What makes a strong password?",
    answer:
      "A strong password is at least 12 characters long and mixes uppercase, lowercase, numbers, and symbols. Avoid dictionary words and personal information.",
  },
  {
    question: "Are generated passwords stored anywhere?",
    answer:
      "No. Each password exists only in your browser session until you copy it — nothing is logged or sent online.",
  },
  {
    question: "Can I regenerate a new password?",
    answer:
      "Yes. Click Generate as many times as you like until you get a password you are happy with.",
  },
];
