import { notFound } from "next/navigation";
import ToolLayout from "@/components/ToolLayout";
import { getToolComponent } from "@/lib/tool-components";
import { tools, getToolBySlug, getToolsByCategory } from "@/lib/registry";
import { getToolMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { isValidLocale } from "@/lib/i18n/routing";

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

  const ToolComponent = getToolComponent(tool.slug);
  if (!ToolComponent) notFound();

  const relatedTools = getToolsByCategory(tool.category).filter(
    (t) => t.slug !== tool.slug
  );

  return (
    <ToolLayout tool={tool} relatedTools={relatedTools}>
      <ToolComponent />
    </ToolLayout>
  );
}
