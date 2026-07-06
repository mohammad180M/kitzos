"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedTool } from "@/lib/i18n/localized-labels";
import { localizedPath } from "@/lib/i18n/routing";
import { getToolBySlugLite } from "@/lib/registry-lite";
import { POPULAR_TOOL_SLUGS } from "@/lib/popular-tools";
import BrandMark from "@/components/BrandMark";
import ToolSearch from "@/components/ToolSearch";
import ToolCard from "@/components/ToolCard";
import Footer from "@/components/Footer";

export default function NotFoundContent() {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");

  const popularTools = useMemo(
    () =>
      POPULAR_TOOL_SLUGS.map((slug) => getToolBySlugLite(slug)).filter(
        (tool): tool is NonNullable<typeof tool> => tool != null
      ),
    []
  );

  const filteredPopular = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return popularTools;
    return popularTools.filter((tool) => {
      const { title, description } = getLocalizedTool(tool, locale);
      return `${title} ${description} ${tool.slug}`.toLowerCase().includes(q);
    });
  }, [popularTools, query, locale]);

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="font-display text-6xl font-extrabold tracking-tight text-accent sm:text-7xl">
            404
          </p>
          <h1 className="font-display mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            {t.common.notFound}
          </h1>
          <p className="mt-3 text-muted">{t.common.notFoundDescription}</p>
        </div>

        <div className="mt-8">
          <ToolSearch value={query} onChange={setQuery} autoFocus />
        </div>

        <section className="mt-10" aria-labelledby="popular-tools-heading">
          <h2
            id="popular-tools-heading"
            className="font-display flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <BrandMark />
            {t.common.popularTools}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredPopular.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
          {filteredPopular.length === 0 && (
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-muted">
              <BrandMark />
              {t.home.noResults.replace("{query}", query)}
            </p>
          )}
        </section>

        <div className="mt-10 text-center">
          <Link href={localizedPath(locale, "/")} className="btn-primary">
            {t.common.backHome}
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
