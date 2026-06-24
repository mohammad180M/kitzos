import type { ComponentType } from "react";
import MergePdf from "@/tools/merge-pdf";
import CompressImage from "@/tools/compress-image";
import ImageResizer from "@/tools/image-resizer";
import WordCounter from "@/tools/word-counter";
import CaseConverter from "@/tools/case-converter";
import PasswordGenerator from "@/tools/password-generator";
import QrCodeGenerator from "@/tools/qr-code-generator";
import JsonFormatter from "@/tools/json-formatter";
import Base64Tool from "@/tools/base64";
import ColorPicker from "@/tools/color-picker";

const toolComponents: Record<string, ComponentType> = {
  "merge-pdf": MergePdf,
  "compress-image": CompressImage,
  "image-resizer": ImageResizer,
  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "password-generator": PasswordGenerator,
  "qr-code-generator": QrCodeGenerator,
  "json-formatter": JsonFormatter,
  base64: Base64Tool,
  "color-picker": ColorPicker,
};

export function getToolComponent(slug: string): ComponentType | null {
  return toolComponents[slug] ?? null;
}
