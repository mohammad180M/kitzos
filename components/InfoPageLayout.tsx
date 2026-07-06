"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { generateBreadcrumbSchema, generateInfoBreadcrumbs } from "@/lib/seo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/routing";
import JsonLd from "./JsonLd";
import Footer from "./Footer";

interface InfoPageLayoutProps {
  title: string;
  description?: string;
  pagePath: string;
  children: ReactNode;
}

export default function InfoPageLayout({
  title,
  description,
  pagePath,
  children,
}: InfoPageLayoutProps) {
  const { locale, t } = useLocale();
  const breadcrumbSchema = generateBreadcrumbSchema(
    generateInfoBreadcrumbs(locale, title, pagePath)
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label={t.tool.breadcrumbAria} className="label-mono mb-8 text-xs uppercase tracking-wide text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li className="flex items-center gap-1">
              <Link
                href={localizedPath(locale, "/")}
                className="transition-colors hover:text-foreground"
              >
                {t.common.home}
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <span className="font-medium text-foreground" aria-current="page">
                {title}
              </span>
            </li>
          </ol>
        </nav>

        <header className="mb-10 border-b border-line pb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && <p className="mt-3 text-lg leading-relaxed text-muted">{description}</p>}
        </header>

        <article className="info-prose">{children}</article>
      </div>
      <Footer />
    </>
  );
}
