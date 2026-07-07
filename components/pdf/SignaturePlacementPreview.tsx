"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SignaturePlacement } from "@/lib/pdf/signature-image";

interface PageLayout {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

interface SignaturePlacementPreviewProps {
  pageSrc: string | null;
  signatureSrc: string | null;
  signatureAspectRatio: number;
  placement: SignaturePlacement;
  onPlacementChange: (p: SignaturePlacement) => void;
  pageCount: number;
  previewPage: number;
  onPreviewPageChange: (page: number) => void;
  appliesToBadge?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function SignaturePlacementPreview({
  pageSrc,
  signatureSrc,
  signatureAspectRatio,
  placement,
  onPlacementChange,
  pageCount,
  previewPage,
  onPreviewPageChange,
  appliesToBadge,
}: SignaturePlacementPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageAreaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const layoutRef = useRef<PageLayout | null>(null);
  const [layout, setLayout] = useState<PageLayout | null>(null);
  const dragRef = useRef<{
    mode: "drag" | "resize";
    pointerId: number;
    grabX: number;
    grabY: number;
    startPlacement: SignaturePlacement;
  } | null>(null);

  const measureLayout = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.complete || img.naturalWidth === 0) return;
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const next: PageLayout = {
      offsetX: imgRect.left - containerRect.left,
      offsetY: imgRect.top - containerRect.top,
      width: imgRect.width,
      height: imgRect.height,
    };
    layoutRef.current = next;
    setLayout(next);
  }, []);

  useEffect(() => {
    measureLayout();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => measureLayout());
    ro.observe(container);
    return () => ro.disconnect();
  }, [measureLayout, pageSrc]);

  const sigWidthPx = layout ? placement.widthRatio * layout.width : 0;
  const sigHeightPx = sigWidthPx / signatureAspectRatio;

  const onPointerDownDrag = (e: React.PointerEvent) => {
    const pageArea = pageAreaRef.current;
    const pageLayout = layoutRef.current;
    if (!pageArea || !pageLayout || !signatureSrc) return;
    e.preventDefault();
    e.stopPropagation();
    const pageRect = pageArea.getBoundingClientRect();
    const overlayLeft = placement.xRatio * pageRect.width;
    const overlayTop = placement.yRatio * pageRect.height;
    dragRef.current = {
      mode: "drag",
      pointerId: e.pointerId,
      grabX: e.clientX - pageRect.left - overlayLeft,
      grabY: e.clientY - pageRect.top - overlayTop,
      startPlacement: placement,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerDownResize = (e: React.PointerEvent) => {
    const pageArea = pageAreaRef.current;
    const pageLayout = layoutRef.current;
    if (!pageArea || !pageLayout || !signatureSrc) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      mode: "resize",
      pointerId: e.pointerId,
      grabX: e.clientX,
      grabY: e.clientY,
      startPlacement: placement,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const pageArea = pageAreaRef.current;
    const pageLayout = layoutRef.current;
    if (!drag || !pageArea || !pageLayout || drag.pointerId !== e.pointerId) return;

    const pageRect = pageArea.getBoundingClientRect();

    if (drag.mode === "drag") {
      const sigW = drag.startPlacement.widthRatio * pageRect.width;
      const sigH = sigW / signatureAspectRatio;
      const newLeft = clamp(e.clientX - pageRect.left - drag.grabX, 0, pageRect.width - sigW);
      const newTop = clamp(e.clientY - pageRect.top - drag.grabY, 0, pageRect.height - sigH);
      onPlacementChange({
        ...drag.startPlacement,
        xRatio: newLeft / pageRect.width,
        yRatio: newTop / pageRect.height,
      });
    } else {
      const overlayLeft = drag.startPlacement.xRatio * pageRect.width;
      const pointerX = e.clientX - pageRect.left;
      const newWidthPx = clamp(pointerX - overlayLeft, 24, pageRect.width * 0.9);
      onPlacementChange({
        ...drag.startPlacement,
        widthRatio: newWidthPx / pageRect.width,
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {pageCount > 1 && (
          <>
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={previewPage <= 1}
              onClick={() => onPreviewPageChange(Math.max(1, previewPage - 1))}
            >
              ‹
            </button>
            <span className="text-xs text-muted">
              {previewPage} / {pageCount}
            </span>
            <button
              type="button"
              className="btn-secondary text-xs"
              disabled={previewPage >= pageCount}
              onClick={() => onPreviewPageChange(Math.min(pageCount, previewPage + 1))}
            >
              ›
            </button>
          </>
        )}
        {appliesToBadge && (
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-muted">
            {appliesToBadge}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2"
        dir="ltr"
      >
        {!pageSrc && <div className="pdf-preview-shimmer aspect-[3/4] w-full rounded" aria-hidden="true" />}
        {pageSrc && (
          <img
            ref={imgRef}
            src={pageSrc}
            alt=""
            className="mx-auto block max-h-80 w-full object-contain"
            onLoad={measureLayout}
          />
        )}
        {pageSrc && signatureSrc && layout && (
          <div
            ref={pageAreaRef}
            className="absolute touch-none select-none"
            dir="ltr"
            style={{
              left: layout.offsetX,
              top: layout.offsetY,
              width: layout.width,
              height: layout.height,
            }}
          >
            <div
              className="absolute"
              style={{
                left: placement.xRatio * layout.width,
                top: placement.yRatio * layout.height,
                width: sigWidthPx,
                height: sigHeightPx,
              }}
              onPointerDown={onPointerDownDrag}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="relative h-full w-full cursor-move rounded border-2 border-dashed border-[var(--cat-pdf)] bg-transparent">
                <img
                  src={signatureSrc}
                  alt=""
                  className="pointer-events-none h-full w-full object-contain"
                  draggable={false}
                />
                <div
                  role="presentation"
                  className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-sm bg-[var(--cat-pdf)] shadow-sm"
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDownResize}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
