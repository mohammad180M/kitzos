import { categories } from "./categories";
import { tools } from "./registry";
import { buildLocalizedUrl } from "./seo";
import { DEFAULT_LOCALE } from "./i18n/types";

const LLMS_LOCALE = DEFAULT_LOCALE;

/**
 * Build llms.txt (Markdown) from the tool registry so it stays in sync with new tools.
 */
export function generateLlmsTxt(): string {
  const lines: string[] = [
    "# kitzos",
    "> Free browser-based tools — no sign-up, no server uploads. Privacy-first.",
    "> Available in English and Arabic.",
    "",
    "## Tools",
  ];

  for (const tool of tools) {
    const url = buildLocalizedUrl(LLMS_LOCALE, `/tools/${tool.slug}`);
    lines.push(`- [${tool.title}](${url}): ${tool.description}`);
  }

  lines.push("", "## Categories");

  for (const category of categories) {
    const url = buildLocalizedUrl(LLMS_LOCALE, `/${category.id}`);
    lines.push(`- [${category.name}](${url}): ${category.description}`);
  }

  lines.push(
    "",
    "## About",
    `- [About](${buildLocalizedUrl(LLMS_LOCALE, "/about")})`,
    `- [Privacy](${buildLocalizedUrl(LLMS_LOCALE, "/privacy")})`,
    ""
  );

  return lines.join("\n");
}
