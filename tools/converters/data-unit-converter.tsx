"use client";

import { useMemo, useState } from "react";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";

type DataUnit = "bits" | "bytes" | "kb" | "mb" | "gb" | "mbps" | "gbps";

const UNIT_BITS: Record<DataUnit, number> = {
  bits: 1,
  bytes: 8,
  kb: 8 * 1024,
  mb: 8 * 1024 * 1024,
  gb: 8 * 1024 * 1024 * 1024,
  mbps: 1_000_000,
  gbps: 1_000_000_000,
};

const LABEL_KEYS: Record<DataUnit, keyof ReturnType<typeof useConverterToolLabels<"dataUnit">>> = {
  bits: "bits",
  bytes: "bytes",
  kb: "kb",
  mb: "mb",
  gb: "gb",
  mbps: "mbps",
  gbps: "gbps",
};

export default function DataUnitConverter() {
  const t = useConverterToolLabels("dataUnit");
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState<DataUnit>("mb");
  const [to, setTo] = useState<DataUnit>("mbps");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (!Number.isFinite(v) || v < 0) return null;
    const bits = v * UNIT_BITS[from];
    return bits / UNIT_BITS[to];
  }, [value, from, to]);

  const units: DataUnit[] = ["bits", "bytes", "kb", "mb", "gb", "mbps", "gbps"];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.hint}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.value}</span>
          <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} className="input-field mt-1 w-full" dir="ltr" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.from}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value as DataUnit)} className="input-field mt-1 w-full">
            {units.map((u) => (
              <option key={u} value={u}>{t[LABEL_KEYS[u]]}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.to}</span>
          <select value={to} onChange={(e) => setTo(e.target.value as DataUnit)} className="input-field mt-1 w-full">
            {units.map((u) => (
              <option key={u} value={u}>{t[LABEL_KEYS[u]]}</option>
            ))}
          </select>
        </label>
      </div>
      {result != null ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400" dir="ltr">
            {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
