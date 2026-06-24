"use client";

import { useMemo, useState } from "react";

type UnitSystem = "metric" | "imperial";

type BmiCategory = {
  label: string;
  description: string;
  color: string;
};

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      description: "Below the healthy range for most adults.",
      color: "text-blue-600 dark:text-blue-400",
    };
  }
  if (bmi < 25) {
    return {
      label: "Normal",
      description: "Within the healthy BMI range for most adults.",
      color: "text-green-600 dark:text-green-400",
    };
  }
  if (bmi < 30) {
    return {
      label: "Overweight",
      description: "Above the healthy range for most adults.",
      color: "text-amber-600 dark:text-amber-400",
    };
  }
  return {
    label: "Obese",
    description: "Well above the healthy range for most adults.",
    color: "text-red-600 dark:text-red-400",
  };
}

export default function BmiCalculator() {
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

    return { bmi, category: getBmiCategory(bmi) };
  }, [unitSystem, heightCm, weightKg, heightFt, heightIn, weightLbs]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Units</p>
        <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(["metric", "imperial"] as UnitSystem[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnitSystem(u)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                unitSystem === u
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {unitSystem === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="height-cm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Height (cm)
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
              Weight (kg)
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
              Height (ft)
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
              Height (in)
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
              Weight (lbs)
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
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your BMI</p>
          <p className="mt-1 text-4xl font-bold text-primary-600 dark:text-primary-400">
            {result.bmi.toFixed(1)}
          </p>
          <p className={`mt-2 text-lg font-semibold ${result.category.color}`}>
            {result.category.label}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{result.category.description}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter valid height and weight to calculate BMI.
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        BMI is a screening tool, not a diagnosis. Consult a healthcare provider for personal health advice.
      </p>
    </div>
  );
}
