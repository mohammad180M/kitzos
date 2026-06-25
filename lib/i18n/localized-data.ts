import type { Category, CategoryId } from "@/lib/categories";
import type { Tool } from "@/lib/registry";
import type { FaqItem, HowToStep } from "@/lib/seo";
import type { Locale } from "./types";
import categoriesAr from "@/locales/categories.ar.json";
import toolsAr from "@/locales/tools.ar.json";
import extraToolsAr from "@/locales/extra-tools.ar.json";
import contentAr from "@/locales/content.ar.json";

type CategoryAr = { name: string; description: string };
type ToolAr = { title: string; description: string; keywords?: string[] };
type ToolContentAr = { howTo: HowToStep[]; faq: FaqItem[] };

const categoriesArMap = categoriesAr as Record<CategoryId, CategoryAr>;
const toolsArMap = { ...(toolsAr as Record<string, ToolAr>), ...(extraToolsAr as Record<string, ToolAr>) };
const contentArMap = contentAr as Record<string, ToolContentAr>;

export function getLocalizedCategory(
  category: Category,
  locale: Locale
): { name: string; description: string } {
  if (locale === "ar" && categoriesArMap[category.id]) {
    return categoriesArMap[category.id];
  }
  return { name: category.name, description: category.description };
}

export function getLocalizedTool(
  tool: Tool,
  locale: Locale
): { title: string; description: string } {
  if (locale === "ar" && toolsArMap[tool.slug]) {
    const ar = toolsArMap[tool.slug];
    return { title: ar.title, description: ar.description };
  }
  return { title: tool.title, description: tool.description };
}

export function getLocalizedToolContent(
  slug: string,
  locale: Locale
): { howTo: HowToStep[]; faq: FaqItem[] } {
  if (locale === "ar" && contentArMap[slug]) {
    return contentArMap[slug];
  }
  return { howTo: [], faq: [] };
}

export function getArabicKeywords(slug: string): string[] {
  return toolsArMap[slug]?.keywords ?? [];
}
