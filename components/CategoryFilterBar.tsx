"use client";

import type { CSSProperties } from "react";
import { categories, type CategoryId } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-labels";

export type CategoryFilter = CategoryId | "all";

interface CategoryFilterBarProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function chipStyle(active: boolean, color: string): CSSProperties | undefined {
  if (!active) return undefined;
  return {
    backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
    borderColor: color,
    color,
  };
}

const chipBase =
  "label-mono inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const chipIdle = "hover:border-muted hover:bg-surface-2 hover:text-foreground";

export default function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  const { locale, t } = useLocale();
  const allColor = "var(--accent)";

  return (
    <nav aria-label={t.home.filterAria} className="mt-8">
      <ul className="chip-scroll-fade -mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        <li>
          <button
            type="button"
            aria-pressed={value === "all"}
            onClick={() => onChange("all")}
            className={`${chipBase} ${value === "all" ? "" : chipIdle}`}
            style={chipStyle(value === "all", allColor)}
          >
            <ColorDot color={allColor} />
            {t.home.filterAll}
          </button>
        </li>
        {categories.map((category) => {
          const { name } = getLocalizedCategory(category, locale);
          const color = categoryColorVar(category.id);
          const isActive = value === category.id;
          return (
            <li key={category.id}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(category.id)}
                className={`${chipBase} ${isActive ? "" : chipIdle}`}
                style={chipStyle(isActive, color)}
              >
                <ColorDot color={color} />
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
