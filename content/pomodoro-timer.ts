import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Set work and break durations",
    description:
      "Adjust the work interval (default 25 minutes) and break interval (default 5 minutes) to match your preferred Pomodoro schedule.",
  },
  {
    title: "Start the timer",
    description:
      "Press play to begin a focused work session. The display counts down in minutes and seconds.",
  },
  {
    title: "Take breaks between sessions",
    description:
      "When the work timer ends, a break phase starts automatically. A chime plays if sound alerts are enabled.",
  },
  {
    title: "Track completed cycles",
    description:
      "The cycle counter increments each time you finish a work interval, helping you measure how many Pomodoros you complete in a day.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is the Pomodoro Technique?",
    answer:
      "It is a productivity method where you work in focused intervals (traditionally 25 minutes) separated by short breaks. Regular breaks help sustain concentration and reduce burnout.",
  },
  {
    question: "Can I change the timer durations?",
    answer:
      "Yes. Set custom work and break lengths in minutes before starting. Use Apply to reset the current session with your new durations.",
  },
  {
    question: "Does the timer make a sound?",
    answer:
      "A short chime plays when a work or break period ends if sound is enabled. You can toggle sound off if you prefer silent alerts.",
  },
  {
    question: "Does the timer keep running if I switch tabs?",
    answer:
      "Yes. The timer runs in your browser while the tab is open. For best results, keep the tab active or return before the interval ends.",
  },
];
