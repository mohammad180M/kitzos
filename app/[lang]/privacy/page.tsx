import type { Metadata } from "next";
import LocalizedInfoPage from "@/components/legal/LocalizedInfoPage";
import PrivacyContent from "@/components/legal/PrivacyContent";
import { getLegalPageMetadata } from "@/lib/seo";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { isValidLocale } from "@/lib/i18n/routing";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

interface PrivacyPageProps {
  params: { lang: string };
}

export function generateMetadata({ params }: PrivacyPageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  return getLegalPageMetadata(params.lang as Locale, "privacy");
}

export default function PrivacyPage() {
  return (
    <LocalizedInfoPage page="privacy">
      <PrivacyContent />
    </LocalizedInfoPage>
  );
}
