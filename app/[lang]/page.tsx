import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import { getHomeMetadata } from "@/lib/seo";
import { isValidLocale } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/types";

interface HomePageProps {
  params: { lang: string };
}

export function generateMetadata({ params }: HomePageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  return getHomeMetadata(params.lang as Locale);
}

export default function HomePage() {
  return <HomeContent />;
}
