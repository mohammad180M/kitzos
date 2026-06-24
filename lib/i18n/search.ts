import { tools, type Tool } from "@/lib/registry";
import type { Locale } from "./types";
import { getArabicKeywords } from "./localized-data";
import toolsAr from "@/locales/tools.ar.json";

type ToolAr = { title: string; description: string; keywords?: string[] };
const toolsArMap = toolsAr as Record<string, ToolAr>;

export function searchToolsLocalized(query: string, locale: Locale): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;

  return tools.filter((tool) => {
    const ar = locale === "ar" ? toolsArMap[tool.slug] : undefined;
    const haystack = [
      tool.title,
      tool.description,
      tool.category,
      ...tool.keywords,
      ...(ar ? [ar.title, ar.description, ...(ar.keywords ?? getArabicKeywords(tool.slug))] : []),
    ]
      .join(" ")
      .toLowerCase();

    const terms = q.split(/\s+/);
    return terms.every((term) => haystack.includes(term));
  });
}
