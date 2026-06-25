import type { Metadata } from "next";
import LocalizedInfoPage from "@/components/legal/LocalizedInfoPage";
import TermsContent from "@/components/legal/TermsContent";
import { getLegalPageMetadata } from "@/lib/seo";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { isValidLocale } from "@/lib/i18n/routing";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

interface TermsPageProps {
  params: { lang: string };
}

export function generateMetadata({ params }: TermsPageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  return getLegalPageMetadata(params.lang as Locale, "terms");
}

export default function TermsPage() {
  return (
    <LocalizedInfoPage page="terms">
      <TermsContent />
    </LocalizedInfoPage>
  );
}
