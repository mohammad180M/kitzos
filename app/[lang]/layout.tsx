import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { LangHtmlAttributes } from "@/lib/i18n/LangHtmlAttributes";
import { isValidLocale } from "@/lib/i18n/routing";
import { LOCALES } from "@/lib/i18n/types";

interface LangLayoutProps {
  children: ReactNode;
  params: { lang: string };
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  if (!isValidLocale(params.lang)) {
    notFound();
  }

  return (
    <LocaleProvider initialLocale={params.lang}>
      <LangHtmlAttributes />
      <Header />
      <main className="flex-1">{children}</main>
    </LocaleProvider>
  );
}
