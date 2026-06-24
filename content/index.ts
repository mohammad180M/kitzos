import type { FaqItem, HowToStep } from "@/lib/seo";

import * as mergePdf from "./merge-pdf";
import * as splitPdf from "./split-pdf";
import * as pdfToJpg from "./pdf-to-jpg";
import * as compressImage from "./compress-image";
import * as imageResizer from "./image-resizer";
import * as cropImage from "./crop-image";
import * as imageConverter from "./image-converter";
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
};

export function getToolContent(slug: string): ToolContent {
  return (
    contentMap[slug] ?? {
      howTo: [],
      faq: [],
    }
  );
}
