import { notFound } from "next/navigation";
import ToolLayout from "@/components/ToolLayout";
import { getToolComponent } from "@/lib/tool-components";
import { tools, getToolBySlug, getToolsByCategory } from "@/lib/registry";
import { getToolMetadata } from "@/lib/seo";
import type { Metadata } from "next";

interface ToolPageProps {
  params: { slug: string };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: ToolPageProps): Metadata {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return getToolMetadata(tool);
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
