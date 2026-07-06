"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { switchLocalePath } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/types";
import { hasUnsavedWork } from "@/lib/unsaved-work";
import UnsavedWorkDialog from "@/components/UnsavedWorkDialog";

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, t, dir } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const nextLocale: Locale = locale === "en" ? "ar" : "en";
  const label =
    mounted && locale === "ar" ? t.header.switchToEnglish : t.header.switchToArabic;

  const switchLanguage = () => {
    setLocale(nextLocale);
    router.push(switchLocalePath(pathname, nextLocale));
  };

  const handleClick = () => {
    if (hasUnsavedWork()) {
      setDialogOpen(true);
      return;
    }
    switchLanguage();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={mounted ? label : t.header.toggleLanguage}
        title={mounted ? label : undefined}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{mounted ? (locale === "ar" ? "EN" : "ع") : ""}</span>
      </button>

      <UnsavedWorkDialog
        open={dialogOpen}
        title={t.header.unsavedWorkTitle}
        body={t.header.unsavedWorkBody}
        confirmLabel={t.header.unsavedWorkConfirm}
        cancelLabel={t.header.unsavedWorkCancel}
        dir={dir}
        onConfirm={() => {
          setDialogOpen(false);
          switchLanguage();
        }}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
}
