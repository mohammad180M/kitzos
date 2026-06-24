import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Start typing your notes",
    description:
      "Click the notepad area and type anything — meeting notes, drafts, to-do lists, or code snippets. No account or save button needed.",
  },
  {
    title: "Let auto-save handle storage",
    description:
      "Your text saves automatically to this browser after a brief pause. A Saved indicator confirms when your latest changes are stored.",
  },
  {
    title: "Track word and character counts",
    description:
      "Live counts at the top help you stay within limits for essays, social posts, or brief messages.",
  },
  {
    title: "Clear when you are done",
    description:
      "Use the Clear button to wipe the notepad and remove saved notes from local storage. You will be asked to confirm first.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Where are my notes saved?",
    answer:
      "Notes are stored in your browser's localStorage on this device only. They persist when you close the tab and return later in the same browser.",
  },
  {
    question: "Can I access my notes on another device?",
    answer:
      "No. Because notes stay in local browser storage, they do not sync across devices or browsers. Copy text manually if you need it elsewhere.",
  },
  {
    question: "Will I lose my notes if I clear browser data?",
    answer:
      "Yes. Clearing site data, cookies, or localStorage for this site will delete your saved notes. Export important text before clearing browser storage.",
  },
  {
    question: "Is the online notepad private?",
    answer:
      "Yes. Your text never leaves your browser or gets sent to a server. Everything stays on your device.",
  },
];
