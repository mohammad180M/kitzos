import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Paste your JWT",
    description:
      "Paste a JSON Web Token into the input field. The tool decodes header and payload instantly as you type.",
  },
  {
    title: "Inspect claims",
    description:
      "View formatted JSON for the header and payload. Time claims like exp, iat, and nbf show human-readable dates.",
  },
  {
    title: "Copy sections",
    description:
      "Use Copy header or Copy payload to grab decoded JSON. The signature is shown as raw text only.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Does this verify the JWT signature?",
    answer:
      "No. This tool only decodes Base64URL-encoded header and payload. It does not validate the cryptographic signature.",
  },
  {
    question: "Is my token sent to a server?",
    answer:
      "Never. Decoding happens entirely in your browser. Your token never leaves your device.",
  },
  {
    question: "What is Base64URL?",
    answer:
      "JWTs use Base64URL encoding (not standard Base64). Dashes and underscores replace plus and slash, and padding may be omitted.",
  },
  {
    question: "Why does my token show as expired?",
    answer:
      "If the exp (expiration) claim is in the past, the tool labels it expired. That does not mean the token was verified — only that the timestamp has passed.",
  },
];
