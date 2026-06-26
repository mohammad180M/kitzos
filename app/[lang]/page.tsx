import type { Metadata } from "next";
import { Suspense } from "react";
import HomeContent from "@/components/HomeContent";
import JsonLd from "@/components/JsonLd";
import { getHomeMetadata, generateWebSiteSchema } from "@/lib/seo";
import { isValidLocale } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/types";

interface HomePageProps {
  params: { lang: string };
}

export function generateMetadata({ params }: HomePageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  return getHomeMetadata(params.lang as Locale);
}

export default function HomePage({ params }: HomePageProps) {
  const locale = isValidLocale(params.lang) ? (params.lang as Locale) : "en";
  return (
    <>
      <JsonLd data={generateWebSiteSchema(locale)} />
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
    </>
  );
}
