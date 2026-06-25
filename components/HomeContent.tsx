"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { categories } from "@/lib/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-data";
import { searchToolsLocalized } from "@/lib/i18n/search";
import { localizedPath } from "@/lib/i18n/routing";
import ToolCard from "@/components/ToolCard";
import Footer from "@/components/Footer";

export default function HomeContent() {
  const [query, setQuery] = useState("");
  const { locale, t } = useLocale();

  const filteredTools = useMemo(
    () => searchToolsLocalized(query, locale),
    [query, locale]
  );

  const grouped = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        tools: filteredTools.filter((tool) => tool.category === category.id),
      }))
      .filter((group) => group.tools.length > 0);
  }, [filteredTools]);

  return (
    <>
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {t.home.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600 dark:text-gray-400">
            {t.home.subtitle}
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="input-field py-3 ps-10 pe-10 text-base"
              aria-label={t.home.searchAria}
              dir="auto"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label={t.home.clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const { name } = getLocalizedCategory(category, locale);
              return (
                <Link
                  key={category.id}
                  href={localizedPath(locale, `/${category.id}`)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:text-primary-400"
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {query && filteredTools.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t.home.noResults.replace("{query}", query)}
          </p>
        )}

        <div className="space-y-10">
          {grouped.map(({ category, tools: categoryTools }) => {
            const { name } = getLocalizedCategory(category, locale);
            return (
              <section key={category.id} aria-labelledby={`category-${category.id}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    id={`category-${category.id}`}
                    className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                  >
                    <Link
                      href={localizedPath(locale, `/${category.id}`)}
                      className="hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {name}
                    </Link>
                  </h2>
                  <Link
                    href={localizedPath(locale, `/${category.id}`)}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {t.common.viewAll}
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
}
