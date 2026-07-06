import type { Category, CategoryId } from "@/lib/categories";
import type { ToolLite } from "@/lib/registry-lite";
import { getToolBySlugLite } from "@/lib/registry-lite";
import type { Locale } from "./types";
import categoriesAr from "@/locales/categories.ar.json";

type CategoryAr = { name: string; description: string };

const categoriesArMap = categoriesAr as Record<CategoryId, CategoryAr>;

/** Minimal fields for localization; full registry `Tool` is accepted via lite lookup. */
export type LocalizableTool = {
  slug: string;
  title: string;
  description: string;
  titleAr?: string;
  descriptionAr?: string;
};

/** Client-safe localized labels (no content.ar.json or full registry). */
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
  tool: LocalizableTool,
  locale: Locale
): { title: string; description: string } {
  if (locale === "ar") {
    const lite = getToolBySlugLite(tool.slug);
    return {
      title: tool.titleAr ?? lite?.titleAr ?? tool.title,
      description: tool.descriptionAr ?? lite?.descriptionAr ?? tool.description,
    };
  }
  return { title: tool.title, description: tool.description };
}

export function getArabicKeywords(slug: string): string[] {
  return getToolBySlugLite(slug)?.keywordsAr ?? [];
}

export type { ToolLite };