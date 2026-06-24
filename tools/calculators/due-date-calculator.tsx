"use client";

import { useMemo, useState } from "react";

const PREGNANCY_DAYS = 280;

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default function DueDateCalculator() {
  const [lmp, setLmp] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().slice(0, 10);
  });

  const result = useMemo(() => {
    if (!lmp) return null;
    const lmpDate = new Date(lmp + "T00:00:00");
    if (isNaN(lmpDate.getTime())) return null;

    const dueDate = addDays(lmpDate, PREGNANCY_DAYS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysSinceLmp = daysBetween(lmpDate, today);
    const pregnancyWeek = Math.floor(daysSinceLmp / 7);
    const pregnancyDay = daysSinceLmp % 7;
    const daysUntilDue = daysBetween(today, dueDate);

    return {
      dueDate,
      pregnancyWeek: Math.max(0, pregnancyWeek),
      pregnancyDay: Math.max(0, pregnancyDay),
      daysUntilDue,
      isPastDue: daysUntilDue < 0,
    };
  }, [lmp]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lmp-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          First day of last menstrual period (LMP)
        </label>
        <input
          id="lmp-date"
          type="date"
          value={lmp}
          onChange={(e) => setLmp(e.target.value)}
          className="input-field mt-1"
        />
      </div>

      {result && (
        <div className="space-y-3">
          <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-4 dark:border-primary-800 dark:bg-primary-950/40">
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Estimated due date</p>
            <p className="mt-1 text-xl font-bold text-primary-800 dark:text-primary-200">
              {formatDate(result.dueDate)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Current pregnancy week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Week {result.pregnancyWeek}
                {result.pregnancyDay > 0 && ` + ${result.pregnancyDay} day${result.pregnancyDay !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {result.isPastDue ? "Days past due date" : "Days until due date"}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.abs(result.daysUntilDue)} days
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Based on Naegele&apos;s rule (LMP + 280 days). This is an estimate only — ultrasound dating by a
        healthcare provider is more accurate. Not medical advice.
      </p>
    </div>
  );
}
