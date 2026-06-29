import { categories } from "./categories";
import { getLocalizedCategory, getLocalizedTool } from "./i18n/localized-data";
import type { Locale } from "./i18n/types";
import { tools } from "./registry";
import { buildLocalizedUrl } from "./seo";

function appendToolSection(lines: string[], locale: Locale, heading: string): void {
  lines.push("", heading);
  for (const tool of tools) {
    const { title, description } = getLocalizedTool(tool, locale);
    const url = buildLocalizedUrl(locale, `/tools/${tool.slug}`);
    lines.push(`- [${title}](${url}): ${description}`);
  }
}

function appendCategorySection(lines: string[], locale: Locale, heading: string): void {
  lines.push("", heading);
  for (const category of categories) {
    const { name, description } = getLocalizedCategory(category, locale);
    const url = buildLocalizedUrl(locale, `/${category.id}`);
    lines.push(`- [${name}](${url}): ${description}`);
  }
}

/**
 * Build llms.txt (Markdown) from the tool registry so it stays in sync with new tools.
 */
export function generateLlmsTxt(): string {
  const lines: string[] = [
    "# kitzos",
    "> Free browser-based tools — no sign-up, no server uploads. Privacy-first.",
    "> Available in English and Arabic.",
  ];

  appendToolSection(lines, "en", "## Tools (English)");
  appendToolSection(lines, "ar", "## Tools (العربية)");

  appendCategorySection(lines, "en", "## Categories (English)");
  appendCategorySection(lines, "ar", "## Categories (العربية)");

  lines.push(
    "",
    "## About",
    `- [About](${buildLocalizedUrl("en", "/about")}) | [من نحن](${buildLocalizedUrl("ar", "/about")})`,
    `- [Privacy](${buildLocalizedUrl("en", "/privacy")}) | [الخصوصية](${buildLocalizedUrl("ar", "/privacy")})`,
    ""
  );

  return lines.join("\n");
}
