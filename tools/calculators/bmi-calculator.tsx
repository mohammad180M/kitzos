"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

type UnitSystem = "metric" | "imperial";

type BmiCategoryKey = "underweight" | "normal" | "overweight" | "obese";

function getBmiCategoryKey(bmi: number): BmiCategoryKey {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

const CATEGORY_COLORS: Record<BmiCategoryKey, string> = {
  underweight: "text-blue-600 dark:text-blue-400",
  normal: "text-green-600 dark:text-green-400",
  overweight: "text-amber-600 dark:text-amber-400",
  obese: "text-red-600 dark:text-red-400",
};

export default function BmiCalculator() {
  const t = useCalcToolLabels("bmiCalculator");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("70");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weightLbs, setWeightLbs] = useState("154");

  const result = useMemo(() => {
    let heightM = 0;
    let weightKgVal = 0;

    if (unitSystem === "metric") {
      const h = parseFloat(heightCm);
      const w = parseFloat(weightKg);
      if (!h || !w || h <= 0 || w <= 0) return null;
      heightM = h / 100;
      weightKgVal = w;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const lbs = parseFloat(weightLbs);
      const totalInches = ft * 12 + inches;
      if (!totalInches || !lbs || totalInches <= 0 || lbs <= 0) return null;
      heightM = totalInches * 0.0254;
      weightKgVal = lbs * 0.453592;
    }

    const bmi = weightKgVal / (heightM * heightM);
    if (!Number.isFinite(bmi)) return null;

    const key = getBmiCategoryKey(bmi);
    return { bmi, key };
  }, [unitSystem, heightCm, weightKg, heightFt, heightIn, weightLbs]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.units}</p>
        <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(["metric", "imperial"] as UnitSystem[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnitSystem(u)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                unitSystem === u
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {u === "metric" ? t.metric : t.imperial}
            </button>
          ))}
        </div>
      </div>

      {unitSystem === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="height-cm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.heightCm}
            </label>
            <input
              id="height-cm"
              type="number"
              min="1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="weight-kg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.weightKg}
            </label>
            <input
              id="weight-kg"
              type="number"
              min="1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="height-ft" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.heightFt}
            </label>
            <input
              id="height-ft"
              type="number"
              min="0"
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="height-in" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.heightIn}
            </label>
            <input
              id="height-in"
              type="number"
              min="0"
              max="11"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="weight-lbs" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.weightLbs}
            </label>
            <input
              id="weight-lbs"
              type="number"
              min="1"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>
      )}

      {result ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.yourBmi}</p>
          <p className="mt-1 text-4xl font-bold text-primary-600 dark:text-primary-400">
            {result.bmi.toFixed(1)}
          </p>
          <p className={`mt-2 text-lg font-semibold ${CATEGORY_COLORS[result.key]}`}>
            {t.categories[result.key].label}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t.categories[result.key].description}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.enterValid}</p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">{t.disclaimer}</p>
    </div>
  );
}
