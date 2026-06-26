import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryById, type CategoryId } from "@/lib/categories";
import {
  generateBreadcrumbSchema,
  generateCategoryBreadcrumbs,
  getCategoryMetadata,
} from "@/lib/seo";
import CategoryContent from "@/components/CategoryContent";
import JsonLd from "@/components/JsonLd";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { isValidLocale } from "@/lib/i18n/routing";

interface CategoryPageProps {
  params: { lang: string; category: string };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return categories.flatMap((category) =>
    LOCALES.map((lang) => ({ lang, category: category.id }))
  );
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  const category = getCategoryById(params.category as CategoryId);
  if (!category) return {};

  return getCategoryMetadata(category, params.lang as Locale);
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryById(params.category as CategoryId);
  if (!category) notFound();

  const locale = params.lang as Locale;
  const breadcrumbSchema = generateBreadcrumbSchema(
    generateCategoryBreadcrumbs(category, locale)
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <CategoryContent category={category} />
    </>
  );
}
