"use client";

import type { ReactNode } from "react";
import InfoPageLayout from "@/components/InfoPageLayout";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type LegalPageKey = "privacy" | "terms" | "about" | "contact";

const PAGE_PATHS: Record<LegalPageKey, string> = {
  privacy: "/privacy",
  terms: "/terms",
  about: "/about",
  contact: "/contact",
};

const TITLE_KEYS: Record<LegalPageKey, keyof ReturnType<typeof useLocale>["t"]["legal"]> = {
  privacy: "privacyTitle",
  terms: "termsTitle",
  about: "aboutTitle",
  contact: "contactTitle",
};

const DESC_KEYS: Record<LegalPageKey, keyof ReturnType<typeof useLocale>["t"]["legal"]> = {
  privacy: "privacyDescription",
  terms: "termsDescription",
  about: "aboutDescription",
  contact: "contactDescription",
};

interface LocalizedInfoPageProps {
  page: LegalPageKey;
  children: ReactNode;
}

export default function LocalizedInfoPage({ page, children }: LocalizedInfoPageProps) {
  const { t } = useLocale();
  const title = t.legal[TITLE_KEYS[page]] as string;
  const description = t.legal[DESC_KEYS[page]] as string;

  return (
    <InfoPageLayout title={title} description={description} pagePath={PAGE_PATHS[page]}>
      {children}
    </InfoPageLayout>
  );
}
