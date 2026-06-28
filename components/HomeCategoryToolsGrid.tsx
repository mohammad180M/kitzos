"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Tool } from "@/lib/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ToolCard from "@/components/ToolCard";

export const HOME_TOOLS_PAGE_SIZE = 10;

interface HomeCategoryToolsGridProps {
  tools: Tool[];
  gridClass: string;
  paginate: boolean;
  resetKey: string;
}

const pagerBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";

export default function HomeCategoryToolsGrid({
  tools,
  gridClass,
  paginate,
  resetKey,
}: HomeCategoryToolsGridProps) {
  const [page, setPage] = useState(0);
  const { t } = useLocale();

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(tools.length / HOME_TOOLS_PAGE_SIZE));
  const showPager = paginate && tools.length > HOME_TOOLS_PAGE_SIZE;

  const visibleTools = useMemo(() => {
    if (!paginate) return tools;
    const start = page * HOME_TOOLS_PAGE_SIZE;
    return tools.slice(start, start + HOME_TOOLS_PAGE_SIZE);
  }, [tools, page, paginate]);

  return (
    <div>
      <div key={`${resetKey}-p${page}`} className={`${gridClass} home-filter-content`}>
        {visibleTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {showPager && (
        <nav
          aria-label={t.home.toolsPageNav}
          className="mt-5 flex items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={pagerBtn}
            aria-label={t.home.toolsPagePrev}
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>

          <span
            className="min-w-[3rem] text-center text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400"
            aria-live="polite"
            aria-atomic="true"
          >
            {t.home.toolsPageIndicator
              .replace("{current}", String(page + 1))
              .replace("{total}", String(totalPages))}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className={pagerBtn}
            aria-label={t.home.toolsPageNext}
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
