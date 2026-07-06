import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Tool } from "@/lib/registry";
import { getCategoryById } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import {
  generateBreadcrumbSchema,
  generateHowToSchema,
  generateSoftwareApplicationSchema,
  generateToolBreadcrumbs,
} from "@/lib/seo";
import type { FaqItem, HowToStep } from "@/lib/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocalizedCategory, getLocalizedTool } from "@/lib/i18n/localized-labels";
import { localizedPath } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/types";
import FaqAccordion from "./FaqAccordion";
import JsonLd from "./JsonLd";
import ToolCard from "./ToolCard";
import ToolPageAd from "./ToolPageAd";
import Footer from "./Footer";

interface ToolLayoutProps {
  tool: Tool;
  locale: Locale;
  relatedTools: Tool[];
  howTo: HowToStep[];
  faq: FaqItem[];
  children: ReactNode;
}

export default function ToolLayout({
  tool,
  locale,
  relatedTools,
  howTo,
  faq,
  children,
}: ToolLayoutProps) {
  const t = getDictionary(locale);
  const { title, description } = getLocalizedTool(tool, locale);
  const category = getCategoryById(tool.category);
  const categoryLabel = category
    ? getLocalizedCategory(category, locale).name
    : tool.category;
  const catColor = categoryColorVar(tool.category);

  const breadcrumbs = generateToolBreadcrumbs(tool, locale);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const softwareSchema = generateSoftwareApplicationSchema(tool, locale);
  const howToSchema = generateHowToSchema(tool, locale, howTo);
  const jsonLd = [breadcrumbSchema, softwareSchema, ...(howToSchema ? [howToSchema] : [])];

  const displayCrumbs = [
    { name: t.common.home, href: localizedPath(locale, "/") },
    { name: categoryLabel, href: localizedPath(locale, `/${tool.category}`) },
    { name: title, href: localizedPath(locale, `/tools/${tool.slug}`) },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label={t.tool.breadcrumbAria} className="label-mono mb-6 text-xs uppercase tracking-wide text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            {displayCrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                )}
                {index === displayCrumbs.length - 1 ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {crumb.name}
                  </span>
                ) : index === 1 ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                    style={{ color: catColor }}
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <Link href={crumb.href} className="transition-colors hover:text-foreground">
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="mb-6 border-t-[3px] pt-6" style={{ borderColor: catColor }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-lg text-muted">{description}</p>
        </header>

        <div className="tool-bench-card mb-8">{children}</div>

        <ToolPageAd />

        {howTo.length > 0 && (
          <section className="mb-10 max-w-[65ch]" aria-labelledby="how-to-heading">
            <h2
              id="how-to-heading"
              className="font-display text-xl font-semibold text-foreground"
            >
              {t.tool.howToUse}
            </h2>
            <ol className="mt-4 space-y-4">
              {howTo.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    className="label-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${catColor} 15%, transparent)`,
                      color: catColor,
                    }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {faq.length > 0 && (
          <div className="mb-10 max-w-[65ch]">
            <FaqAccordion faqs={faq} title={t.tool.faq} />
          </div>
        )}

        {relatedTools.length > 0 && (
          <section className="mb-10" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="font-display text-xl font-semibold text-foreground"
            >
              {t.tool.relatedTools}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedTools.slice(0, 4).map((related) => (
                <ToolCard key={related.slug} tool={related} />
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </>
  );
}
