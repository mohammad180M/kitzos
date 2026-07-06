import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import ToolLayout from "@/components/ToolLayout";
import ToolSkeleton from "@/components/ToolSkeleton";
import { tools, getToolBySlug, getToolsByCategory } from "@/lib/registry";
import { getToolContent } from "@/content";
import { getToolMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { isValidLocale } from "@/lib/i18n/routing";

const ToolSlot = nextDynamic(() => import("@/components/ToolSlot"), {
  ssr: false,
  loading: ToolSkeleton,
});

interface ToolPageProps {
  params: { lang: string; slug: string };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return tools.flatMap((tool) =>
    LOCALES.map((lang) => ({ lang, slug: tool.slug }))
  );
}

export function generateMetadata({ params }: ToolPageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return getToolMetadata(tool, params.lang as Locale);
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const locale = isValidLocale(params.lang) ? (params.lang as Locale) : "en";
  const { howTo, faq } = getToolContent(tool.slug, locale);

  const relatedTools = getToolsByCategory(tool.category)
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 4);

  return (
    <ToolLayout tool={tool} locale={locale} relatedTools={relatedTools} howTo={howTo} faq={faq}>
      <ToolSlot slug={tool.slug} />
    </ToolLayout>
  );
}
