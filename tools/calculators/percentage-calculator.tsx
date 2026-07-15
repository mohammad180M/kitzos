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
      case "percent-of": {
        if (numB === 0) return null;
        const value = (numA / 100) * numB;
        return {
          text: t.resultPercentOf(strA, strB, fmt(value)),
          highlight: fmt(value),
        };
      }
      case "what-percent": {
        if (numB === 0) return null;
        const pct = (numA / numB) * 100;
        return {
          text: t.resultWhatPercent(strA, fmt(pct), strB),
          highlight: `${fmt(pct)}%`,
        };
      }
      case "change": {
        if (numA === 0) return null;
        const change = ((numB - numA) / numA) * 100;
        const pct = fmt(Math.abs(change));
        return {
          text:
            change >= 0
              ? t.resultChangeIncrease(strA, strB, pct)
              : t.resultChangeDecrease(strA, strB, pct),
          highlight: `${change >= 0 ? "+" : "−"}${pct}%`,
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

  const modeBtn = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-[var(--cat-calc)] text-white"
        : "text-[var(--muted)] hover:text-[var(--text)]"
    }`;

  return (
    <div className="mx-auto max-w-xl space-y-4 text-center" dir="ltr">
      <div>
        <p className="text-sm font-medium text-[var(--text)]">{t.mode}</p>
        <div className="mt-2 inline-flex flex-wrap justify-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5">
          <button type="button" onClick={() => setMode("percent-of")} className={modeBtn(mode === "percent-of")}>
            {t.modePercentOf}
          </button>
          <button
            type="button"
            onClick={() => setMode("what-percent")}
            className={modeBtn(mode === "what-percent")}
          >
            {t.modeWhatPercent}
          </button>
          <button type="button" onClick={() => setMode("change")} className={modeBtn(mode === "change")}>
            {t.modeChange}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pct-a" className="block text-center text-sm font-medium text-[var(--text)]">
            {labels[mode].a}
          </label>
          <input
            id="pct-a"
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="input-field mt-1 text-center"
          />
        </div>
        <div>
          <label htmlFor="pct-b" className="block text-center text-sm font-medium text-[var(--text)]">
            {labels[mode].b}
          </label>
          <input
            id="pct-b"
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="input-field mt-1 text-center"
          />
        </div>
      </div>

      {result ? (
        <div className="space-y-2">
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
            <p className="text-base font-medium text-[var(--text)]" dir="auto">
              {result.text}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-5">
            <p className="text-sm text-[var(--muted)]">{t.result}</p>
            <p className="mt-1 text-4xl font-bold text-[var(--cat-calc)]">{result.highlight}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">{t.invalid}</p>
      )}
    </div>
  );
}
