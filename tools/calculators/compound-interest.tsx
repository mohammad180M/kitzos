"use client";

import { useMemo, useState } from "react";
import { compoundInterest, type CompoundFrequency } from "@/lib/finance-calc";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

const FREQUENCIES: CompoundFrequency[] = ["annual", "semiannual", "quarterly", "monthly", "daily"];

export default function CompoundInterestCalculator() {
  const t = useCalcToolLabels("compoundInterest");
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("10");
  const [frequency, setFrequency] = useState<CompoundFrequency>("monthly");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const y = parseFloat(years);
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(r) || r < 0 || !Number.isFinite(y) || y <= 0) return null;
    return compoundInterest(p, r, y, frequency);
  }, [principal, rate, years, frequency]);

  const fmt = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.principal}</span>
          <input type="number" min="0" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.rate}</span>
          <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.years}</span>
          <input type="number" min="0" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.frequency}</span>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as CompoundFrequency)} className="input-field mt-1 w-full">
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{t.frequencies[f]}</option>
            ))}
          </select>
        </label>
      </div>
      {result ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.finalAmount}</p>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{fmt(result.finalAmount)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.interestEarned}</p>
            <p className="text-xl font-bold">{fmt(result.interestEarned)}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
