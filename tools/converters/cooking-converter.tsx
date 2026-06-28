"use client";

import { useMemo, useState } from "react";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";

type CookUnit = "cup" | "tbsp" | "tsp" | "ml" | "floz" | "gramWater";

/** All units convert via milliliters (US volume). Grams assume water density. */
const TO_ML: Record<CookUnit, number> = {
  cup: 236.588,
  tbsp: 14.7868,
  tsp: 4.92892,
  ml: 1,
  floz: 29.5735,
  gramWater: 1,
};

export default function CookingConverter() {
  const t = useConverterToolLabels("cooking");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<CookUnit>("cup");
  const [to, setTo] = useState<CookUnit>("ml");

  const units: CookUnit[] = ["cup", "tbsp", "tsp", "ml", "floz", "gramWater"];

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (!Number.isFinite(v) || v < 0) return null;
    const ml = v * TO_ML[from];
    return ml / TO_ML[to];
  }, [value, from, to]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.hint}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.value}</span>
          <input type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="input-field mt-1 w-full" dir="ltr" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.from}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value as CookUnit)} className="input-field mt-1 w-full">
            {units.map((u) => (
              <option key={u} value={u}>{t[u]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.to}</span>
          <select value={to} onChange={(e) => setTo(e.target.value as CookUnit)} className="input-field mt-1 w-full">
            {units.map((u) => (
              <option key={u} value={u}>{t[u]}</option>
            ))}
          </select>
        </label>
      </div>
      {result != null ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400" dir="ltr">
            {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
