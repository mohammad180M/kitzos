"use client";

import { useLayoutEffect } from "react";
import { useLocale } from "./LocaleProvider";

/** Syncs <html lang> and dir from the active locale (URL-driven). */
export function LangHtmlAttributes() {
  const { locale, dir } = useLocale();

  useLayoutEffect(() => {
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", dir);
  }, [locale, dir]);

  return null;
}
