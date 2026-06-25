import type { Metadata } from "next";
import LocalizedInfoPage from "@/components/legal/LocalizedInfoPage";
import ContactContent from "@/components/legal/ContactContent";
import { getLegalPageMetadata } from "@/lib/seo";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { isValidLocale } from "@/lib/i18n/routing";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

interface ContactPageProps {
  params: { lang: string };
}

export function generateMetadata({ params }: ContactPageProps): Metadata {
  if (!isValidLocale(params.lang)) return {};
  return getLegalPageMetadata(params.lang as Locale, "contact");
}

export default function ContactPage() {
  return (
    <LocalizedInfoPage page="contact">
      <ContactContent />
    </LocalizedInfoPage>
  );
}
