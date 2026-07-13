import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Enter text or a URL",
    description:
      "Type any text, link, phone number, or Wi-Fi credentials into the input field. The QR code updates live.",
  },
  {
    title: "Preview the QR code",
    description:
      "A scannable QR code appears instantly. Test it with your phone camera to verify it encodes the correct data.",
  },
  {
    title: "Download as PNG or SVG",
    description:
      "Save the QR code as a PNG image for general use, or as SVG for print-quality scalable graphics.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What can I encode in a QR code?",
    answer:
      "You can encode URLs, plain text, email addresses, phone numbers, and Wi-Fi network details. Keep text reasonably short for reliable scanning.",
  },
  {
    question: "What is the difference between PNG and SVG?",
    answer:
      "PNG is a raster image ideal for web and social media. SVG is a vector format that scales to any size without losing quality — great for print.",
  },
  {
    question: "Do QR codes expire?",
    answer:
      "Static QR codes like those generated here never expire. The encoded data is permanent unless you change the destination URL.",
  },
  {
    question: "Is there a size or length limit?",
    answer:
      "QR codes can hold up to roughly 4,000 characters depending on content type, but shorter content scans more reliably. Output size is adjustable from 128px to 512px.",
  },
];
