"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

type Mode = "percent-of" | "what-percent" | "change";

export default function PercentageCalculator() {
  const t = useCalcToolLabels("percentageCalculator");
  const [mode, setMode] = useState<Mode>("percent-of");
  const [a, setA] = useState("20");
  const [b, setB] = useState("150");

  const result = useMemo(() => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return null;

    const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });
    const strA = fmt(numA);
    const strB = fmt(numB);

    switch (mode) {
      case "percent-of":
        if (numB === 0) return null;
        return {
          text: t.resultPercentOf(strA, strB, fmt((numA / 100) * numB)),
        };
      case "what-percent":
        if (numB === 0) return null;
        return {
          text: t.resultWhatPercent(strA, fmt((numA / numB) * 100), strB),
        };
      case "change": {
        if (numA === 0) return null;
        const change = ((numB - numA) / numA) * 100;
        const pct = fmt(Math.abs(change));
        return {
          text:
            change >= 0
              ? t.resultChangeIncrease(strA, strB, pct)
              : t.resultChangeDecrease(strA, strB, pct),
        };
      }
      default:
        return null;
    }
  }, [mode, a, b, t]);

  const labels: Record<Mode, { a: string; b: string }> = {
    "percent-of": { a: t.percentLabel, b: t.ofNumber },
    "what-percent": { a: t.value, b: t.ofTotal },
    change: { a: t.originalValue, b: t.newValue },
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.mode}</p>
        <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setMode("percent-of")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "percent-of"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {t.modePercentOf}
          </button>
          <button
            type="button"
            onClick={() => setMode("what-percent")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "what-percent"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {t.modeWhatPercent}
          </button>
          <button
            type="button"
            onClick={() => setMode("change")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "change"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {t.modeChange}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pct-a" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {labels[mode].a}
          </label>
          <input
            id="pct-a"
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label htmlFor="pct-b" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {labels[mode].b}
          </label>
          <input
            id="pct-b"
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="input-field mt-1"
          />
        </div>
      </div>

      {result ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{result.text}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
