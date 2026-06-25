"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Tool } from "@/lib/registry";
import { getCategoryById } from "@/lib/categories";
import {
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
  generateToolBreadcrumbs,
} from "@/lib/seo";
import { getToolContent } from "@/content";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory, getLocalizedTool } from "@/lib/i18n/localized-data";
import { localizedPath } from "@/lib/i18n/routing";
import FaqAccordion from "./FaqAccordion";
import ToolCard from "./ToolCard";
import Footer from "./Footer";

interface ToolLayoutProps {
  tool: Tool;
  relatedTools: Tool[];
  children: ReactNode;
}

export default function ToolLayout({ tool, relatedTools, children }: ToolLayoutProps) {
  const { locale, t } = useLocale();
  const { title, description } = getLocalizedTool(tool, locale);
  const { howTo, faq } = getToolContent(tool.slug, locale);
  const category = getCategoryById(tool.category);
  const categoryLabel = category
    ? getLocalizedCategory(category, locale).name
    : tool.category;

  const breadcrumbs = generateToolBreadcrumbs(tool, locale);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const softwareSchema = generateSoftwareApplicationSchema(tool, locale);

  const displayCrumbs = [
    { name: t.common.home, href: localizedPath(locale, "/") },
    { name: categoryLabel, href: localizedPath(locale, `/${tool.category}`) },
    { name: title, href: localizedPath(locale, `/tools/${tool.slug}`) },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label={t.tool.breadcrumbAria} className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            {displayCrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 rtl:rotate-180"
                    aria-hidden="true"
                  />
                )}
                {index === displayCrumbs.length - 1 ? (
                  <span
                    className="font-medium text-gray-900 dark:text-gray-100"
                    aria-current="page"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{description}</p>
        </header>

        <div className="card mb-8">{children}</div>

        {howTo.length > 0 && (
          <section className="mb-10" aria-labelledby="how-to-heading">
            <h2 id="how-to-heading" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t.tool.howToUse}
            </h2>
            <ol className="mt-4 space-y-4">
              {howTo.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {faq.length > 0 && (
          <div className="mb-10">
            <FaqAccordion faqs={faq} title={t.tool.faq} />
          </div>
        )}

        {relatedTools.length > 0 && (
          <section className="mb-10" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t.tool.relatedTools}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedTools.map((related) => (
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
