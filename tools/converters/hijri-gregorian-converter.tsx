"use client";

import { useMemo, useState, useEffect } from "react";
import {
  gregorianToHijri,
  hijriToGregorian,
  HIJRI_MONTHS_AR,
  HIJRI_MONTHS_EN,
} from "@/lib/hijri-calendar";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Mode = "to-hijri" | "to-gregorian";

export default function HijriGregorianConverter() {
  const { locale } = useLocale();
  const t = useConverterToolLabels("hijriGregorian");
  const [mode, setMode] = useState<Mode>("to-hijri");
  const [gDate, setGDate] = useState("");
  const [hYear, setHYear] = useState("1447");
  const [hMonth, setHMonth] = useState("9");
  const [hDay, setHDay] = useState("1");

  useEffect(() => {
    setGDate(new Date().toISOString().slice(0, 10));
  }, []);

  const monthNames = locale === "ar" ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN;

  const result = useMemo(() => {
    if (mode === "to-hijri") {
      const [y, m, d] = gDate.split("-").map(Number);
      if (!y || !m || !d) return null;
      const h = gregorianToHijri(y, m, d);
      if (!h) return null;
      return {
        text: `${h.day} ${monthNames[h.month - 1]} ${h.year}`,
        detail: `${h.year}/${h.month}/${h.day}`,
      };
    }
    const y = parseInt(hYear, 10);
    const m = parseInt(hMonth, 10);
    const d = parseInt(hDay, 10);
    const g = hijriToGregorian(y, m, d);
    if (!g) return null;
    const iso = `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`;
    return { text: iso, detail: iso };
  }, [mode, gDate, hYear, hMonth, hDay, monthNames]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        {(["to-hijri", "to-gregorian"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {m === "to-hijri" ? t.modeToHijri : t.modeToGregorian}
          </button>
        ))}
      </div>

      {mode === "to-hijri" ? (
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.gregorianDate}</span>
          <input type="date" value={gDate} onChange={(e) => setGDate(e.target.value)} className="input-field mt-1 w-full" />
        </label>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.year}</span>
            <input type="number" min="1" value={hYear} onChange={(e) => setHYear(e.target.value)} className="input-field mt-1 w-full" dir="ltr" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.month}</span>
            <select value={hMonth} onChange={(e) => setHMonth(e.target.value)} className="input-field mt-1 w-full">
              {monthNames.map((name, i) => (
                <option key={name} value={String(i + 1)}>{i + 1} — {name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.day}</span>
            <input type="number" min="1" max="30" value={hDay} onChange={(e) => setHDay(e.target.value)} className="input-field mt-1 w-full" dir="ltr" />
          </label>
        </div>
      )}

      {result ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 text-xl font-bold text-primary-600 dark:text-primary-400" dir={mode === "to-hijri" && locale === "ar" ? "rtl" : "ltr"}>
            {result.text}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.note}</p>
    </div>
  );
}
