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
    question: "How does auto-save work?",
    answer:
      "After you pause typing for a moment, your notes save automatically in this browser on this device. A Saving indicator appears briefly, then Saved. Live word and character counts show above the editor.",
  },
  {
    question: "Can I open my notes on another device?",
    answer:
      "No. Notes stay in this browser on this device and do not sync across browsers or phones. Copy the text if you need it elsewhere.",
  },
  {
    question: "Will Clear or clearing browser data erase my notes?",
    answer:
      "Yes. Clear asks for confirmation, then wipes the notepad and deletes the saved copy in this browser. Clearing site data for this site also removes them.",
  },
  {
    question: "Do my notes leave my device?",
    answer:
      "No. Your notes are never uploaded — they remain only in this browser on your device until you clear them or remove site data.",
  },
];
