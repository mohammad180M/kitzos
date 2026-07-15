"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  containsArabicScript,
  fontsForPicker,
  type WatermarkFontMeta,
} from "@/lib/pdf/watermark-fonts";
import { ensureWatermarkFontFace } from "@/lib/pdf/watermark-font-loader";

interface WatermarkFontPickerProps {
  value: string;
  onChange: (id: string) => void;
  locale: string;
  watermarkText: string;
  label: string;
  arabicGroupLabel: string;
  otherGroupLabel: string;
  arabicWarning: string;
}

export default function WatermarkFontPicker({
  value,
  onChange,
  locale,
  watermarkText,
  label,
  arabicGroupLabel,
  otherGroupLabel,
  arabicWarning,
}: WatermarkFontPickerProps) {
  const needsArabic = containsArabicScript(watermarkText);
  const fonts = useMemo(
    () => fontsForPicker(locale, needsArabic),
    [locale, needsArabic]
  );
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = fonts.find((f) => f.id === value) ?? fonts[0];

  useEffect(() => {
    void ensureWatermarkFontFace(selected).then(() => {
      setLoaded((prev) => ({ ...prev, [selected.id]: true }));
    });
  }, [selected]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const root = listRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.fontId;
          if (!id) continue;
          const meta = fonts.find((f) => f.id === id);
          if (!meta || loaded[id]) continue;
          void ensureWatermarkFontFace(meta)
            .then(() => setLoaded((prev) => ({ ...prev, [id]: true })))
            .catch(() => undefined);
        }
      },
      { root, rootMargin: "40px" }
    );
    root.querySelectorAll<HTMLElement>("[data-font-id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [open, fonts, loaded]);

  const arabicFonts = fonts.filter((f) => f.arabic);
  const otherFonts = fonts.filter((f) => !f.arabic);
  const showWarning = needsArabic && selected && !selected.arabic;

  const renderOption = (font: WatermarkFontMeta) => {
    const disabled = needsArabic && !font.arabic;
    return (
      <button
        key={font.id}
        type="button"
        data-font-id={font.id}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onChange(font.id);
          setOpen(false);
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-start text-sm transition-colors ${
          font.id === value
            ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
            : "hover:bg-[var(--surface-2)]"
        } ${disabled ? "opacity-40" : ""}`}
        style={
          loaded[font.id]
            ? { fontFamily: `"${font.family}", sans-serif` }
            : undefined
        }
      >
        <span className="truncate">{font.label}</span>
        {font.arabic && (
          <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">AR</span>
        )}
      </button>
    );
  };

  return (
    <div className="relative text-sm">
      <span className="font-medium text-[var(--text)]">{label}</span>
      <button
        type="button"
        className="input-field mt-1 flex w-full items-center justify-between gap-2 text-start"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={
          loaded[selected.id]
            ? { fontFamily: `"${selected.family}", sans-serif` }
            : undefined
        }
      >
        <span className="truncate">{selected.label}</span>
        <span className="text-[var(--muted)]" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1 shadow-lg"
        >
          {locale === "ar" || needsArabic ? (
            <>
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {arabicGroupLabel}
              </p>
              {arabicFonts.map(renderOption)}
              <p className="mt-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {otherGroupLabel}
              </p>
              {otherFonts.map(renderOption)}
            </>
          ) : (
            fonts.map(renderOption)
          )}
        </div>
      )}

      {showWarning && (
        <p className="mt-1.5 text-xs text-[var(--cat-pdf)]" role="status">
          {arabicWarning}
        </p>
      )}
    </div>
  );
}
