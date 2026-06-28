"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

export default function DiscountCalculator() {
  const t = useCalcToolLabels("discountCalculator");
  const [original, setOriginal] = useState("199");
  const [discount, setDiscount] = useState("25");

  const result = useMemo(() => {
    const o = parseFloat(original);
    const d = parseFloat(discount);
    if (!Number.isFinite(o) || o <= 0 || !Number.isFinite(d) || d < 0 || d > 100) return null;
    const saved = (o * d) / 100;
    return { final: o - saved, saved };
  }, [original, discount]);

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.originalPrice}</span>
          <input type="number" min="0" step="0.01" value={original} onChange={(e) => setOriginal(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.discount}</span>
          <input type="number" min="0" max="100" step="1" value={discount} onChange={(e) => setDiscount(e.target.value)} className="input-field mt-1 w-full" />
        </label>
      </div>
      {result ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.finalPrice}</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{fmt(result.final)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.youSave}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(result.saved)}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
