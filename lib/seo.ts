import type { Metadata } from "next";
import type { Tool } from "./registry";
import { getCategoryById } from "./categories";

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

export function getToolMetadata(tool: Tool): Metadata {
  const category = getCategoryById(tool.category);
  const title = tool.title;
  const description = tool.description;

  return {
    title,
    description,
    keywords: tool.keywords,
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.slug}/`,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/tools/${tool.slug}/`,
      type: "website",
    },
    twitter: {
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function getCategoryMetadata(
  categoryId: string,
  categoryName: string,
  description: string
): Metadata {
  return {
    title: categoryName,
    description,
    alternates: {
      canonical: `${SITE_URL}/${categoryId}/`,
    },
    openGraph: {
      title: `${categoryName} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${categoryId}/`,
      type: "website",
    },
  };
}

export function getInfoPageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const canonical = `${SITE_URL}${path}/`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function generateSoftwareApplicationSchema(tool: Tool): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `${SITE_URL}/tools/${tool.slug}/`,
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

export function generateToolBreadcrumbs(tool: Tool): {
  name: string;
  url: string;
}[] {
  const category = getCategoryById(tool.category);
  return [
    { name: "Home", url: `${SITE_URL}/` },
    {
      name: category?.name ?? tool.category,
      url: `${SITE_URL}/${tool.category}/`,
    },
    { name: tool.title, url: `${SITE_URL}/tools/${tool.slug}/` },
  ];
}
