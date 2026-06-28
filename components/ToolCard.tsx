"use client";

import Link from "next/link";
import { getIcon } from "@/lib/icons";
import type { Tool } from "@/lib/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedTool } from "@/lib/i18n/localized-data";
import { localizedPath } from "@/lib/i18n/routing";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const { locale, t } = useLocale();
  const { title, description } = getLocalizedTool(tool, locale);
  const Icon = getIcon(tool.icon);

  return (
    <Link
      href={localizedPath(locale, `/tools/${tool.slug}`)}
      className="group flex h-full min-h-[5.5rem] items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary-700 dark:hover:shadow-lg dark:hover:shadow-black/20"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-950/60 dark:text-primary-400 dark:group-hover:bg-primary-900/60">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h3 className="flex flex-wrap items-center gap-2 font-medium text-gray-900 group-hover:text-primary-700 dark:text-gray-100 dark:group-hover:text-primary-400">
          {title}
          {tool.isNew && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/60 dark:text-primary-300">
              {t.common.new}
            </span>
          )}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
