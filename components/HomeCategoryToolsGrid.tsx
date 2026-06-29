"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Tool } from "@/lib/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ToolCard from "@/components/ToolCard";

export const HOME_TOOLS_PAGE_SIZE = 10;

const PAGE_FADE_MS = 250;
const SM_MQ = "(min-width: 640px)";
const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

interface HomeCategoryToolsGridProps {
  tools: Tool[];
  gridClass: string;
  paginate: boolean;
  resetKey: string;
}

const pagerBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";

function subscribeMediaQuery(query: string, callback: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useMediaQuery(query: string, serverSnapshot = false) {
  return useSyncExternalStore(
    (cb) => subscribeMediaQuery(query, cb),
    () => window.matchMedia(query).matches,
    () => serverSnapshot
  );
}

/** Invisible slot matching ToolCard footprint — keeps paginated grid height stable on sm+. */
function GridSlotPlaceholder() {
  return (
    <div
      className="pointer-events-none invisible flex min-h-[5.5rem] items-start gap-3 rounded-xl border border-transparent p-4"
      aria-hidden="true"
    >
      <div className="h-10 w-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-5" />
        <div className="mt-0.5 h-10" />
      </div>
    </div>
  );
}

export default function HomeCategoryToolsGrid({
  tools,
  gridClass,
  paginate,
  resetKey,
}: HomeCategoryToolsGridProps) {
  const [page, setPage] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  const { t } = useLocale();
  const isSmUp = useMediaQuery(SM_MQ);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_MQ);
  const gridInnerRef = useRef<HTMLDivElement>(null);
  const [mobileHeight, setMobileHeight] = useState<number | undefined>();
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPage(0);
    setPageVisible(true);
  }, [resetKey]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(tools.length / HOME_TOOLS_PAGE_SIZE));
  const showPager = paginate && tools.length > HOME_TOOLS_PAGE_SIZE;
  const reserveSlots = showPager && isSmUp;
  const fadeMs = reducedMotion ? 0 : PAGE_FADE_MS;

  const slots = useMemo((): (Tool | null)[] => {
    if (!paginate) return tools;
    const start = page * HOME_TOOLS_PAGE_SIZE;
    const slice = tools.slice(start, start + HOME_TOOLS_PAGE_SIZE);
    if (reserveSlots) {
      return Array.from({ length: HOME_TOOLS_PAGE_SIZE }, (_, i) => slice[i] ?? null);
    }
    return slice;
  }, [tools, page, paginate, reserveSlots]);

  useLayoutEffect(() => {
    if (isSmUp || !showPager) {
      setMobileHeight(undefined);
      return;
    }
    const el = gridInnerRef.current;
    if (!el) return;
    setMobileHeight(el.offsetHeight);
  }, [slots, isSmUp, showPager, pageVisible]);

  const goToPage = useCallback(
    (next: number) => {
      if (next === page || next < 0 || next >= totalPages) return;

      if (fadeMs === 0) {
        setPage(next);
        return;
      }

      setPageVisible(false);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        setPage(next);
        setPageVisible(true);
        fadeTimerRef.current = null;
      }, fadeMs);
    },
    [page, totalPages, fadeMs]
  );

  const viewportStyle =
    showPager && !isSmUp && mobileHeight !== undefined ? { height: mobileHeight } : undefined;

  return (
    <div>
      <div
        className={
          showPager && !isSmUp ? "home-category-page-viewport overflow-hidden" : undefined
        }
        style={viewportStyle}
      >
        <div
          ref={gridInnerRef}
          className={`${gridClass} home-category-page-grid${pageVisible ? "" : " home-category-page-grid--hidden"}`}
        >
          {slots.map((tool, index) =>
            tool ? (
              <ToolCard key={tool.slug} tool={tool} />
            ) : (
              <GridSlotPlaceholder key={`slot-${page}-${index}`} />
            )
          )}
        </div>
      </div>

      {showPager && (
        <nav
          aria-label={t.home.toolsPageNav}
          className="mt-5 flex items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
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
            onClick={() => goToPage(page + 1)}
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
