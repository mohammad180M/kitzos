"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { categories, type CategoryId } from "@/lib/categories";
import CategoryFilterBar, { type CategoryFilter } from "@/components/CategoryFilterBar";
import BrandMark from "@/components/BrandMark";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-labels";
import { searchToolsLocalized } from "@/lib/i18n/search";
import { toolsLite } from "@/lib/registry-lite";
import HomeCategoryToolsGrid from "@/components/HomeCategoryToolsGrid";
import ToolSearch from "@/components/ToolSearch";
import Footer from "@/components/Footer";

function isCategoryId(value: string): value is CategoryId {
  return categories.some((c) => c.id === value);
}

function formatToolCount(count: number, locale: string): string {
  return count.toLocaleString(locale === "ar" ? "ar-EG" : "en-US");
}

function CategorySectionHeader({
  categoryId,
  name,
  count,
  locale,
  onFilter,
}: {
  categoryId: CategoryId;
  name: string;
  count: number;
  locale: string;
  onFilter: (id: CategoryId) => void;
}) {
  return (
    <div className="mb-5">
      <h2
        id={`category-${categoryId}`}
        className="font-display flex flex-wrap items-center justify-center gap-2 text-xl font-semibold text-foreground sm:justify-start sm:text-2xl"
      >
        <BrandMark className="mt-1.5 self-start" />
        <button
          type="button"
          onClick={() => onFilter(categoryId)}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {name}
          <ChevronRight className="h-4 w-4 shrink-0 text-muted rtl:rotate-180" aria-hidden="true" />
        </button>
        <span className="label-mono text-sm font-normal text-muted">
          · {formatToolCount(count, locale)}
        </span>
      </h2>
    </div>
  );
}

export default function HomeContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const { locale, t } = useLocale();
  const searchRef = useRef<HTMLInputElement>(null);
  const gridSectionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  const handleCategoryHeaderClick = useCallback(
    (categoryId: CategoryId) => {
      handleFilterChange(categoryId);
      requestAnimationFrame(() => {
        gridSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [handleFilterChange]
  );

  const filteredTools = useMemo(
    () => searchToolsLocalized(query, locale),
    [query, locale]
  );

  const isSearching = query.trim().length > 0;
  const toolCountLabel = formatToolCount(toolsLite.length, locale);
  const eyebrow = t.home.heroEyebrow.replace("{count}", toolCountLabel);

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

  return (
    <>
      <section className="relative border-b border-line bg-canvas">
        <div className="hero-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="site-container relative py-10 sm:py-14">
          <p className="label-mono w-full text-center text-xs text-muted sm:text-sm">{eyebrow}</p>
          <h1 className="font-display mx-auto mt-4 max-w-3xl text-center text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.home.title}
          </h1>

          <ToolSearch
            ref={searchRef}
            value={query}
            onChange={setQuery}
            variant="command"
            className="mx-auto mt-8 max-w-2xl"
          />

          <CategoryFilterBar value={activeFilter} onChange={handleFilterChange} />
        </div>
      </section>

      <div ref={gridSectionRef} className="site-container scroll-mt-16 py-10 sm:py-12">
        {isSearching && filteredTools.length === 0 && (
          <p className="flex items-center justify-center gap-2 text-center text-muted">
            <BrandMark />
            {t.home.noResults.replace("{query}", query)}
          </p>
        )}

        {grouped.length === 0 && !isSearching && activeFilter !== "all" && (
          <p className="flex items-center justify-center gap-2 text-center text-muted">
            <BrandMark />
            {t.home.noCategoryTools}
          </p>
        )}

        <div key={`${activeFilter}-${query}`} className="home-filter-content space-y-12">
          {activeFilter === "all"
            ? grouped.map(({ category, tools: categoryTools }) => {
                const { name } = getLocalizedCategory(category, locale);

                return (
                  <section key={category.id} aria-labelledby={`category-${category.id}`}>
                    <CategorySectionHeader
                      categoryId={category.id}
                      name={name}
                      count={categoryTools.length}
                      locale={locale}
                      onFilter={handleCategoryHeaderClick}
                    />
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
                    <CategorySectionHeader
                      categoryId={category.id}
                      name={name}
                      count={categoryTools.length}
                      locale={locale}
                      onFilter={handleCategoryHeaderClick}
                    />
                    {!isSearching && (
                      <p className="mb-5 max-w-2xl text-sm text-muted">{description}</p>
                    )}
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
