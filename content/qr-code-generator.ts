import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Choose content type",
    description:
      "Pick Website, Text, Wi‑Fi, Email, Phone, or vCard. For PDF, Image, or Video, paste a ready URL — nothing is uploaded or hosted here.",
  },
  {
    title: "Customize the design",
    description:
      "Use Shape, Logo, Level, and Frame to style modules, colors, finders, and an optional center logo. Higher error correction (Q/H) helps when a logo is present.",
  },
  {
    title: "Preview and download",
    description:
      "Scan the live preview with your phone, then download PNG (with logo) or SVG (vector styling).",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What can I encode in a QR code?",
    answer:
      "URLs, plain text, Wi‑Fi credentials, email, phone numbers, and vCard contact details. PDF, image, and video tabs expect a link you already host elsewhere — this tool does not upload or host files.",
  },
  {
    question: "Will a logo still scan reliably?",
    answer:
      "Yes if you keep the logo modest and use Q or H error correction. The tool raises the level automatically when a logo is added. Always test with your phone before printing.",
  },
  {
    question: "What is the difference between PNG and SVG?",
    answer:
      "PNG is a raster image and includes an embedded logo when you add one. SVG is a vector export of the stylized modules and frame; logos are omitted from SVG for reliability.",
  },
  {
    question: "Is my data uploaded?",
    answer:
      "No. Generation and logo processing run entirely in your browser. Static QR codes do not expire; the encoded payload stays whatever you entered.",
  },
];
