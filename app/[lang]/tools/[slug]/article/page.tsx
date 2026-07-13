import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleGuidePage from "@/components/ArticleGuidePage";
import { getArticle, hasArticle, listArticleSlugs } from "@/lib/articles";
import { getToolBySlug, getToolsByCategory } from "@/lib/registry";
import { getArticleMetadata } from "@/lib/seo";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { isValidLocale } from "@/lib/i18n/routing";

interface ArticlePageProps {
  params: { lang: string; slug: string };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = listArticleSlugs();
  // Static export rejects an empty generateStaticParams() result — use a
  // throwaway path that always 404s until real article files exist.
  if (slugs.length === 0) {
    return LOCALES.map((lang) => ({ lang, slug: "__none__" }));
  }
  return slugs.flatMap((slug) => LOCALES.map((lang) => ({ lang, slug })));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  const locale = params.lang as Locale;
  const article = getArticle(params.slug, locale);
  if (!article) return {};
  return getArticleMetadata(article, locale);
}

export default function ToolArticlePage({ params }: ArticlePageProps) {
  if (!isValidLocale(params.lang)) notFound();
  if (!hasArticle(params.slug)) notFound();

  const locale = params.lang as Locale;
  const tool = getToolBySlug(params.slug);
  const article = getArticle(params.slug, locale);
  if (!tool || !article) notFound();

  const relatedTools = getToolsByCategory(tool.category)
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 3);

  return (
    <ArticleGuidePage
      article={article}
      tool={tool}
      locale={locale}
      relatedTools={relatedTools}
    />
  );
}
