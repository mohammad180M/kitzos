"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { categories, type CategoryId } from "@/lib/categories";
import CategoryFilterBar, { type CategoryFilter } from "@/components/CategoryFilterBar";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-data";
import { searchToolsLocalized } from "@/lib/i18n/search";
import { localizedPath } from "@/lib/i18n/routing";
import HomeCategoryToolsGrid from "@/components/HomeCategoryToolsGrid";
import ToolSearch from "@/components/ToolSearch";
import Footer from "@/components/Footer";

function isCategoryId(value: string): value is CategoryId {
  return categories.some((c) => c.id === value);
}

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const { locale, t } = useLocale();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && isCategoryId(hash)) {
      setActiveFilter(hash);
    }
  }, []);

  const handleFilterChange = useCallback((next: CategoryFilter) => {
    setActiveFilter(next);

    const base = window.location.pathname + window.location.search;
    if (next === "all") {
      window.history.replaceState(null, "", base);
    } else {
      window.history.replaceState(null, "", `${base}#${next}`);
    }
  }, []);

  const filteredTools = useMemo(
    () => searchToolsLocalized(query, locale),
    [query, locale]
  );

  const isSearching = query.trim().length > 0;

  const grouped = useMemo(() => {
    const source =
      activeFilter === "all"
        ? categories
        : categories.filter((c) => c.id === activeFilter);

    return source
      .map((category) => ({
        category,
        tools: filteredTools.filter((tool) => tool.category === category.id),
      }))
      .filter((group) => group.tools.length > 0);
  }, [filteredTools, activeFilter]);

  const gridClass =
    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

  const categoryTitleLink =
    "group inline-flex items-center gap-1.5 text-gray-900 transition-colors hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400";

  const categoryTitleChevron =
    "h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:text-primary-500 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 sm:opacity-70";

  return (
    <>
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="site-container py-10 sm:py-12">
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {t.home.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-600 dark:text-gray-400 sm:text-lg">
            {t.home.subtitle}
          </p>

          <ToolSearch
            value={query}
            onChange={setQuery}
            className="mx-auto mt-8 max-w-2xl"
          />

          <CategoryFilterBar value={activeFilter} onChange={handleFilterChange} />
        </div>
      </section>

      <div className="site-container py-10 sm:py-12">
        {isSearching && filteredTools.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t.home.noResults.replace("{query}", query)}
          </p>
        )}

        {grouped.length === 0 && !isSearching && activeFilter !== "all" && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t.home.noCategoryTools}
          </p>
        )}

        <div key={`${activeFilter}-${query}`} className="home-filter-content space-y-12">
          {activeFilter === "all"
            ? grouped.map(({ category, tools: categoryTools }) => {
                const { name } = getLocalizedCategory(category, locale);

                return (
                  <section key={category.id} aria-labelledby={`category-${category.id}`}>
                    <div className="mb-5">
                      <h2
                        id={`category-${category.id}`}
                        className="text-xl font-semibold sm:text-2xl"
                      >
                        <Link
                          href={localizedPath(locale, `/${category.id}`)}
                          className={categoryTitleLink}
                        >
                          {name}
                          <ChevronRight
                            className={categoryTitleChevron}
                            aria-hidden="true"
                          />
                        </Link>
                      </h2>
                    </div>
                    <HomeCategoryToolsGrid
                      tools={categoryTools}
                      gridClass={gridClass}
                      paginate={!isSearching}
                      resetKey={`${category.id}-${query}`}
                    />
                  </section>
                );
              })
            : grouped.map(({ category, tools: categoryTools }) => {
                const { name, description } = getLocalizedCategory(category, locale);

                return (
                  <section key={category.id} aria-labelledby={`category-${category.id}`}>
                    <div className="mb-5">
                      <h2
                        id={`category-${category.id}`}
                        className="text-xl font-semibold sm:text-2xl"
                      >
                        <Link
                          href={localizedPath(locale, `/${category.id}`)}
                          className={categoryTitleLink}
                        >
                          {name}
                          <ChevronRight
                            className={categoryTitleChevron}
                            aria-hidden="true"
                          />
                        </Link>
                      </h2>
                      {!isSearching && (
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                          {description}
                        </p>
                      )}
                    </div>
                    <HomeCategoryToolsGrid
                      tools={categoryTools}
                      gridClass={gridClass}
                      paginate={!isSearching}
                      resetKey={`${category.id}-${query}`}
                    />
                  </section>
                );
              })}
        </div>
      </div>

      <Footer />
    </>
  );
}
