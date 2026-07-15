"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

type UnitSystem = "metric" | "imperial";
type BmiCategoryKey = "underweight" | "normal" | "overweight" | "obese";

/** Visual scale bounds for the thermometer (not clinical cutoffs). */
const GAUGE_MIN = 12;
const GAUGE_MAX = 40;

const ZONES: Array<{ key: BmiCategoryKey; from: number; to: number; bar: string }> = [
  { key: "underweight", from: GAUGE_MIN, to: 18.5, bar: "bg-sky-500" },
  { key: "normal", from: 18.5, to: 25, bar: "bg-emerald-500" },
  { key: "overweight", from: 25, to: 30, bar: "bg-amber-500" },
  { key: "obese", from: 30, to: GAUGE_MAX, bar: "bg-red-500" },
];

function getBmiCategoryKey(bmi: number): BmiCategoryKey {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

const CATEGORY_COLORS: Record<BmiCategoryKey, string> = {
  underweight: "text-sky-600 dark:text-sky-400",
  normal: "text-emerald-600 dark:text-emerald-400",
  overweight: "text-amber-600 dark:text-amber-400",
  obese: "text-red-600 dark:text-red-400",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** 0 = bottom (low BMI), 100 = top (high BMI). */
function bmiToGaugePct(bmi: number): number {
  const span = GAUGE_MAX - GAUGE_MIN;
  return ((clamp(bmi, GAUGE_MIN, GAUGE_MAX) - GAUGE_MIN) / span) * 100;
}

function BmiGauge({
  bmi,
  categoryLabels,
}: {
  bmi: number;
  categoryLabels: Record<BmiCategoryKey, string>;
}) {
  const markerPct = bmiToGaugePct(bmi);
  const span = GAUGE_MAX - GAUGE_MIN;

  return (
    <div className="flex h-40 shrink-0 items-stretch gap-2 sm:h-44" dir="ltr" aria-hidden="true">
      <div className="relative w-5 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface)]">
        <div className="absolute inset-0 flex flex-col-reverse">
          {ZONES.map((z) => {
            const h = ((z.to - z.from) / span) * 100;
            return (
              <div
                key={z.key}
                className={`${z.bar} w-full opacity-90`}
                style={{ height: `${h}%` }}
                title={`${categoryLabels[z.key]} (${z.from}–${z.to === GAUGE_MAX ? "40+" : z.to})`}
              />
            );
          })}
        </div>
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2"
          style={{ bottom: `calc(${markerPct}% - 6px)` }}
        >
          <div className="h-3 w-3 rounded-full border-2 border-white bg-[var(--text)] shadow-md ring-1 ring-black/20" />
        </div>
      </div>

      <div className="flex w-[4.5rem] flex-col-reverse text-[10px] leading-tight text-[var(--muted)] sm:w-24 sm:text-xs">
        {ZONES.map((z) => {
          const h = ((z.to - z.from) / span) * 100;
          return (
            <div
              key={z.key}
              className="flex items-center truncate ps-0.5"
              style={{ height: `${h}%` }}
            >
              {categoryLabels[z.key]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  const categoryLabels = {
    underweight: t.categories.underweight.label,
    normal: t.categories.normal.label,
    overweight: t.categories.overweight.label,
    obese: t.categories.obese.label,
  };

  const unitBtn = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-[var(--cat-calc)] text-white"
        : "text-[var(--muted)] hover:text-[var(--text)]"
    }`;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[var(--text)]">{t.units}</p>
        <div className="mt-2 inline-flex rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5">
          {(["metric", "imperial"] as UnitSystem[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnitSystem(u)}
              className={unitBtn(unitSystem === u)}
            >
              {u === "metric" ? t.metric : t.imperial}
            </button>
          ))}
        </div>
      </div>

      {unitSystem === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="height-cm" className="text-sm font-medium text-[var(--text)]">
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
            <label htmlFor="weight-kg" className="text-sm font-medium text-[var(--text)]">
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
            <label htmlFor="height-ft" className="text-sm font-medium text-[var(--text)]">
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
            <label htmlFor="height-in" className="text-sm font-medium text-[var(--text)]">
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
            <label htmlFor="weight-lbs" className="text-sm font-medium text-[var(--text)]">
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
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-5">
          <div
            className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between"
            dir="ltr"
          >
            <div className="min-w-0 flex-1 text-center sm:ps-0 sm:text-start">
              <p className="text-sm font-medium text-[var(--muted)]">{t.yourBmi}</p>
              <p className="mt-1 text-4xl font-bold text-[var(--cat-calc)]">
                {result.bmi.toFixed(1)}
              </p>
              <p className={`mt-2 text-lg font-semibold ${CATEGORY_COLORS[result.key]}`} dir="auto">
                {t.categories[result.key].label}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]" dir="auto">
                {t.categories[result.key].description}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 sm:items-start">
              <p className="text-xs font-medium text-[var(--muted)]" dir="auto">
                {t.gaugeLabel}
              </p>
              <BmiGauge bmi={result.bmi} categoryLabels={categoryLabels} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">{t.enterValid}</p>
      )}

      <p className="text-xs text-[var(--muted)]">{t.disclaimer}</p>
    </div>
  );
}
