import { useLocale } from "./LocaleProvider";

/** Shared copy/download/clear/generate labels for tool components. */
export function useCommonLabels() {
  const { t } = useLocale();
  return t.common;
}
