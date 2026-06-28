"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

type DistanceUnit = "km" | "mi";
type ConsumptionUnit = "l100" | "mpg";

export default function FuelCostCalculator() {
  const t = useCalcToolLabels("fuelCostCalculator");
  const [distance, setDistance] = useState("400");
  const [distUnit, setDistUnit] = useState<DistanceUnit>("km");
  const [consumption, setConsumption] = useState("8");
  const [consUnit, setConsUnit] = useState<ConsumptionUnit>("l100");
  const [price, setPrice] = useState("1.5");

  const result = useMemo(() => {
    const d = parseFloat(distance);
    const c = parseFloat(consumption);
    const p = parseFloat(price);
    if (!Number.isFinite(d) || d <= 0 || !Number.isFinite(c) || c <= 0 || !Number.isFinite(p) || p <= 0) return null;

    let distanceKm = distUnit === "km" ? d : d * 1.609344;
    let liters: number;
    if (consUnit === "l100") {
      liters = (distanceKm / 100) * c;
    } else {
      const distanceMi = distUnit === "mi" ? d : d / 1.609344;
      liters = (distanceMi / c) * 3.785411784;
    }

    return { liters, cost: liters * p };
  }, [distance, distUnit, consumption, consUnit, price]);

  const fmt = (n: number, digits = 2) => n.toLocaleString(undefined, { maximumFractionDigits: digits });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.distance}</span>
          <div className="mt-1 flex gap-2">
            <input type="number" min="0" value={distance} onChange={(e) => setDistance(e.target.value)} className="input-field flex-1" />
            <select value={distUnit} onChange={(e) => setDistUnit(e.target.value as DistanceUnit)} className="input-field w-28">
              <option value="km">{t.unitKm}</option>
              <option value="mi">{t.unitMi}</option>
            </select>
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.consumption}</span>
          <div className="mt-1 flex gap-2">
            <input type="number" min="0" step="0.1" value={consumption} onChange={(e) => setConsumption(e.target.value)} className="input-field flex-1" />
            <select value={consUnit} onChange={(e) => setConsUnit(e.target.value as ConsumptionUnit)} className="input-field w-32">
              <option value="l100">{t.unitL100}</option>
              <option value="mpg">{t.unitMpg}</option>
            </select>
          </div>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.price}</span>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field mt-1 w-full" />
        </label>
      </div>
      {result ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.totalFuel}</p>
            <p className="text-xl font-bold">{fmt(result.liters)} L</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.totalCost}</p>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{fmt(result.cost)}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
