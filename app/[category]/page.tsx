import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryById, type CategoryId } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";
import { getCategoryMetadata } from "@/lib/seo";
import ToolCard from "@/components/ToolCard";
import Footer from "@/components/Footer";
import { getIcon } from "@/lib/icons";

interface CategoryPageProps {
  params: { category: string };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = getCategoryById(params.category as CategoryId);
  if (!category) return {};

  return getCategoryMetadata(category.id, category.name, category.description);
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryById(params.category as CategoryId);
  if (!category) notFound();

  const categoryTools = getToolsByCategory(category.id);
  const Icon = getIcon(category.icon);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {category.name}
            </h1>
            <p className="mt-2 text-gray-600">{category.description}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
