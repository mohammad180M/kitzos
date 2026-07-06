import { toolsLite, type ToolLite } from "@/lib/registry-lite";
import type { Locale } from "./types";

export function searchToolsLocalized(query: string, locale: Locale): ToolLite[] {
  const q = query.trim().toLowerCase();
  if (!q) return toolsLite;

  return toolsLite.filter((tool) => {
    const haystack = [
      tool.title,
      tool.description,
      tool.category,
      ...tool.keywords,
      ...(locale === "ar"
        ? [tool.titleAr, tool.descriptionAr, ...tool.keywordsAr]
        : []),
    ]
      .join(" ")
      .toLowerCase();

    const terms = q.split(/\s+/);
    return terms.every((term) => haystack.includes(term));
  });
}

export type { ToolLite };
