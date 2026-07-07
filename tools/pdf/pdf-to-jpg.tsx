"use client";

import { useCallback, useEffect, useState } from "react";
import UnsavedWorkDialog from "@/components/UnsavedWorkDialog";
import ImagesToPdfDirection from "@/tools/pdf/images-to-pdf-direction";
import PdfToImagesDirection from "@/tools/pdf/pdf-to-images-direction";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

export type ConverterDirection = "to-images" | "to-pdf";

export default function PdfToJpg() {
  const t = usePdfToolLabels("pdfToJpg");
  const { t: dict, dir } = useLocale();
  const [direction, setDirection] = useState<ConverterDirection>("to-images");
  const [panelKey, setPanelKey] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<ConverterDirection | null>(null);

  useUnsavedWork(dirty);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dir") === "to-pdf") {
      setDirection("to-pdf");
    }
  }, []);

  const applyDirection = useCallback((next: ConverterDirection) => {
    setDirection(next);
    setDirty(false);
    setPanelKey((k) => k + 1);
  }, []);

  const requestDirection = (next: ConverterDirection) => {
    if (next === direction) return;
    if (dirty) {
      setPendingDirection(next);
      setDialogOpen(true);
      return;
    }
    applyDirection(next);
  };

  const onDirtyChange = useCallback((isDirty: boolean) => {
    setDirty(isDirty);
  }, []);

  return (
    <div className="space-y-4">
      <div
        className="inline-flex w-full rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-1 sm:w-auto"
        role="tablist"
        aria-label={t.directionLabel}
      >
        {(
          [
            { id: "to-images" as const, label: t.dirToImages },
            { id: "to-pdf" as const, label: t.dirToPdf },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={direction === id}
            onClick={() => requestDirection(id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
              direction === id
                ? "bg-[var(--cat-pdf)] text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {direction === "to-images" ? (
        <PdfToImagesDirection key={`to-images-${panelKey}`} onDirtyChange={onDirtyChange} />
      ) : (
        <ImagesToPdfDirection key={`to-pdf-${panelKey}`} onDirtyChange={onDirtyChange} />
      )}

      <UnsavedWorkDialog
        open={dialogOpen}
        title={dict.header.unsavedWorkTitle}
        body={dict.header.unsavedWorkBody}
        confirmLabel={dict.header.unsavedWorkConfirm}
        cancelLabel={dict.header.unsavedWorkCancel}
        dir={dir}
        onConfirm={() => {
          setDialogOpen(false);
          if (pendingDirection) applyDirection(pendingDirection);
          setPendingDirection(null);
        }}
        onCancel={() => {
          setDialogOpen(false);
          setPendingDirection(null);
        }}
      />
    </div>
  );
}
