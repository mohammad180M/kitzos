"use client";

import type { CSSProperties } from "react";
import { getIcon } from "@/lib/icons";
import type { Category } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import { getToolsByCategoryLite } from "@/lib/registry-lite";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-labels";
import BrandMark from "@/components/BrandMark";
import ToolCard from "@/components/ToolCard";
import Footer from "@/components/Footer";

interface CategoryContentProps {
  category: Category;
}

function formatToolCount(count: number, locale: string): string {
  return count.toLocaleString(locale === "ar" ? "ar-EG" : "en-US");
}

export default function CategoryContent({ category }: CategoryContentProps) {
  const { locale } = useLocale();
  const { name, description } = getLocalizedCategory(category, locale);
  const categoryTools = getToolsByCategoryLite(category.id);
  const Icon = getIcon(category.icon);
  const catColor = categoryColorVar(category.id);

  const headerStyle: CSSProperties = {
    backgroundColor: `color-mix(in srgb, ${catColor} 6%, var(--surface))`,
  };

  return (
    <>
      <div className="site-container py-10 sm:py-12">
        <div
          className="mb-8 flex items-start gap-4 rounded-xl px-5 py-8"
          style={headerStyle}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${catColor} 12%, transparent)`,
              color: catColor,
            }}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <BrandMark className="mt-2" />
              <span style={{ color: catColor }}>{name}</span>
              <span className="label-mono text-base font-normal text-muted">
                · {formatToolCount(categoryTools.length, locale)}
              </span>
            </h1>
            <p className="mt-2 max-w-3xl text-muted">{description}</p>
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
