"use client";

import { LayoutGrid } from "lucide-react";
import { categories, type CategoryId } from "@/lib/categories";
import { getIcon } from "@/lib/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-data";

export type CategoryFilter = CategoryId | "all";

interface CategoryFilterBarProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}

const chipBase =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900";

const chipIdle =
  "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-primary-950/40 dark:hover:text-primary-400";

const chipActive =
  "border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/25 shadow-[0_0_14px_rgba(37,99,235,0.22)] dark:border-primary-400 dark:bg-primary-950/50 dark:text-primary-300 dark:shadow-[0_0_16px_rgba(96,165,250,0.28)]";

export default function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  const { locale, t } = useLocale();

  return (
    <nav aria-label={t.home.filterAria} className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-2 max-md:-mx-1 max-md:flex-nowrap max-md:justify-start max-md:overflow-x-auto max-md:pb-1">
        <li>
          <button
            type="button"
            aria-pressed={value === "all"}
            onClick={() => onChange("all")}
            className={`${chipBase} ${value === "all" ? chipActive : chipIdle}`}
          >
            <LayoutGrid className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
            {t.home.filterAll}
          </button>
        </li>
        {categories.map((category) => {
          const Icon = getIcon(category.icon);
          const { name } = getLocalizedCategory(category, locale);
          const isActive = value === category.id;
          return (
            <li key={category.id}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(category.id)}
                className={`${chipBase} ${isActive ? chipActive : chipIdle}`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
