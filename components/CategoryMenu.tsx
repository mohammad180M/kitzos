"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { categories } from "@/lib/categories";
import { getIcon } from "@/lib/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory } from "@/lib/i18n/localized-data";
import { localizedPath } from "@/lib/i18n/routing";

export default function CategoryMenu() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        if (window.matchMedia("(min-width: 768px)").matches) setOpen(true);
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(min-width: 768px)").matches) scheduleClose();
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          open
            ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        }`}
        aria-label={t.header.categoriesMenu}
        aria-expanded={open}
        aria-haspopup="true"
        title={t.header.categoriesMenu}
      >
        <Wrench className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <nav
          aria-label={t.header.categoriesAria}
          className="absolute end-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:w-80"
        >
          <ul className="grid gap-0.5 sm:grid-cols-2">
            {categories.map((category) => {
              const Icon = getIcon(category.icon);
              const { name } = getLocalizedCategory(category, locale);
              const href = localizedPath(locale, `/${category.id}`);
              const isActive =
                pathname === href || pathname === href.slice(0, -1);

              return (
                <li key={category.id}>
                  <Link
                    href={href}
                    onClick={close}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                    <span className="leading-tight">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
