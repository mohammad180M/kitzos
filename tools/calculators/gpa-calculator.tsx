"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

const GRADE_POINTS: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };

interface CourseRow {
  id: string;
  credits: string;
  grade: keyof typeof GRADE_POINTS;
}

let rowId = 0;
function newRow(): CourseRow {
  return { id: String(++rowId), credits: "3", grade: "A" };
}

export default function GpaCalculator() {
  const t = useCalcToolLabels("gpaCalculator");
  const [rows, setRows] = useState<CourseRow[]>([newRow(), newRow()]);

  const result = useMemo(() => {
    let points = 0;
    let credits = 0;
    for (const row of rows) {
      const c = parseFloat(row.credits);
      if (!Number.isFinite(c) || c <= 0) continue;
      points += c * GRADE_POINTS[row.grade];
      credits += c;
    }
    if (credits <= 0) return null;
    return { gpa: points / credits, credits };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <span className="hidden self-center text-sm text-gray-500 sm:block">{t.course} {i + 1}</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={row.credits}
              onChange={(e) => setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, credits: e.target.value } : r)))}
              className="input-field"
              placeholder={t.credits}
            />
            <select
              value={row.grade}
              onChange={(e) => setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, grade: e.target.value as CourseRow["grade"] } : r)))}
              className="input-field"
            >
              {(Object.keys(GRADE_POINTS) as Array<keyof typeof GRADE_POINTS>).map((g) => (
                <option key={g} value={g}>{t.grades[g as keyof typeof t.grades]}</option>
              ))}
            </select>
            <button type="button" onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))} className="btn-secondary px-2 text-xs" disabled={rows.length <= 1}>{t.remove}</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows((prev) => [...prev, newRow()])} className="btn-secondary text-sm">{t.addCourse}</button>
      {result ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.gpa}</p>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">{result.gpa.toFixed(2)}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t.totalCredits}: {result.credits}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
