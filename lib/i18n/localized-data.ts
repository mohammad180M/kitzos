import type { FaqItem, HowToStep } from "@/lib/seo";
import type { Locale } from "./types";
import contentAr from "@/locales/content.ar.json";
import {
  getArabicKeywords,
  getLocalizedCategory,
  getLocalizedTool,
} from "./localized-labels";

type ToolContentAr = { howTo: HowToStep[]; faq: FaqItem[] };

const contentArMap = contentAr as Record<string, ToolContentAr>;

export { getArabicKeywords, getLocalizedCategory, getLocalizedTool };

export function getLocalizedToolContent(
  slug: string,
  locale: Locale
): { howTo: HowToStep[]; faq: FaqItem[] } {
  if (locale === "ar" && contentArMap[slug]) {
    return contentArMap[slug];
  }
  return { howTo: [], faq: [] };
}
