"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

type Sex = "male" | "female";
type UnitSystem = "metric" | "imperial";

const ACTIVITY_KEYS = ["sedentary", "light", "moderate", "active", "veryActive"] as const;
const ACTIVITY_VALUES = [1.2, 1.375, 1.55, 1.725, 1.9] as const;

function calcBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export default function CalorieCalculator() {
  const t = useCalcToolLabels("calorieCalculator");
  const [sex, setSex] = useState<Sex>("male");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("175");
  const [weightKg, setWeightKg] = useState("75");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [weightLbs, setWeightLbs] = useState("165");
  const [activityIndex, setActivityIndex] = useState(2);

  const activity = ACTIVITY_VALUES[activityIndex];

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
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.sex}</p>
          <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
            {(["male", "female"] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  sex === s
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {s === "male" ? t.male : t.female}
              </button>
            ))}
          </div>
        </div>
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
      </div>

      <div>
        <label htmlFor="cal-age" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.age}
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
              {t.heightCm}
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
              {t.weightKg}
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.heightFt}</label>
            <input
              type="number"
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.heightIn}</label>
            <input
              type="number"
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.weightLbs}</label>
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
          {t.activityLevel}
        </label>
        <select
          id="activity"
          value={activityIndex}
          onChange={(e) => setActivityIndex(Number(e.target.value))}
          className="input-field mt-1"
        >
          {ACTIVITY_KEYS.map((key, i) => (
            <option key={key} value={i}>
              {t.activities[key].label} — {t.activities[key].description}
            </option>
          ))}
        </select>
      </div>

      {result && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.bmr}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {result.bmr} {t.kcalDay}
            </p>
          </div>
          <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-950/40">
            <p className="text-xs text-primary-600 dark:text-primary-400">{t.maintain}</p>
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {result.maintain} {t.kcalDay}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.lose}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {result.lose} {t.kcalDay}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.gain}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {result.gain} {t.kcalDay}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">{t.disclaimer}</p>
    </div>
  );
}
