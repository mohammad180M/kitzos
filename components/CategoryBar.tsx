"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories, type CategoryId } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import { getToolBySlugLite } from "@/lib/registry-lite";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-labels";
import { isValidLocale, localizedPath } from "@/lib/i18n/routing";

function getActiveCategoryId(pathname: string): CategoryId | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const segment = parts[1];
  if (segment === "tools" && parts[2]) {
    const tool = getToolBySlugLite(parts[2]);
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
      className="sticky top-14 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
    >
      <div className="site-container">
        <ul className="chip-scroll-fade flex items-center gap-1 py-2 max-md:overflow-x-auto max-md:pb-2 md:flex-wrap md:justify-center lg:justify-between">
          {categories.map((category) => {
            const { name } = getLocalizedCategory(category, locale);
            const href = localizedPath(locale, `/${category.id}`);
            const isActive = activeId === category.id;
            const catColor = categoryColorVar(category.id);

            return (
              <li key={category.id} className="shrink-0 md:shrink">
                <Link
                  href={href}
                  className={`label-mono inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? "text-foreground"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `color-mix(in srgb, ${catColor} 12%, transparent)`,
                          borderColor: catColor,
                          color: catColor,
                          borderWidth: "1px",
                          borderStyle: "solid",
                        }
                      : undefined
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: catColor }}
                    aria-hidden="true"
                  />
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
