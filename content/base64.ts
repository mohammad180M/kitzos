import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose encode or decode",
    description:
      "Toggle between Encode and Decode mode depending on whether you want to convert text to Base64 or reverse it.",
  },
  {
    title: "Enter text or upload an image",
    description:
      "Type or paste text in text mode, or switch to image mode to convert a file to a Base64 data URI.",
  },
  {
    title: "Copy the result",
    description:
      "The output updates automatically. Click Copy to use the Base64 string in your code, API, or email embed.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What is Base64 encoding used for?",
    answer:
      "Base64 converts binary data into ASCII text. It is commonly used to embed images in HTML/CSS, send binary data in JSON APIs, and encode credentials.",
  },
  {
    question: "Can I decode an image from Base64?",
    answer:
      "This tool decodes Base64 text to plain text. For image data URIs (data:image/...), the decoded output is binary — use the encode direction to create them from files.",
  },
  {
    question: "Does Base64 encryption make data secure?",
    answer:
      "No. Base64 is encoding, not encryption. Anyone can decode it. Do not use it as a security measure.",
  },
  {
    question: "What character encoding is used?",
    answer:
      "Text is encoded using UTF-8 before Base64 conversion, which correctly handles international characters and emoji.",
  },
];
