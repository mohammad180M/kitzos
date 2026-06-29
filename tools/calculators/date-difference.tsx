"use client";

import { useMemo, useState, useEffect } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function diffParts(from: Date, to: Date) {
  const totalDays = Math.abs(daysBetween(from, to));
  const sign = to >= from ? 1 : -1;

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return {
    totalDays: totalDays * sign,
    absDays: totalDays,
    weeks: Math.floor(totalDays / 7),
    years: Math.abs(years),
    months: Math.abs(months),
    days: Math.abs(days),
    direction: sign >= 0 ? "after" : "before",
  };
}

export default function DateDifference() {
  const t = useCalcToolLabels("dateDifference");
  const [dateA, setDateA] = useState("2024-01-01");
  const [dateB, setDateB] = useState("");
  const [singleDate, setSingleDate] = useState("");

  useEffect(() => {
    const today = new Date();
    setDateB(today.toISOString().slice(0, 10));
    const future = new Date(today);
    future.setMonth(future.getMonth() + 3);
    setSingleDate(future.toISOString().slice(0, 10));
  }, []);

  const between = useMemo(() => {
    const a = parseDate(dateA);
    const b = parseDate(dateB);
    if (!a || !b) return null;
    return diffParts(a, b);
  }, [dateA, dateB]);

  const relative = useMemo(() => {
    const target = parseDate(singleDate);
    if (!target) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = daysBetween(today, target);
    return {
      diff,
      label: diff > 0 ? t.daysUntil : diff < 0 ? t.daysSince : t.today,
      abs: Math.abs(diff),
    };
  }, [singleDate, t]);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.sectionBetween}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date-a" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.startDate}
            </label>
            <input
              id="date-a"
              type="date"
              value={dateA}
              onChange={(e) => setDateA(e.target.value)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="date-b" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.endDate}
            </label>
            <input
              id="date-b"
              type="date"
              value={dateB}
              onChange={(e) => setDateB(e.target.value)}
              className="input-field mt-1"
            />
          </div>
        </div>

        {between && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-950/40">
              <p className="text-xs text-primary-600 dark:text-primary-400">{t.totalDays}</p>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{between.totalDays}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.weeks}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{between.weeks}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.monthsApprox}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t.monthsApproxDisplay(between.years, between.months)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.yearsDays}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t.yearsDaysDisplay(between.years, between.days)}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.sectionRelative}</h3>
        <div>
          <label htmlFor="single-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.targetDate}
          </label>
          <input
            id="single-date"
            type="date"
            value={singleDate}
            onChange={(e) => setSingleDate(e.target.value)}
            className="input-field mt-1"
          />
        </div>
        {relative && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{relative.label}</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {relative.diff === 0 ? "—" : t.daysSuffix(relative.abs)}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
