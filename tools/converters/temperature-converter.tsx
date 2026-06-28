"use client";

import { useMemo, useState } from "react";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";

type TempUnit = "c" | "f" | "k";

function toCelsius(v: number, from: TempUnit): number {
  if (from === "c") return v;
  if (from === "f") return ((v - 32) * 5) / 9;
  return v - 273.15;
}

function fromCelsius(c: number, to: TempUnit): number {
  if (to === "c") return c;
  if (to === "f") return (c * 9) / 5 + 32;
  return c + 273.15;
}

export default function TemperatureConverter() {
  const t = useConverterToolLabels("temperature");
  const [value, setValue] = useState("25");
  const [from, setFrom] = useState<TempUnit>("c");
  const [to, setTo] = useState<TempUnit>("f");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (!Number.isFinite(v)) return null;
    if (from === "k" && v < 0) return null;
    const c = toCelsius(v, from);
    if (to === "k" && c < -273.15) return null;
    return fromCelsius(c, to);
  }, [value, from, to]);

  const note = from === "c" ? t.noteC : from === "f" ? t.noteF : t.noteK;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.value}</span>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="input-field mt-1 w-full" dir="ltr" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.from}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value as TempUnit)} className="input-field mt-1 w-full">
            <option value="c">{t.celsius}</option>
            <option value="f">{t.fahrenheit}</option>
            <option value="k">{t.kelvin}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.to}</span>
          <select value={to} onChange={(e) => setTo(e.target.value as TempUnit)} className="input-field mt-1 w-full">
            <option value="c">{t.celsius}</option>
            <option value="f">{t.fahrenheit}</option>
            <option value="k">{t.kelvin}</option>
          </select>
        </label>
      </div>
      {result != null ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400" dir="ltr">
            {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            {to === "c" ? " °C" : to === "f" ? " °F" : " K"}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{note}</p>
    </div>
  );
}
