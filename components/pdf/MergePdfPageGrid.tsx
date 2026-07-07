"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { PreviewRenderResult } from "@/components/pdf/PdfPreviewPane";
import { mergeFileColor, pageOrdersEqual, reorderPageOrder, type PageRef } from "@/lib/pdf/merge-page-order";

interface GridPage {
  ref: PageRef;
  orderIndex: number;
  displayNumber: number;
  colorIndex: number;
  render: () => Promise<PreviewRenderResult>;
}

interface MergePdfPageGridProps {
  pages: GridPage[];
  rtl?: boolean;
  onReorder: (order: PageRef[]) => void;
  onAnnounce: (message: string) => void;
  pageMovedLabel: (position: number) => string;
}

function PageThumb({
  page,
  dragging,
  onPointerDown,
  onKeyDown,
}: {
  page: GridPage;
  dragging: boolean;
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const genRef = useRef(0);
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
        const canvas = document.createElement("canvas");
        canvas.width = result.width;
        canvas.height = result.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(result, 0, 0);
        setSrc(canvas.toDataURL("image/jpeg", 0.8));
        result.close();
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
        if (entries.some((e) => e.isIntersecting)) void runRender();
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    const gen = genRef.current;
    return () => {
      observer.disconnect();
      genRef.current = gen + 1;
    };
  }, [runRender]);

  const dotColor = mergeFileColor(page.colorIndex);

  return (
    <div ref={containerRef} className="min-w-0">
      <div
        role="button"
        tabIndex={0}
        data-page-index={page.orderIndex}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={`relative touch-none overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] outline-none transition-[transform,box-shadow,opacity] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[var(--cat-pdf)] focus-visible:ring-offset-2 ${
          dragging ? "z-20 scale-105 opacity-90 shadow-lg" : "cursor-grab active:cursor-grabbing"
        }`}
        aria-grabbed={dragging}
        aria-label={String(page.displayNumber)}
      >
        <div className="flex aspect-[3/4] items-center justify-center p-1">
          {loading && !src && (
            <div className="pdf-preview-shimmer absolute inset-0 rounded-md" aria-hidden="true" />
          )}
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="max-h-full max-w-full object-contain" draggable={false} />
          )}
        </div>
        <span
          className="absolute end-1 top-1 h-2.5 w-2.5 rounded-full border border-[var(--surface)] shadow-sm"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-1 text-center text-[11px] text-muted">{page.displayNumber}</p>
    </div>
  );
}

function computeInsertIndex(clientX: number, clientY: number, orderLength: number): number {
  const elements = document.querySelectorAll<HTMLElement>("[data-page-index]");
  if (elements.length === 0) return 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const idx = Number(el.dataset.pageIndex);
    if (Number.isNaN(idx)) continue;
    const rect = el.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (clientY < midY) return idx;
    if (clientY <= rect.bottom) {
      const midX = rect.left + rect.width / 2;
      return clientX < midX ? idx : idx + 1;
    }
  }

  return orderLength;
}

export default function MergePdfPageGrid({
  pages,
  rtl = false,
  onReorder,
  onAnnounce,
  pageMovedLabel,
}: MergePdfPageGridProps) {
  const orderLength = pages.length;
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropInsert, setDropInsert] = useState<number | null>(null);
  const dragRef = useRef<{ pointerId: number; fromIndex: number } | null>(null);
  const orderRef = useRef(pages.map((p) => p.ref));

  useEffect(() => {
    orderRef.current = pages.map((p) => p.ref);
  }, [pages]);

  const commitReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const next = reorderPageOrder(orderRef.current, fromIndex, toIndex);
      if (pageOrdersEqual(next, orderRef.current)) return;
      const moved = orderRef.current[fromIndex];
      const newPos = next.findIndex(
        (ref) => ref.fileId === moved.fileId && ref.pageIndex === moved.pageIndex
      );
      onReorder(next);
      if (newPos >= 0) onAnnounce(pageMovedLabel(newPos + 1));
    },
    [onAnnounce, onReorder, pageMovedLabel]
  );

  const endDrag = useCallback(
    (pointerId: number) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== pointerId) return;

      const insertBefore = dropInsert ?? drag.fromIndex;
      let toIndex = insertBefore;
      if (insertBefore > drag.fromIndex) toIndex = insertBefore - 1;
      if (toIndex !== drag.fromIndex) commitReorder(drag.fromIndex, toIndex);

      dragRef.current = null;
      setDragFrom(null);
      setDropInsert(null);
    },
    [commitReorder, dropInsert]
  );

  useEffect(() => {
    const onMove = (e: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      setDropInsert(computeInsertIndex(e.clientX, e.clientY, orderLength));
    };
    const onUp = (e: globalThis.PointerEvent) => {
      if (dragRef.current?.pointerId === e.pointerId) endDrag(e.pointerId);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [endDrag, orderLength]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>, index: number) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, fromIndex: index };
    setDragFrom(index);
    setDropInsert(index);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    let delta = 0;
    if (e.key === "ArrowLeft") delta = rtl ? 1 : -1;
    else if (e.key === "ArrowRight") delta = rtl ? -1 : 1;
    else if (e.key === "ArrowUp") delta = -1;
    else if (e.key === "ArrowDown") delta = 1;
    else return;

    e.preventDefault();
    const target = index + delta;
    if (target < 0 || target >= orderLength || target === index) return;
    commitReorder(index, target);
  };

  const gridClass =
    pages.length === 1 ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-2";

  return (
    <div className={gridClass}>
      {pages.map((page) => (
        <Fragment key={`${page.ref.fileId}-p${page.ref.pageIndex}`}>
          {dropInsert === page.orderIndex && dragFrom !== null && (
            <div
              className="col-span-2 -mb-1 h-0.5 rounded-full bg-[var(--cat-pdf)] shadow-sm"
              aria-hidden="true"
            />
          )}
          <PageThumb
            page={page}
            dragging={dragFrom === page.orderIndex}
            onPointerDown={(e) => handlePointerDown(e, page.orderIndex)}
            onKeyDown={(e) => handleKeyDown(e, page.orderIndex)}
          />
        </Fragment>
      ))}
      {dropInsert === orderLength && dragFrom !== null && (
        <div
          className="col-span-2 -mt-1 h-0.5 rounded-full bg-[var(--cat-pdf)] shadow-sm"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
