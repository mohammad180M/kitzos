"use client";

import type { ReactNode } from "react";

interface PdfWorkbenchLayoutProps {
  active: boolean;
  controls: ReactNode;
  preview: ReactNode | null;
}

/**
 * Two-column PDF workbench: controls left, preview right (fixed LTR column order).
 *
 * IMPORTANT: Keep a stable DOM tree for `controls` whether or not the preview
 * is shown. Switching between a single-column early-return and a grid remounts
 * controls and wipes local state (e.g. BatchUploader file list).
 */
export default function PdfWorkbenchLayout({
  active,
  controls,
  preview,
}: PdfWorkbenchLayoutProps) {
  const showPreview = Boolean(active && preview);

  return (
    <div
      className={
        showPreview
          ? "lg:grid lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start lg:gap-6"
          : undefined
      }
      dir={showPreview ? "ltr" : undefined}
    >
      <div className="min-w-0 space-y-4">{controls}</div>
      {showPreview ? (
        <div className="mt-6 min-w-0 lg:mt-0">{preview}</div>
      ) : null}
    </div>
  );
}
