"use client";

import { useMemo, useState } from "react";
import { convertBase } from "@/lib/number-base";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

const BASES = [2, 8, 10, 16] as const;

export default function NumberBaseConverter() {
  const t = useCalcToolLabels("numberBaseConverter");
  const [value, setValue] = useState("255");
  const [fromBase, setFromBase] = useState<number>(10);
  const [toBase, setToBase] = useState<number>(2);

  const result = useMemo(() => convertBase(value, fromBase, toBase), [value, fromBase, toBase]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <input type="text" value={value} onChange={(e) => setValue(e.target.value.toUpperCase())} className="input-field mt-1 w-full font-mono" dir="ltr" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.fromBase}</span>
          <select value={fromBase} onChange={(e) => setFromBase(Number(e.target.value))} className="input-field mt-1 w-full">
            {BASES.map((b) => (
              <option key={b} value={b}>{t.bases[b as keyof typeof t.bases]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.toBase}</span>
          <select value={toBase} onChange={(e) => setToBase(Number(e.target.value))} className="input-field mt-1 w-full">
            {BASES.map((b) => (
              <option key={b} value={b}>{t.bases[b as keyof typeof t.bases]}</option>
            ))}
          </select>
        </label>
      </div>
      {result != null ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 break-all font-mono text-xl font-bold text-primary-600 dark:text-primary-400" dir="ltr">{result}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
