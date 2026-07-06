"use client";

import Link from "next/link";
import { categories } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import { getToolsByCategoryLite } from "@/lib/registry-lite";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory, getLocalizedTool } from "@/lib/i18n/localized-labels";
import { localizedPath } from "@/lib/i18n/routing";
import BrandMark from "@/components/BrandMark";

export default function Footer() {
  const { locale, t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="site-container py-12">
        <div className="mb-8">
          <Link
            href={localizedPath(locale, "/")}
            className="font-display inline-flex items-center gap-2 text-lg font-bold text-foreground transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            kitzos
            <BrandMark />
          </Link>
          <p className="mt-2 max-w-md text-sm text-muted">{t.footer.tagline}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const categoryTools = getToolsByCategoryLite(category.id);
            const { name } = getLocalizedCategory(category, locale);
            const color = categoryColorVar(category.id);

            return (
              <div key={category.id}>
                <h3 className="label-mono flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-foreground">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <Link
                    href={localizedPath(locale, `/${category.id}`)}
                    className="transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {name}
                  </Link>
                </h3>
                <ul className="mt-3 space-y-2">
                  {categoryTools.map((tool) => {
                    const { title } = getLocalizedTool(tool, locale);
                    return (
                      <li key={tool.slug}>
                        <Link
                          href={localizedPath(locale, `/tools/${tool.slug}`)}
                          className="text-sm text-muted transition-colors hover:text-foreground focus:outline-none focus-visible:text-accent"
                        >
                          {title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div>
            <h3 className="label-mono text-[11px] font-medium uppercase tracking-wide text-foreground">
              {t.footer.company}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={localizedPath(locale, "/about")}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedPath(locale, "/contact")}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
            <h3 className="label-mono mt-6 text-[11px] font-medium uppercase tracking-wide text-foreground">
              {t.footer.legal}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={localizedPath(locale, "/privacy")}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedPath(locale, "/terms")}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row">
          <p>
            © {year} kitzos.com — {t.footer.copyright}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link
              href={localizedPath(locale, "/privacy")}
              className="transition-colors hover:text-foreground"
            >
              {t.footer.privacyShort}
            </Link>
            <Link
              href={localizedPath(locale, "/terms")}
              className="transition-colors hover:text-foreground"
            >
              {t.footer.termsShort}
            </Link>
            <Link href={localizedPath(locale, "/about")} className="transition-colors hover:text-foreground">
              {t.footer.about}
            </Link>
            <Link href={localizedPath(locale, "/contact")} className="transition-colors hover:text-foreground">
              {t.footer.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
