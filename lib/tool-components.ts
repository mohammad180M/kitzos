import type { ComponentType } from "react";
import MergePdf from "@/tools/pdf/merge-pdf";
import SplitPdf from "@/tools/pdf/split-pdf";
import PdfToJpg from "@/tools/pdf/pdf-to-jpg";
import CompressImage from "@/tools/image/compress-image";
import ImageResizer from "@/tools/image/image-resizer";
import CropImage from "@/tools/image/crop-image";
import ImageConverter from "@/tools/image/image-converter";
import GradientGenerator from "@/tools/image/gradient-generator";
import WordCounter from "@/tools/text/word-counter";
import CaseConverter from "@/tools/text/case-converter";
import PasswordGenerator from "@/tools/text/password-generator";
import MarkdownToHtml from "@/tools/text/markdown-to-html";
import LoremIpsumGenerator from "@/tools/text/lorem-ipsum-generator";
import TextDiffChecker from "@/tools/text/text-diff-checker";
import RemoveLineBreaks from "@/tools/text/remove-line-breaks";
import QrCodeGenerator from "@/tools/dev/qr-code-generator";
import JsonFormatter from "@/tools/dev/json-formatter";
import Base64Tool from "@/tools/dev/base64";
import ColorPicker from "@/tools/dev/color-picker";
import TimestampConverter from "@/tools/dev/timestamp-converter";
import HashGenerator from "@/tools/dev/hash-generator";
import BmiCalculator from "@/tools/calculators/bmi-calculator";
import CalorieCalculator from "@/tools/calculators/calorie-calculator";
import PercentageCalculator from "@/tools/calculators/percentage-calculator";
import LoanCalculator from "@/tools/calculators/loan-calculator";
import DueDateCalculator from "@/tools/calculators/due-date-calculator";
import DateDifference from "@/tools/calculators/date-difference";
import UnitConverter from "@/tools/converters/unit-converter";
import PomodoroTimer from "@/tools/misc/pomodoro-timer";
import RandomPicker from "@/tools/misc/random-picker";
import TypingSpeedTest from "@/tools/misc/typing-speed-test";
import OnlineNotepad from "@/tools/misc/online-notepad";

const toolComponents: Record<string, ComponentType> = {
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "pdf-to-jpg": PdfToJpg,
  "compress-image": CompressImage,
  "image-resizer": ImageResizer,
  "crop-image": CropImage,
  "image-converter": ImageConverter,
  "gradient-generator": GradientGenerator,
  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "password-generator": PasswordGenerator,
  "markdown-to-html": MarkdownToHtml,
  "lorem-ipsum-generator": LoremIpsumGenerator,
  "text-diff-checker": TextDiffChecker,
  "remove-line-breaks": RemoveLineBreaks,
  "qr-code-generator": QrCodeGenerator,
  "json-formatter": JsonFormatter,
  base64: Base64Tool,
  "color-picker": ColorPicker,
  "timestamp-converter": TimestampConverter,
  "hash-generator": HashGenerator,
  "bmi-calculator": BmiCalculator,
  "calorie-calculator": CalorieCalculator,
  "percentage-calculator": PercentageCalculator,
  "loan-calculator": LoanCalculator,
  "due-date-calculator": DueDateCalculator,
  "date-difference": DateDifference,
  "unit-converter": UnitConverter,
  "pomodoro-timer": PomodoroTimer,
  "random-picker": RandomPicker,
  "typing-speed-test": TypingSpeedTest,
  "online-notepad": OnlineNotepad,
};

export function getToolComponent(slug: string): ComponentType | null {
  return toolComponents[slug] ?? null;
}
