"use client";

import { getIcon } from "@/lib/icons";
import type { Category } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-data";
import ToolCard from "@/components/ToolCard";
import Footer from "@/components/Footer";

interface CategoryContentProps {
  category: Category;
}

export default function CategoryContent({ category }: CategoryContentProps) {
  const { locale } = useLocale();
  const { name, description } = getLocalizedCategory(category, locale);
  const categoryTools = getToolsByCategory(category.id);
  const Icon = getIcon(category.icon);

  return (
    <>
      <div className="site-container py-10 sm:py-12">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {name}
            </h1>
            <p className="mt-2 max-w-3xl text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
