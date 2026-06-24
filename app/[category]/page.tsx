import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryById, type CategoryId } from "@/lib/categories";
import { getCategoryMetadata } from "@/lib/seo";
import CategoryContent from "@/components/CategoryContent";

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

  return <CategoryContent category={category} />;
}
