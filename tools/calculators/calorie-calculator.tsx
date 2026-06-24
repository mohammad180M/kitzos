"use client";

import { useMemo, useState } from "react";

type Sex = "male" | "female";
type UnitSystem = "metric" | "imperial";

const ACTIVITY_LEVELS = [
  { value: 1.2, label: "Sedentary", description: "Little or no exercise" },
  { value: 1.375, label: "Light", description: "Exercise 1–3 days/week" },
  { value: 1.55, label: "Moderate", description: "Exercise 3–5 days/week" },
  { value: 1.725, label: "Active", description: "Exercise 6–7 days/week" },
  { value: 1.9, label: "Very active", description: "Hard exercise or physical job" },
] as const;

function calcBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export default function CalorieCalculator() {
  const [sex, setSex] = useState<Sex>("male");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("75");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [weightLbs, setWeightLbs] = useState("165");
  const [activity, setActivity] = useState(1.55);

  const result = useMemo(() => {
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 10 || ageNum > 120) return null;

    let heightCmVal = 0;
    let weightKgVal = 0;

    if (unitSystem === "metric") {
      heightCmVal = parseFloat(heightCm);
      weightKgVal = parseFloat(weightKg);
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const totalInches = ft * 12 + inches;
      heightCmVal = totalInches * 2.54;
      weightKgVal = (parseFloat(weightLbs) || 0) * 0.453592;
    }

    if (!heightCmVal || !weightKgVal || heightCmVal <= 0 || weightKgVal <= 0) return null;

    const bmr = calcBmr(sex, weightKgVal, heightCmVal, ageNum);
    const tdee = bmr * activity;
    if (!Number.isFinite(tdee)) return null;

    return {
      bmr: Math.round(bmr),
      maintain: Math.round(tdee),
      lose: Math.round(tdee - 500),
      gain: Math.round(tdee + 500),
    };
  }, [sex, unitSystem, age, heightCm, weightKg, heightFt, heightIn, weightLbs, activity]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sex</p>
          <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
            {(["male", "female"] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  sex === s
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
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
      </div>

      <div>
        <label htmlFor="cal-age" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Age (years)
        </label>
        <input
          id="cal-age"
          type="number"
          min="10"
          max="120"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="input-field mt-1"
        />
      </div>

      {unitSystem === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cal-height" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Height (cm)
            </label>
            <input
              id="cal-height"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="cal-weight" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Weight (kg)
            </label>
            <input
              id="cal-weight"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Height (ft)</label>
            <input
              type="number"
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Height (in)</label>
            <input
              type="number"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weight (lbs)</label>
            <input
              type="number"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="activity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Activity level
        </label>
        <select
          id="activity"
          value={activity}
          onChange={(e) => setActivity(parseFloat(e.target.value))}
          className="input-field mt-1"
        >
          {ACTIVITY_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label} — {level.description}
            </option>
          ))}
        </select>
      </div>

      {result && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">BMR (basal metabolic rate)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.bmr} kcal/day</p>
          </div>
          <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-950/40">
            <p className="text-xs text-primary-600 dark:text-primary-400">Maintain weight</p>
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{result.maintain} kcal/day</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Lose ~0.5 kg/week</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.lose} kcal/day</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">Gain ~0.5 kg/week</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.gain} kcal/day</p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Uses the Mifflin-St Jeor equation. Results are estimates — individual needs vary.
      </p>
    </div>
  );
}
