"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories } from "@/lib/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-data";
import { searchToolsLocalized } from "@/lib/i18n/search";
import { localizedPath } from "@/lib/i18n/routing";
import ToolCard from "@/components/ToolCard";
import ToolSearch from "@/components/ToolSearch";
import Footer from "@/components/Footer";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const { locale, t } = useLocale();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

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
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 xl:max-w-[1400px] xl:px-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {t.home.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-600 dark:text-gray-400">
            {t.home.subtitle}
          </p>

          <ToolSearch
            value={query}
            onChange={setQuery}
            className="mx-auto mt-8 max-w-xl"
          />

          <div className="mt-6 flex flex-wrap justify-center gap-1.5 xl:flex-nowrap xl:gap-2">
            {categories.map((category) => {
              const { name } = getLocalizedCategory(category, locale);
              return (
                <Link
                  key={category.id}
                  href={localizedPath(locale, `/${category.id}`)}
                  className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:text-primary-400 xl:px-4"
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 xl:max-w-[1400px] xl:px-8">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
