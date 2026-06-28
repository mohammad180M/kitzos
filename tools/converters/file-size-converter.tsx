"use client";

import { useMemo, useState } from "react";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";

type SizeUnit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";
type Base = "binary" | "decimal";

const UNITS: SizeUnit[] = ["B", "KB", "MB", "GB", "TB", "PB"];

function toBytes(value: number, unit: SizeUnit, base: Base): number {
  const exp = UNITS.indexOf(unit);
  const factor = base === "binary" ? 1024 : 1000;
  return value * Math.pow(factor, exp);
}

function fromBytes(bytes: number, unit: SizeUnit, base: Base): number {
  const exp = UNITS.indexOf(unit);
  const factor = base === "binary" ? 1024 : 1000;
  return bytes / Math.pow(factor, exp);
}

export default function FileSizeConverter() {
  const t = useConverterToolLabels("fileSize");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<SizeUnit>("GB");
  const [to, setTo] = useState<SizeUnit>("MB");
  const [base, setBase] = useState<Base>("binary");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (!Number.isFinite(v) || v < 0) return null;
    const bytes = toBytes(v, from, base);
    return fromBytes(bytes, to, base);
  }, [value, from, to, base]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        {(["binary", "decimal"] as Base[]).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBase(b)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              base === b ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {b === "binary" ? t.binary : t.decimal}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.value}</span>
          <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} className="input-field mt-1 w-full" dir="ltr" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.from}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value as SizeUnit)} className="input-field mt-1 w-full">
            {UNITS.map((u) => (
              <option key={u} value={u}>{t.units[u]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.to}</span>
          <select value={to} onChange={(e) => setTo(e.target.value as SizeUnit)} className="input-field mt-1 w-full">
            {UNITS.map((u) => (
              <option key={u} value={u}>{t.units[u]}</option>
            ))}
          </select>
        </label>
      </div>
      {result != null ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400" dir="ltr">
            {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
