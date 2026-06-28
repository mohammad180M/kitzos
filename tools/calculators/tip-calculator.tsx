"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

export default function TipCalculator() {
  const t = useCalcToolLabels("tipCalculator");
  const [bill, setBill] = useState("100");
  const [tipPct, setTipPct] = useState("15");
  const [people, setPeople] = useState("2");

  const result = useMemo(() => {
    const b = parseFloat(bill);
    const pct = parseFloat(tipPct);
    const n = parseInt(people, 10);
    if (!Number.isFinite(b) || b <= 0 || !Number.isFinite(pct) || pct < 0 || !Number.isFinite(n) || n < 1) return null;
    const tip = (b * pct) / 100;
    const total = b + tip;
    return { tip, total, perPerson: total / n };
  }, [bill, tipPct, people]);

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.billAmount}</span>
          <input type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.tipPercent}</span>
          <input type="number" min="0" step="1" value={tipPct} onChange={(e) => setTipPct(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.people}</span>
          <input type="number" min="1" step="1" value={people} onChange={(e) => setPeople(e.target.value)} className="input-field mt-1 w-full" />
        </label>
      </div>
      {result ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: t.tipAmount, value: fmt(result.tip) },
            { label: t.total, value: fmt(result.total) },
            { label: t.perPerson, value: fmt(result.perPerson) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
