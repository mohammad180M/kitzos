import type { FaqItem, HowToStep } from "@/lib/seo";

export const howTo: HowToStep[] = [
  {
    title: "Upload an image",
    description:
      "Choose any common image format (PNG, JPG, WebP, etc.). A preview appears with a crop selection over it.",
  },
  {
    title: "Pick a shape mode",
    description:
      "Select Rectangle for freeform or fixed aspect ratios (1:1, 4:3, 16:9), Circle for profile photos, or Rounded square with an adjustable corner radius.",
  },
  {
    title: "Adjust the crop area",
    description:
      "Drag the selection to reposition it. Drag the corner handle to resize. Circle and rounded modes keep a square selection.",
  },
  {
    title: "Download the crop",
    description:
      "Rectangle mode exports in the source format when possible. Circle and rounded-square modes export PNG with transparency outside the shape.",
  },
];

export const faq: FaqItem[] = [
  {
    question: "What crop shapes and ratios are available?",
    answer:
      "Rectangle, circle, or rounded square. Rectangle presets include Free, 1:1, 4:3, 16:9, 3:4, and 9:16. Zoom (100–400%) and pan to frame the crop.",
  },
  {
    question: "Do circle and rounded crops keep transparency?",
    answer:
      "Yes. Those modes export PNG with transparent pixels outside the shape — useful for profile photos and stickers. Corner radius for rounded square is adjustable (0–48%).",
  },
  {
    question: "What format does a rectangle crop download as?",
    answer:
      "JPEG if the source is JPEG; otherwise PNG, so transparency from PNG sources can be kept.",
  },
  {
    question: "Is cropping done on a server?",
    answer:
      "No. Your photo is cropped in the browser and downloaded from your device — nothing is uploaded.",
  },
];
