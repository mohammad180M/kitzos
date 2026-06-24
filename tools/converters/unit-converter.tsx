"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

type Category = "length" | "weight" | "temperature" | "area" | "volume";

interface Unit {
  id: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const CATEGORIES: Record<Category, { label: string; units: Unit[] }> = {
  length: {
    label: "Length",
    units: [
      { id: "mm", label: "Millimeters (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "cm", label: "Centimeters (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: "m", label: "Meters (m)", toBase: (v) => v, fromBase: (v) => v },
      { id: "km", label: "Kilometers (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: "in", label: "Inches (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: "ft", label: "Feet (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: "yd", label: "Yards (yd)", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: "mi", label: "Miles (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ],
  },
  weight: {
    label: "Weight / Mass",
    units: [
      { id: "mg", label: "Milligrams (mg)", toBase: (v) => v / 1_000_000, fromBase: (v) => v * 1_000_000 },
      { id: "g", label: "Grams (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "kg", label: "Kilograms (kg)", toBase: (v) => v, fromBase: (v) => v },
      { id: "oz", label: "Ounces (oz)", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: "lb", label: "Pounds (lb)", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    ],
  },
  temperature: {
    label: "Temperature",
    units: [
      {
        id: "c",
        label: "Celsius (°C)",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "f",
        label: "Fahrenheit (°F)",
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        id: "k",
        label: "Kelvin (K)",
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  area: {
    label: "Area",
    units: [
      { id: "sqm", label: "Square meters (m²)", toBase: (v) => v, fromBase: (v) => v },
      { id: "sqft", label: "Square feet (ft²)", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: "acre", label: "Acres", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: "ha", label: "Hectares", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    ],
  },
  volume: {
    label: "Volume",
    units: [
      { id: "ml", label: "Milliliters (ml)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: "l", label: "Liters (L)", toBase: (v) => v, fromBase: (v) => v },
      { id: "floz", label: "Fluid ounces (US)", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
      { id: "cup", label: "Cups (US)", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: "gal", label: "Gallons (US)", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    ],
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [input, setInput] = useState("1");

  const units = CATEGORIES[category].units;

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
    const catUnits = CATEGORIES[cat].units;
    setFromUnit(catUnits[0].id);
    setToUnit(catUnits[1]?.id ?? catUnits[0].id);
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result !== null) setInput(String(result));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
        <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
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
              {CATEGORIES[cat].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label htmlFor="from-unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From
          </label>
          <select
            id="from-unit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="input-field mt-1"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-field mt-2"
            aria-label="Value to convert"
          />
        </div>

        <button
          type="button"
          onClick={swap}
          className="btn-secondary mx-auto h-10 w-10 shrink-0 rounded-full p-0 sm:mb-1"
          aria-label="Swap units"
        >
          <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" />
        </button>

        <div>
          <label htmlFor="to-unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To
          </label>
          <select
            id="to-unit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="input-field mt-1"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
          <div className="input-field mt-2 flex min-h-[42px] items-center bg-gray-50 font-mono text-sm dark:bg-gray-800/80">
            {result !== null
              ? result.toLocaleString(undefined, { maximumFractionDigits: 8 })
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
