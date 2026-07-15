import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ArticleDocument } from "@/lib/articles";
import type { Tool } from "@/lib/registry";
import { getCategoryById } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateArticleBreadcrumbs,
} from "@/lib/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocalizedCategory, getLocalizedTool } from "@/lib/i18n/localized-labels";
import { localizedPath } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/types";
import DirectionArrow from "./DirectionArrow";
import JsonLd from "./JsonLd";
import Footer from "./Footer";

interface ArticleGuidePageProps {
  article: ArticleDocument;
  tool: Tool;
  locale: Locale;
  relatedTools: Tool[];
}

function fillToolName(template: string, toolName: string): string {
  return template.replace(/\{tool\}/gi, toolName).replace(/\{الاسم\}/g, toolName);
}

export default function ArticleGuidePage({
  article,
  tool,
  locale,
  relatedTools,
}: ArticleGuidePageProps) {
  const t = getDictionary(locale);
  const { title: toolTitle } = getLocalizedTool(tool, locale);
  const category = getCategoryById(tool.category);
  const categoryLabel = category
    ? getLocalizedCategory(category, locale).name
    : tool.category;
  const catColor = categoryColorVar(tool.category);
  const guideLabel = t.tool.guide;
  const articleTitle = article.frontmatter.title;

  const breadcrumbSchema = generateBreadcrumbSchema(
    generateArticleBreadcrumbs(tool, locale, guideLabel)
  );
  const articleSchema = generateArticleSchema(article, locale);
  const toolHref = localizedPath(locale, `/tools/${tool.slug}`);
  const primaryCta = fillToolName(t.tool.articleCta, toolTitle);
  const compactCta = fillToolName(t.tool.articleCtaCompact, toolTitle);

  const displayCrumbs = [
    { name: t.common.home, href: localizedPath(locale, "/") },
    { name: categoryLabel, href: localizedPath(locale, `/${tool.category}`) },
    { name: toolTitle, href: toolHref },
    { name: guideLabel, href: localizedPath(locale, `/tools/${tool.slug}/article`) },
  ];

  return (
    <>
      <JsonLd data={[breadcrumbSchema, articleSchema]} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav
          aria-label={t.tool.breadcrumbAria}
          className="label-mono mb-8 text-xs uppercase tracking-wide text-muted"
        >
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

        <header className="mb-8 border-t-[3px] pt-6" style={{ borderColor: catColor }}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {articleTitle}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            {article.frontmatter.description}
          </p>
        </header>

        {article.introHtml ? (
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: article.introHtml }}
          />
        ) : null}

        <p className="my-8">
          <Link
            href={toolHref}
            className="inline-flex items-center rounded-lg border border-line bg-surface-2 px-5 py-4 text-base font-semibold text-foreground transition-colors hover:border-accent"
            style={{
              borderInlineStartWidth: 3,
              borderInlineStartStyle: "solid",
              borderInlineStartColor: catColor,
            }}
          >
            {primaryCta}
            <DirectionArrow className="ms-1" />
          </Link>
        </p>

        {article.bodyHtml ? (
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />
        ) : null}

        <p className="mt-10">
          <Link
            href={toolHref}
            className="inline-flex items-center text-sm font-semibold text-accent underline-offset-2 hover:underline"
          >
            {compactCta}
            <DirectionArrow className="ms-1" />
          </Link>
        </p>

        {relatedTools.length > 0 && (
          <section className="mt-12 border-t border-line pt-8" aria-labelledby="article-related">
            <h2
              id="article-related"
              className="font-display text-lg font-semibold text-foreground"
            >
              {t.tool.relatedTools}
            </h2>
            <ul className="mt-4 space-y-2">
              {relatedTools.map((related) => {
                const relatedTitle = getLocalizedTool(related, locale).title;
                return (
                  <li key={related.slug}>
                    <Link
                      href={localizedPath(locale, `/tools/${related.slug}`)}
                      className="font-medium text-accent underline-offset-2 hover:underline"
                    >
                      {relatedTitle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}
