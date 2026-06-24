import type { FaqItem, HowToStep } from "@/lib/seo";

import * as mergePdf from "./merge-pdf";
import * as compressImage from "./compress-image";
import * as imageResizer from "./image-resizer";
import * as wordCounter from "./word-counter";
import * as caseConverter from "./case-converter";
import * as passwordGenerator from "./password-generator";
import * as qrCodeGenerator from "./qr-code-generator";
import * as jsonFormatter from "./json-formatter";
import * as base64 from "./base64";
import * as colorPicker from "./color-picker";

export interface ToolContent {
  howTo: HowToStep[];
  faq: FaqItem[];
}

const contentMap: Record<string, ToolContent> = {
  "merge-pdf": mergePdf,
  "compress-image": compressImage,
  "image-resizer": imageResizer,
  "word-counter": wordCounter,
  "case-converter": caseConverter,
  "password-generator": passwordGenerator,
  "qr-code-generator": qrCodeGenerator,
  "json-formatter": jsonFormatter,
  base64: base64,
  "color-picker": colorPicker,
};

export function getToolContent(slug: string): ToolContent {
  return (
    contentMap[slug] ?? {
      howTo: [],
      faq: [],
    }
  );
}
