/**
 * Server-only article loader. Reads markdown from disk at build/request time.
 * Never import this module from a client component — it uses Node `fs`.
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { marked } from "marked";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { localizedPath } from "@/lib/i18n/routing";

const ARTICLES_DIR = join(process.cwd(), "content", "articles");

export interface ArticleFrontmatter {
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
}

export interface ArticleDocument {
  slug: string;
  locale: Locale;
  frontmatter: ArticleFrontmatter;
  /** Markdown body without frontmatter */
  markdown: string;
  /** HTML for the intro (content before the first ## heading) */
  introHtml: string;
  /** HTML for the rest of the article (from the first ## onward) */
  bodyHtml: string;
}

interface ParsedMatter {
  data: Record<string, string>;
  content: string;
}

/** Tiny YAML-ish frontmatter parser (key: value lines only). */
export function parseFrontmatter(raw: string): ParsedMatter {
  const trimmed = raw.replace(/^\uFEFF/, "");
  if (!trimmed.startsWith("---")) {
    return { data: {}, content: trimmed };
  }
  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, content: trimmed };
  }
  const matterBlock = trimmed.slice(3, end).trim();
  const content = trimmed.slice(end + 4).replace(/^\r?\n/, "");
  const data: Record<string, string> = {};
  for (const line of matterBlock.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[match[1]] = value;
  }
  return { data, content };
}

function articlePath(slug: string, locale: Locale): string {
  return join(ARTICLES_DIR, `${slug}.${locale}.md`);
}

export function articleFileExists(slug: string, locale: Locale): boolean {
  return existsSync(articlePath(slug, locale));
}

/** True when both EN and AR article files exist for the slug. */
export function hasArticle(slug: string): boolean {
  return articleFileExists(slug, "en") && articleFileExists(slug, "ar");
}

/**
 * Slugs that have a complete EN+AR article pair.
 * Filename pattern: `{slug}.{locale}.md`
 */
export function listArticleSlugs(): string[] {
  if (!existsSync(ARTICLES_DIR)) return [];

  const en = new Set<string>();
  const ar = new Set<string>();

  for (const name of readdirSync(ARTICLES_DIR)) {
    const match = name.match(/^(.+)\.(en|ar)\.md$/);
    if (!match) continue;
    if (match[2] === "en") en.add(match[1]);
    else ar.add(match[1]);
  }

  return Array.from(en).filter((slug) => ar.has(slug)).sort();
}

/** Normalize internal hrefs: locale prefix + trailing slash. */
export function rewriteArticleLinks(html: string, locale: Locale): string {
  return html.replace(/href="([^"]+)"/g, (full, href: string) => {
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("#") ||
      href.startsWith("//")
    ) {
      return full;
    }

    let path = href;
    // Strip accidental absolute site origin
    path = path.replace(/^https?:\/\/kitzos\.com/i, "");

    // Already locale-prefixed?
    const localePrefixed = path.match(/^\/(en|ar)(\/.*)?$/);
    if (localePrefixed) {
      const rest = localePrefixed[2] || "/";
      const withSlash = rest.endsWith("/") ? rest : `${rest}/`;
      return `href="${localizedPath(localePrefixed[1] as Locale, withSlash === "//" ? "/" : withSlash)}"`;
    }

    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    const withSlash = path.endsWith("/") ? path : `${path}/`;
    return `href="${localizedPath(locale, withSlash)}"`;
  });
}

function splitIntroAndBody(markdown: string): { intro: string; body: string } {
  // Drop a leading H1 — the page already renders frontmatter.title as the document h1.
  const withoutH1 = markdown.replace(/^#\s+[^\n]+\n+/, "");
  const match = withoutH1.match(/^([\s\S]*?)(\n##\s)/);
  if (!match) {
    return { intro: withoutH1.trim(), body: "" };
  }
  return {
    intro: match[1].trim(),
    body: withoutH1.slice(match[1].length).trim(),
  };
}

function requireFrontmatter(
  data: Record<string, string>,
  slug: string,
  locale: Locale
): ArticleFrontmatter {
  const required = ["title", "description", "datePublished", "dateModified"] as const;
  for (const key of required) {
    if (!data[key]?.trim()) {
      throw new Error(
        `Article ${slug}.${locale}.md is missing required frontmatter field "${key}"`
      );
    }
  }
  return {
    title: data.title,
    description: data.description,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
  };
}

function renderMarkdown(markdown: string, locale: Locale): string {
  const html = marked.parse(markdown, { async: false }) as string;
  return rewriteArticleLinks(html, locale);
}

export function getArticle(slug: string, locale: Locale): ArticleDocument | null {
  const file = articlePath(slug, locale);
  if (!existsSync(file)) return null;

  const raw = readFileSync(file, "utf8");
  const { data, content } = parseFrontmatter(raw);
  const frontmatter = requireFrontmatter(data, slug, locale);
  const { intro, body } = splitIntroAndBody(content);

  return {
    slug,
    locale,
    frontmatter,
    markdown: content,
    introHtml: intro ? renderMarkdown(intro, locale) : "",
    bodyHtml: body ? renderMarkdown(body, locale) : "",
  };
}

/** Locale-pair validation used by the build pipeline. */
export function validateArticleLocalePairs(): string[] {
  if (!existsSync(ARTICLES_DIR)) return [];

  const byLocale: Record<Locale, Set<string>> = { en: new Set(), ar: new Set() };

  for (const name of readdirSync(ARTICLES_DIR)) {
    const match = name.match(/^(.+)\.(en|ar)\.md$/);
    if (!match) continue;
    byLocale[match[2] as Locale].add(match[1]);
  }

  const errors: string[] = [];
  for (const locale of LOCALES) {
    const other: Locale = locale === "en" ? "ar" : "en";
    for (const slug of Array.from(byLocale[locale])) {
      if (!byLocale[other].has(slug)) {
        errors.push(
          `Article locale mismatch: "${slug}" has ${locale}.md but missing ${other}.md`
        );
      }
    }
  }
  return errors;
}
