"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories, type CategoryId } from "@/lib/categories";
import { getIcon } from "@/lib/icons";
import { getToolBySlug } from "@/lib/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-data";
import { isValidLocale, localizedPath } from "@/lib/i18n/routing";

function getActiveCategoryId(pathname: string): CategoryId | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const segment = parts[1];
  if (segment === "tools" && parts[2]) {
    const tool = getToolBySlug(parts[2]);
    return tool?.category ?? null;
  }

  if (categories.some((c) => c.id === segment)) {
    return segment as CategoryId;
  }

  return null;
}

function isHomePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 1 && isValidLocale(parts[0]);
}

export default function CategoryBar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const activeId = getActiveCategoryId(pathname);

  if (isHomePath(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label={locale === "ar" ? "فئات الأدوات" : "Tool categories"}
      className="sticky top-14 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/80"
    >
      <div className="site-container">
        <ul className="flex items-center gap-1 py-2 max-md:overflow-x-auto max-md:pb-2 md:flex-wrap md:justify-center lg:justify-between">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            const { name } = getLocalizedCategory(category, locale);
            const href = localizedPath(locale, `/${category.id}`);
            const isActive = activeId === category.id;

            return (
              <li key={category.id} className="shrink-0 md:shrink">
                <Link
                  href={href}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-600 text-white shadow-sm dark:bg-primary-500"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
