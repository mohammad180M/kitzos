"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { getIcon } from "@/lib/icons";
import type { LocalizableTool } from "@/lib/i18n/localized-labels";
import type { CategoryId } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory, getLocalizedTool } from "@/lib/i18n/localized-labels";
import { localizedPath } from "@/lib/i18n/routing";
import { categories } from "@/lib/categories";

/** Fields ToolCard renders; accepts full registry `Tool` or client `ToolLite`. */
export type ToolCardTool = LocalizableTool & {
  category: CategoryId;
  icon: string;
  isNew?: boolean;
};

interface ToolCardProps {
  tool: ToolCardTool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const { locale, t } = useLocale();
  const { title, description } = getLocalizedTool(tool, locale);
  const category = categories.find((c) => c.id === tool.category);
  const { name: categoryName } = category
    ? getLocalizedCategory(category, locale)
    : { name: tool.category };
  const Icon = getIcon(tool.icon);
  const catColor = categoryColorVar(tool.category);

  return (
    <Link
      href={localizedPath(locale, `/tools/${tool.slug}`)}
      className="group relative flex h-full min-h-[7.5rem] overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-150 hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none"
      style={{ "--cat-color": catColor } as CSSProperties}
    >
      <span
        className="tool-card-spine absolute bottom-0 start-0 top-0 shrink-0 rounded-s-lg bg-[var(--cat-color)]"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 ps-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: `color-mix(in srgb, ${catColor} 10%, transparent)`,
              color: catColor,
            }}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-foreground">
              {title}
              {tool.isNew && (
                <span className="label-mono inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-accent">
                  <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
                  {t.common.new}
                </span>
              )}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted">{description}</p>
          </div>
        </div>
        <p className="label-mono text-[10px] uppercase tracking-wide text-muted">
          {categoryName}
        </p>
      </div>
    </Link>
  );
}
