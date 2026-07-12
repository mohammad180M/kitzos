"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/routing";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";

type Category = "length" | "weight" | "area" | "volume";

interface UnitDef {
  id: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNIT_DEFS: Record<Category, UnitDef[]> = {
  length: [
    { id: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { id: "m", toBase: (v) => v, fromBase: (v) => v },
    { id: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { id: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { id: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  ],
  weight: [
    { id: "mg", toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
    { id: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: "kg", toBase: (v) => v, fromBase: (v) => v },
    { id: "oz", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { id: "lb", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
  ],
  area: [
    { id: "sqm", toBase: (v) => v, fromBase: (v) => v },
    { id: "sqft", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    { id: "acre", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    { id: "ha", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  ],
  volume: [
    { id: "ml", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: "l", toBase: (v) => v, fromBase: (v) => v },
    { id: "floz", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    { id: "cup", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    { id: "gal", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
  ],
};

export default function UnitConverter() {
  const t = useConverterToolLabels("unitConverter");
  const { locale } = useLocale();
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [input, setInput] = useState("1");

  const units = UNIT_DEFS[category];

  const result = useMemo(() => {
    const value = parseFloat(input);
    if (isNaN(value)) return null;

    const from = units.find((u) => u.id === fromUnit);
    const to = units.find((u) => u.id === toUnit);
    if (!from || !to) return null;

    const base = from.toBase(value);
    const converted = to.fromBase(base);
    if (!Number.isFinite(converted)) return null;

    return converted;
  }, [input, fromUnit, toUnit, units]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const catUnits = UNIT_DEFS[cat];
    setFromUnit(catUnits[0].id);
    setToUnit(catUnits[1]?.id ?? catUnits[0].id);
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result !== null) setInput(String(result));
  };

  const unitLabel = (id: string) => t.units[id as keyof typeof t.units] ?? id;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.category}</p>
        <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(Object.keys(UNIT_DEFS) as Category[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {t.categories[cat]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href={localizedPath(locale, "/tools/temperature-converter")}
            className="text-primary-600 hover:underline dark:text-primary-400"
          >
            {t.temperatureLink}
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label htmlFor="from-unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.from}
          </label>
          <select
            id="from-unit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="input-field mt-1"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {unitLabel(u.id)}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-field mt-2"
            aria-label={t.valueToConvert}
          />
        </div>

        <button
          type="button"
          onClick={swap}
          className="btn-secondary mx-auto h-10 w-10 shrink-0 rounded-full p-0 sm:mb-1"
          aria-label={t.swap}
        >
          <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
        </button>

        <div>
          <label htmlFor="to-unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.to}
          </label>
          <select
            id="to-unit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="input-field mt-1"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {unitLabel(u.id)}
              </option>
            ))}
          </select>
          <div className="input-field ltr-input mt-2 flex min-h-[42px] items-center bg-gray-50 font-mono text-sm dark:bg-gray-800/80">
            {result !== null
              ? result.toLocaleString(undefined, { maximumFractionDigits: 8 })
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
