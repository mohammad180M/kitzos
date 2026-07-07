"use client";

import { Check } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePdfSharedLabels } from "@/lib/i18n/use-pdf-tool-labels";

export const PDF_PREVIEW_PAGE_CAP = 50;

export type PreviewRenderResult = string | ImageBitmap;

export interface PreviewPage {
  id: string;
  render: () => Promise<PreviewRenderResult>;
  label?: string;
  badge?: string;
  dimmed?: boolean;
  highlighted?: boolean;
  selected?: boolean;
  onClick?: () => void;
  rotation?: number;
  dividerBefore?: string;
}

interface PdfPreviewPaneProps {
  pages?: PreviewPage[];
  totalCount?: number;
  sizeBadge?: string;
  highlightColor?: string;
  children?: ReactNode;
  singleColumn?: boolean;
}

function PreviewThumb({
  page,
  highlightColor,
}: {
  page: PreviewPage;
  highlightColor: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const genRef = useRef(0);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const runRender = useCallback(async () => {
    const gen = ++genRef.current;
    setLoading(true);
    try {
      const result = await page.render();
      if (gen !== genRef.current) {
        if (result instanceof ImageBitmap) result.close();
        return;
      }
      if (result instanceof ImageBitmap) {
        bitmapRef.current?.close();
        bitmapRef.current = result;
        const canvas = document.createElement("canvas");
        canvas.width = result.width;
        canvas.height = result.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(result, 0, 0);
        setSrc(canvas.toDataURL("image/jpeg", 0.8));
      } else {
        setSrc(result);
      }
    } catch {
      if (gen === genRef.current) setSrc(null);
    } finally {
      if (gen === genRef.current) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          void runRender();
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      genRef.current++;
      bitmapRef.current?.close();
      bitmapRef.current = null;
    };
  }, [runRender]);

  const ringStyle =
    page.selected
      ? { boxShadow: `0 0 0 2px ${highlightColor}` }
      : page.highlighted && !page.dimmed
        ? { boxShadow: `0 0 0 2px ${highlightColor}` }
        : undefined;

  const thumbInner = (
    <>
      <div className="flex aspect-[3/4] items-center justify-center p-1">
        {loading && !src && (
          <div
            className="pdf-preview-shimmer absolute inset-0 rounded-md"
            aria-hidden="true"
          />
        )}
        {src && (
          <img
            src={src}
            alt=""
            className="max-h-full max-w-full object-contain transition-transform"
            style={page.rotation ? { transform: `rotate(${page.rotation}deg)` } : undefined}
          />
        )}
      </div>
      {page.selected && (
        <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--cat-pdf)] text-white shadow-sm">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
      {page.badge && (
        <span className="absolute right-1 top-1 rounded bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm">
          {page.badge}
        </span>
      )}
    </>
  );

  return (
    <div ref={containerRef} className="min-w-0">
      {page.dividerBefore && (
        <p className="mb-2 truncate border-t border-[var(--line)] pt-2 text-xs font-medium text-muted">
          {page.dividerBefore}
        </p>
      )}
      {page.onClick ? (
        <button
          type="button"
          onClick={page.onClick}
          className={`relative w-full overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] text-left transition-opacity hover:opacity-95 ${
            page.dimmed ? "opacity-40" : ""
          }`}
          style={ringStyle}
        >
          {thumbInner}
        </button>
      ) : (
        <div
          className={`relative overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] ${
            page.dimmed ? "opacity-40" : ""
          }`}
          style={ringStyle}
        >
          {thumbInner}
        </div>
      )}
      {page.label && (
        <p className="mt-1 text-center text-[11px] text-muted">{page.label}</p>
      )}
    </div>
  );
}

export default function PdfPreviewPane({
  pages,
  totalCount,
  sizeBadge,
  highlightColor = "var(--cat-pdf)",
  children,
  singleColumn = false,
}: PdfPreviewPaneProps) {
  const { preview, showingPages, pageLabel } = usePdfSharedLabels();

  const total = totalCount ?? pages?.length ?? 0;
  const capped = pages ? pages.slice(0, PDF_PREVIEW_PAGE_CAP) : [];
  const gridClass = singleColumn
    ? "grid grid-cols-1 gap-3"
    : capped.length === 1
      ? "grid grid-cols-1 gap-3"
      : "grid grid-cols-2 gap-2";

  return (
    <aside
      className="flex max-h-[min(70vh,720px)] flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]"
      dir="ltr"
      aria-label={preview}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
        <span className="label-mono text-xs uppercase tracking-wide text-muted">{preview}</span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {total > 0 && <span>{pageLabel(total)}</span>}
          {sizeBadge && (
            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 font-medium text-foreground">
              {sizeBadge}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {children ?? (
          <div className={gridClass}>
            {capped.map((page) => (
              <PreviewThumb key={page.id} page={page} highlightColor={highlightColor} />
            ))}
          </div>
        )}
        {total > PDF_PREVIEW_PAGE_CAP && (
          <p className="mt-3 text-center text-xs text-muted">
            {showingPages(PDF_PREVIEW_PAGE_CAP, total)}
          </p>
        )}
      </div>
    </aside>
  );
}
