"use client";

import type { ReactNode } from "react";

interface PdfWorkbenchLayoutProps {
  active: boolean;
  controls: ReactNode;
  preview: ReactNode | null;
}

/** Two-column PDF workbench: controls left, preview right (fixed LTR column order). */
export default function PdfWorkbenchLayout({
  active,
  controls,
  preview,
}: PdfWorkbenchLayoutProps) {
  if (!active || !preview) {
    return <div className="space-y-4">{controls}</div>;
  }

  return (
    <div
      className="lg:grid lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start lg:gap-6"
      dir="ltr"
    >
      <div className="min-w-0 space-y-4">{controls}</div>
      <div className="mt-6 min-w-0 lg:mt-0">{preview}</div>
    </div>
  );
}
