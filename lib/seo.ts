import type { Metadata } from "next";
import type { Category, CategoryId } from "./categories";
import { getCategoryById } from "./categories";
import { getDictionary } from "./i18n/dictionaries";
import { getLocalizedCategory, getLocalizedTool, getArabicKeywords } from "./i18n/localized-data";
import { localizedPath } from "./i18n/routing";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./i18n/types";
import type { Tool } from "./registry";

const SITE_NAME = "kitzos";
const SITE_URL = "https://kitzos.com";
const DEFAULT_OG_IMAGE = "/og/default.png";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

export function getOgImagePath(categoryId?: CategoryId): string {
  if (categoryId) return `/og/category-${categoryId}.png`;
  return DEFAULT_OG_IMAGE;
}

function buildOgImages(
  alt: string,
  categoryId?: CategoryId
): Array<{ url: string; width: number; height: number; alt: string }> {
  const path = getOgImagePath(categoryId);
  return [
    {
      url: path,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt,
    },
  ];
}

function withSocialImages(
  metadata: Metadata,
  alt: string,
  categoryId?: CategoryId
): Metadata {
  const ogImages = buildOgImages(alt, categoryId);
  const twitterImages = ogImages.map((img) => img.url);
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: ogImages,
    },
    twitter: {
      ...metadata.twitter,
      card: "summary_large_image",
      images: twitterImages,
    },
  };
}

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

/** Meta description for the home page (~150–160 chars, natural sentence per locale). */
export function getHomeMetaDescription(locale: Locale): string {
  if (locale === "ar") {
    return "أدوات مجانية تعمل بالكامل في متصفحك — بدون تسجيل وبدون رفع ملفات إلى خوادمنا. PDF، صور، نصوص، مطورين، حاسبات، محولات، صوت، OCR والمزيد.";
  }
  return "Free online tools that run entirely in your browser — no signup, no uploads. PDF, images, text, dev tools, calculators, converters, audio, OCR, and more.";
}

export function getBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — Kitzos Tools`,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "Free browser-based tools for PDF, images, text, and developers. Fast, private, no signup — everything runs in your browser.",
    keywords: [
      "online tools",
      "free tools",
      "browser tools",
      "pdf tools",
      "image tools",
      "text tools",
      "developer tools",
      "calculators",
      "converters",
    ],
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      images: buildOgImages(`${SITE_NAME} — Kitzos Tools`),
    },
    twitter: {
      card: "summary_large_image",
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/** Metadata for the domain root `/` (served with full head for crawlers).
 *  Canonical + x-default point at /en/ so `/` does not compete with the English home as a duplicate. */
export function getRootMetadata(): Metadata {
  const title = getDictionary(DEFAULT_LOCALE).home.title;
  const description = getHomeMetaDescription(DEFAULT_LOCALE);

  return withSocialImages(
    {
      title,
      description,
      alternates: {
        canonical: buildLocalizedUrl(DEFAULT_LOCALE, "/"),
        languages: buildLanguageAlternates("/"),
      },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: buildLocalizedUrl(DEFAULT_LOCALE, "/"),
        type: "website",
        locale: "en_US",
      },
      twitter: {
        title: `${title} | ${SITE_NAME}`,
        description,
      },
    },
    title
  );
}

export function getHomeMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  const title = t.home.title;
  const description = getHomeMetaDescription(locale);
  const path = "/";

  return withSocialImages(
    {
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
    },
    title
  );
}

export function getToolMetadata(tool: Tool, locale: Locale): Metadata {
  const { title, description } = getLocalizedTool(tool, locale);
  const keywords =
    locale === "ar" && getArabicKeywords(tool.slug).length > 0
      ? getArabicKeywords(tool.slug)
      : tool.keywords;
  const path = `/tools/${tool.slug}`;

  return withSocialImages(
    {
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
    },
    title,
    tool.category
  );
}

export function getCategoryMetadata(category: Category, locale: Locale): Metadata {
  const { name, description } = getLocalizedCategory(category, locale);
  const path = `/${category.id}`;

  return withSocialImages(
    {
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
      twitter: {
        title: `${name} | ${SITE_NAME}`,
        description,
      },
    },
    name,
    category.id
  );
}

export function getInfoPageMetadata(
  locale: Locale,
  title: string,
  description: string,
  path: string
): Metadata {
  return withSocialImages(
    {
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
    },
    title
  );
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
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    isAccessibleForFree: true,
    url: buildLocalizedUrl(locale, path),
  };
}

export function generateOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
  };
}

function organizationEntity() {
  return {
    "@type": "Organization" as const,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
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

export function generateCategoryBreadcrumbs(
  category: Category,
  locale: Locale
): { name: string; url: string }[] {
  const t = getDictionary(locale);
  const { name } = getLocalizedCategory(category, locale);
  return [
    { name: t.common.home, url: buildLocalizedUrl(locale, "/") },
    { name, url: buildLocalizedUrl(locale, `/${category.id}`) },
  ];
}

export function generateInfoBreadcrumbs(
  locale: Locale,
  pageTitle: string,
  path: string
): { name: string; url: string }[] {
  const t = getDictionary(locale);
  return [
    { name: t.common.home, url: buildLocalizedUrl(locale, "/") },
    { name: pageTitle, url: buildLocalizedUrl(locale, path) },
  ];
}

export function generateWebSiteSchema(locale: Locale = DEFAULT_LOCALE): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: buildLocalizedUrl(locale, "/"),
    description: getHomeMetaDescription(locale),
    inLanguage: ["en", "ar"],
    publisher: organizationEntity(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${buildLocalizedUrl(locale, "/")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateCategoryItemListSchema(
  category: Category,
  locale: Locale,
  toolSlugs: { slug: string; title: string }[]
): object {
  const { name, description } = getLocalizedCategory(category, locale);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: buildLocalizedUrl(locale, `/${category.id}`),
    inLanguage: locale === "ar" ? "ar" : "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: toolSlugs.length,
      itemListElement: toolSlugs.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.title,
        url: buildLocalizedUrl(locale, `/tools/${tool.slug}`),
      })),
    },
  };
}

export function generateHowToSchema(
  tool: Tool,
  locale: Locale,
  steps: HowToStep[]
): object | null {
  if (steps.length === 0) return null;
  const { title, description } = getLocalizedTool(tool, locale);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };
}

/** Build sitemap hreflang alternates (en + ar + x-default). */
export function buildSitemapLanguageAlternates(
  path: string
): Record<string, string> {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, buildLocalizedUrl(locale, path)])
  );
  languages["x-default"] = buildLocalizedUrl(DEFAULT_LOCALE, path);
  return languages;
}
