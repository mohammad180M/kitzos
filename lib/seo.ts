import type { Metadata } from "next";
import type { Category } from "./categories";
import { getCategoryById } from "./categories";
import { getDictionary } from "./i18n/dictionaries";
import { getLocalizedCategory, getLocalizedTool, getArabicKeywords } from "./i18n/localized-data";
import { localizedPath } from "./i18n/routing";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./i18n/types";
import type { Tool } from "./registry";

const SITE_NAME = "kitzos";
const SITE_URL = "https://kitzos.com";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  title: string;
  description: string;
}

export function getSiteUrl(): string {
  return SITE_URL;
}

export function buildLocalizedUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localizedPath(locale, path)}`;
}

export function buildLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = buildLocalizedUrl(locale, path);
  }
  languages["x-default"] = buildLocalizedUrl(DEFAULT_LOCALE, path);
  return languages;
}

function buildCanonicalAlternates(locale: Locale, path: string) {
  return {
    canonical: buildLocalizedUrl(locale, path),
    languages: buildLanguageAlternates(path),
  };
}

export function getBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — Free Online Tools`,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "Free online tools for PDF, images, text, and developers. Fast, private, and works in your browser — no signup required.",
    keywords: [
      "online tools",
      "free tools",
      "pdf tools",
      "image tools",
      "text tools",
      "developer tools",
    ],
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function getHomeMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  const title = t.home.title;
  const description = t.home.subtitle;
  const path = "/";

  return {
    title,
    description,
    alternates: buildCanonicalAlternates(locale, path),
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: buildLocalizedUrl(locale, path),
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
    twitter: {
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function getToolMetadata(tool: Tool, locale: Locale): Metadata {
  const { title, description } = getLocalizedTool(tool, locale);
  const keywords =
    locale === "ar" && getArabicKeywords(tool.slug).length > 0
      ? getArabicKeywords(tool.slug)
      : tool.keywords;
  const path = `/tools/${tool.slug}`;

  return {
    title,
    description,
    keywords,
    alternates: buildCanonicalAlternates(locale, path),
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: buildLocalizedUrl(locale, path),
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
    twitter: {
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function getCategoryMetadata(category: Category, locale: Locale): Metadata {
  const { name, description } = getLocalizedCategory(category, locale);
  const path = `/${category.id}`;

  return {
    title: name,
    description,
    alternates: buildCanonicalAlternates(locale, path),
    openGraph: {
      title: `${name} | ${SITE_NAME}`,
      description,
      url: buildLocalizedUrl(locale, path),
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
  };
}

export function getInfoPageMetadata(
  locale: Locale,
  title: string,
  description: string,
  path: string
): Metadata {
  return {
    title,
    description,
    alternates: buildCanonicalAlternates(locale, path),
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: buildLocalizedUrl(locale, path),
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
    twitter: {
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export type LegalPageKey = "privacy" | "terms" | "about" | "contact";

export function getLegalPageMetadata(locale: Locale, page: LegalPageKey): Metadata {
  const t = getDictionary(locale);
  const pages: Record<
    LegalPageKey,
    { title: string; description: string; path: string }
  > = {
    privacy: {
      title: t.legal.privacyTitle,
      description: t.legal.privacyDescription,
      path: "/privacy",
    },
    terms: {
      title: t.legal.termsTitle,
      description: t.legal.termsDescription,
      path: "/terms",
    },
    about: {
      title: t.legal.aboutTitle,
      description: t.legal.aboutDescription,
      path: "/about",
    },
    contact: {
      title: t.legal.contactTitle,
      description: t.legal.contactDescription,
      path: "/contact",
    },
  };
  const config = pages[page];
  return getInfoPageMetadata(locale, config.title, config.description, config.path);
}

export function generateSoftwareApplicationSchema(tool: Tool, locale: Locale): object {
  const { title, description } = getLocalizedTool(tool, locale);
  const path = `/tools/${tool.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description,
    inLanguage: locale === "ar" ? "ar" : "en",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: buildLocalizedUrl(locale, path),
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFaqSchema(faqs: FaqItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateToolBreadcrumbs(
  tool: Tool,
  locale: Locale
): { name: string; url: string }[] {
  const t = getDictionary(locale);
  const category = getCategoryById(tool.category);
  const { title } = getLocalizedTool(tool, locale);
  const categoryLabel = category
    ? getLocalizedCategory(category, locale).name
    : tool.category;

  return [
    { name: t.common.home, url: buildLocalizedUrl(locale, "/") },
    {
      name: categoryLabel,
      url: buildLocalizedUrl(locale, `/${tool.category}`),
    },
    { name: title, url: buildLocalizedUrl(locale, `/tools/${tool.slug}`) },
  ];
}

/** Build sitemap hreflang alternates (en + ar, no x-default — Next.js sitemap format). */
export function buildSitemapLanguageAlternates(
  path: string
): Record<string, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [locale, buildLocalizedUrl(locale, path)])
  );
}
