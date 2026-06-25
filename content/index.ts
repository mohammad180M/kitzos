import type { FaqItem, HowToStep } from "@/lib/seo";
import type { Locale } from "@/lib/i18n/types";
import contentAr from "@/locales/content.ar.json";
import extraContentAr from "@/locales/extra-content.ar.json";
import { extraToolContent } from "./extra-tools";

import * as mergePdf from "./merge-pdf";
import * as splitPdf from "./split-pdf";
import * as pdfToJpg from "./pdf-to-jpg";
import * as compressImage from "./compress-image";
import * as imageResizer from "./image-resizer";
import * as cropImage from "./crop-image";
import * as imageConverter from "./image-converter";
import * as gradientGenerator from "./gradient-generator";
import * as wordCounter from "./word-counter";
import * as caseConverter from "./case-converter";
import * as passwordGenerator from "./password-generator";
import * as markdownToHtml from "./markdown-to-html";
import * as loremIpsumGenerator from "./lorem-ipsum-generator";
import * as textDiffChecker from "./text-diff-checker";
import * as removeLineBreaks from "./remove-line-breaks";
import * as qrCodeGenerator from "./qr-code-generator";
import * as jsonFormatter from "./json-formatter";
import * as base64 from "./base64";
import * as colorPicker from "./color-picker";
import * as timestampConverter from "./timestamp-converter";
import * as hashGenerator from "./hash-generator";
import * as bmiCalculator from "./bmi-calculator";
import * as calorieCalculator from "./calorie-calculator";
import * as percentageCalculator from "./percentage-calculator";
import * as loanCalculator from "./loan-calculator";
import * as dueDateCalculator from "./due-date-calculator";
import * as dateDifference from "./date-difference";
import * as unitConverter from "./unit-converter";
import * as pomodoroTimer from "./pomodoro-timer";
import * as randomPicker from "./random-picker";
import * as typingSpeedTest from "./typing-speed-test";
import * as onlineNotepad from "./online-notepad";

export interface ToolContent {
  howTo: HowToStep[];
  faq: FaqItem[];
}

const contentMap: Record<string, ToolContent> = {
  "merge-pdf": mergePdf,
  "split-pdf": splitPdf,
  "pdf-to-jpg": pdfToJpg,
  "compress-image": compressImage,
  "image-resizer": imageResizer,
  "crop-image": cropImage,
  "image-converter": imageConverter,
  "gradient-generator": gradientGenerator,
  "word-counter": wordCounter,
  "case-converter": caseConverter,
  "password-generator": passwordGenerator,
  "markdown-to-html": markdownToHtml,
  "lorem-ipsum-generator": loremIpsumGenerator,
  "text-diff-checker": textDiffChecker,
  "remove-line-breaks": removeLineBreaks,
  "qr-code-generator": qrCodeGenerator,
  "json-formatter": jsonFormatter,
  base64: base64,
  "color-picker": colorPicker,
  "timestamp-converter": timestampConverter,
  "hash-generator": hashGenerator,
  "bmi-calculator": bmiCalculator,
  "calorie-calculator": calorieCalculator,
  "percentage-calculator": percentageCalculator,
  "loan-calculator": loanCalculator,
  "due-date-calculator": dueDateCalculator,
  "date-difference": dateDifference,
  "unit-converter": unitConverter,
  "pomodoro-timer": pomodoroTimer,
  "random-picker": randomPicker,
  "typing-speed-test": typingSpeedTest,
  "online-notepad": onlineNotepad,
  ...extraToolContent,
};

export function getToolContent(slug: string, locale: Locale = "en"): ToolContent {
  if (locale === "ar") {
    const ar =
      (contentAr as Record<string, ToolContent>)[slug] ??
      (extraContentAr as Record<string, ToolContent>)[slug];
    if (ar) return ar;
  }
  return (
    contentMap[slug] ?? {
      howTo: [],
      faq: [],
    }
  );
}
