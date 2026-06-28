"use client";

import { useMemo, useState } from "react";
import { numberToWords } from "@/lib/number-to-words";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function NumberToWordsConverter() {
  const { locale } = useLocale();
  const t = useConverterToolLabels("numberToWords");
  const [input, setInput] = useState("1250000");
  const [lang, setLang] = useState<"en" | "ar">(locale === "ar" ? "ar" : "en");

  const result = useMemo(() => {
    const n = parseInt(input.replace(/,/g, ""), 10);
    if (!Number.isFinite(n)) return null;
    return numberToWords(n, lang);
  }, [input, lang]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="input-field mt-1 w-full"
          dir="ltr"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.language}</span>
        <select value={lang} onChange={(e) => setLang(e.target.value as "en" | "ar")} className="input-field mt-1 w-full">
          <option value="en">{t.en}</option>
          <option value="ar">{t.ar}</option>
        </select>
      </label>
      {result != null ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-2 text-lg font-medium leading-relaxed" dir={lang === "ar" ? "rtl" : "ltr"}>{result}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
