import type { ComponentType } from "react";
import MergePdf from "@/tools/pdf/merge-pdf";
import SplitPdf from "@/tools/pdf/split-pdf";
import PdfToJpg from "@/tools/pdf/pdf-to-jpg";
import PdfSign from "@/tools/pdf/pdf-sign";
import PdfWatermark from "@/tools/pdf/pdf-watermark";
import PdfProtect from "@/tools/pdf/pdf-protect";
import CompressImage from "@/tools/image/compress-image";
import ImageResizer from "@/tools/image/image-resizer";
import CropImage from "@/tools/image/crop-image";
import ImageConverter from "@/tools/image/image-converter";
import GradientGenerator from "@/tools/image/gradient-generator";
import ExifRemover from "@/tools/image/exif-remover";
import MemeGenerator from "@/tools/image/meme-generator";
import ImageRotator from "@/tools/image/image-rotator";
import AddTextToImage from "@/tools/image/add-text-to-image";
import ImageCollage from "@/tools/image/image-collage";
import PixelateImage from "@/tools/image/pixelate-image";
import ImageToAscii from "@/tools/image/image-to-ascii";
import ImageBorderAdder from "@/tools/image/image-border-adder";
import WordCounter from "@/tools/text/word-counter";
import CaseConverter from "@/tools/text/case-converter";
import PasswordGenerator from "@/tools/text/password-generator";
import MarkdownToHtml from "@/tools/text/markdown-to-html";
import LoremIpsumGenerator from "@/tools/text/lorem-ipsum-generator";
import TextDiffChecker from "@/tools/text/text-diff-checker";
import RemoveLineBreaks from "@/tools/text/remove-line-breaks";
import WordFrequencyCounter from "@/tools/text/word-frequency-counter";
import ArabicDiacriticsRemover from "@/tools/text/arabic-diacritics-remover";
import LineSorter from "@/tools/text/line-sorter";
import TextReverser from "@/tools/text/text-reverser";
import SlugGenerator from "@/tools/text/slug-generator";
import FindAndReplace from "@/tools/text/find-and-replace";
import WhitespaceRemover from "@/tools/text/whitespace-remover";
import TextToAsciiArt from "@/tools/text/text-to-ascii-art";
import CharacterMap from "@/tools/text/character-map";
import QrCodeGenerator from "@/tools/dev/qr-code-generator";
import JsonFormatter from "@/tools/dev/json-formatter";
import Base64Tool from "@/tools/dev/base64";
import ColorPicker from "@/tools/dev/color-picker";
import TimestampConverter from "@/tools/dev/timestamp-converter";
import HashGenerator from "@/tools/dev/hash-generator";
import JwtDecoder from "@/tools/dev/jwt-decoder";
import CsvJsonConverter from "@/tools/dev/csv-json-converter";
import RegexTester from "@/tools/dev/regex-tester";
import OgImageGenerator from "@/tools/dev/og-image-generator";
import FaviconGenerator from "@/tools/dev/favicon-generator";
import SvgPatternGenerator from "@/tools/dev/svg-pattern-generator";
import BoxShadowGenerator from "@/tools/dev/box-shadow-generator";
import SignaturePad from "@/tools/dev/signature-pad";
import ColorPaletteGenerator from "@/tools/dev/color-palette-generator";
import GlassmorphismGenerator from "@/tools/dev/glassmorphism-generator";
import CssMinifier from "@/tools/dev/css-minifier";
import JsMinifier from "@/tools/dev/js-minifier";
import XmlFormatter from "@/tools/dev/xml-formatter";
import SqlFormatter from "@/tools/dev/sql-formatter";
import UrlEncoderDecoder from "@/tools/dev/url-encoder-decoder";
import UuidGenerator from "@/tools/dev/uuid-generator";
import CronExpressionParser from "@/tools/dev/cron-expression-parser";
import ColorCodeConverter from "@/tools/dev/color-code-converter";
import MetaTagGenerator from "@/tools/dev/meta-tag-generator";
import HtaccessRedirectGenerator from "@/tools/dev/htaccess-redirect-generator";
import LoremPicsumPlaceholder from "@/tools/dev/lorem-picsum-placeholder";
import JsonToTypescript from "@/tools/dev/json-to-typescript";
import BmiCalculator from "@/tools/calculators/bmi-calculator";
import CalorieCalculator from "@/tools/calculators/calorie-calculator";
import PercentageCalculator from "@/tools/calculators/percentage-calculator";
import LoanCalculator from "@/tools/calculators/loan-calculator";
import DueDateCalculator from "@/tools/calculators/due-date-calculator";
import DateDifference from "@/tools/calculators/date-difference";
import AgeCalculator from "@/tools/calculators/age-calculator";
import TipCalculator from "@/tools/calculators/tip-calculator";
import GpaCalculator from "@/tools/calculators/gpa-calculator";
import CompoundInterest from "@/tools/calculators/compound-interest";
import MortgageCalculator from "@/tools/calculators/mortgage-calculator";
import FuelCostCalculator from "@/tools/calculators/fuel-cost-calculator";
import DiscountCalculator from "@/tools/calculators/discount-calculator";
import AspectRatioCalculator from "@/tools/calculators/aspect-ratio-calculator";
import NumberBaseConverter from "@/tools/calculators/number-base-converter";
import UnitConverter from "@/tools/converters/unit-converter";
import RomanNumeralConverter from "@/tools/converters/roman-numeral-converter";
import NumberToWords from "@/tools/converters/number-to-words";
import FileSizeConverter from "@/tools/converters/file-size-converter";
import TemperatureConverter from "@/tools/converters/temperature-converter";
import DataUnitConverter from "@/tools/converters/data-unit-converter";
import CookingConverter from "@/tools/converters/cooking-converter";
import HijriGregorianConverter from "@/tools/converters/hijri-gregorian-converter";
import PomodoroTimer from "@/tools/misc/pomodoro-timer";
import RandomPicker from "@/tools/misc/random-picker";
import TypingSpeedTest from "@/tools/misc/typing-speed-test";
import OnlineNotepad from "@/tools/misc/online-notepad";
import InteractionFx from "@/tools/misc/interaction-fx";
import CertificateGenerator from "@/tools/misc/certificate-generator";
import BarcodeGenerator from "@/tools/misc/barcode-generator";
import StopwatchTimer from "@/tools/misc/stopwatch-timer";
import Mp3Cutter from "@/tools/audio/mp3-cutter";
import AudioConverter from "@/tools/audio/audio-converter";
import AudioMerger from "@/tools/audio/audio-merger";
import VoiceRecorder from "@/tools/audio/voice-recorder";
import ImageToText from "@/tools/vision/image-to-text";

const toolComponents: Record<string, ComponentType> = {
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "pdf-to-jpg": PdfToJpg,
  "pdf-sign": PdfSign,
  "pdf-watermark": PdfWatermark,
  "pdf-protect": PdfProtect,
  "compress-image": CompressImage,
  "image-resizer": ImageResizer,
  "crop-image": CropImage,
  "image-converter": ImageConverter,
  "gradient-generator": GradientGenerator,
  "exif-remover": ExifRemover,
  "meme-generator": MemeGenerator,
  "image-rotator": ImageRotator,
  "add-text-to-image": AddTextToImage,
  "image-collage": ImageCollage,
  "pixelate-image": PixelateImage,
  "image-to-ascii": ImageToAscii,
  "image-border-adder": ImageBorderAdder,
  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "password-generator": PasswordGenerator,
  "markdown-to-html": MarkdownToHtml,
  "lorem-ipsum-generator": LoremIpsumGenerator,
  "text-diff-checker": TextDiffChecker,
  "remove-line-breaks": RemoveLineBreaks,
  "word-frequency-counter": WordFrequencyCounter,
  "arabic-diacritics-remover": ArabicDiacriticsRemover,
  "line-sorter": LineSorter,
  "text-reverser": TextReverser,
  "slug-generator": SlugGenerator,
  "find-and-replace": FindAndReplace,
  "whitespace-remover": WhitespaceRemover,
  "text-to-ascii-art": TextToAsciiArt,
  "character-map": CharacterMap,
  "qr-code-generator": QrCodeGenerator,
  "json-formatter": JsonFormatter,
  base64: Base64Tool,
  "color-picker": ColorPicker,
  "timestamp-converter": TimestampConverter,
  "hash-generator": HashGenerator,
  "jwt-decoder": JwtDecoder,
  "csv-json-converter": CsvJsonConverter,
  "regex-tester": RegexTester,
  "og-image-generator": OgImageGenerator,
  "favicon-generator": FaviconGenerator,
  "svg-pattern-generator": SvgPatternGenerator,
  "box-shadow-generator": BoxShadowGenerator,
  "signature-pad": SignaturePad,
  "color-palette-generator": ColorPaletteGenerator,
  "glassmorphism-generator": GlassmorphismGenerator,
  "css-minifier": CssMinifier,
  "js-minifier": JsMinifier,
  "xml-formatter": XmlFormatter,
  "sql-formatter": SqlFormatter,
  "url-encoder-decoder": UrlEncoderDecoder,
  "uuid-generator": UuidGenerator,
  "cron-expression-parser": CronExpressionParser,
  "color-code-converter": ColorCodeConverter,
  "meta-tag-generator": MetaTagGenerator,
  "htaccess-redirect-generator": HtaccessRedirectGenerator,
  "lorem-picsum-placeholder": LoremPicsumPlaceholder,
  "json-to-typescript": JsonToTypescript,
  "bmi-calculator": BmiCalculator,
  "calorie-calculator": CalorieCalculator,
  "percentage-calculator": PercentageCalculator,
  "loan-calculator": LoanCalculator,
  "due-date-calculator": DueDateCalculator,
  "date-difference": DateDifference,
  "age-calculator": AgeCalculator,
  "tip-calculator": TipCalculator,
  "gpa-calculator": GpaCalculator,
  "compound-interest": CompoundInterest,
  "mortgage-calculator": MortgageCalculator,
  "fuel-cost-calculator": FuelCostCalculator,
  "discount-calculator": DiscountCalculator,
  "aspect-ratio-calculator": AspectRatioCalculator,
  "number-base-converter": NumberBaseConverter,
  "unit-converter": UnitConverter,
  "roman-numeral-converter": RomanNumeralConverter,
  "number-to-words": NumberToWords,
  "file-size-converter": FileSizeConverter,
  "temperature-converter": TemperatureConverter,
  "data-unit-converter": DataUnitConverter,
  "cooking-converter": CookingConverter,
  "hijri-gregorian-converter": HijriGregorianConverter,
  "pomodoro-timer": PomodoroTimer,
  "random-picker": RandomPicker,
  "typing-speed-test": TypingSpeedTest,
  "online-notepad": OnlineNotepad,
  "interaction-fx": InteractionFx,
  "certificate-generator": CertificateGenerator,
  "barcode-generator": BarcodeGenerator,
  "stopwatch-timer": StopwatchTimer,
  "mp3-cutter": Mp3Cutter,
  "audio-converter": AudioConverter,
  "audio-merger": AudioMerger,
  "voice-recorder": VoiceRecorder,
  "image-to-text": ImageToText,
};

export function getToolComponent(slug: string): ComponentType | null {
  return toolComponents[slug] ?? null;
}
