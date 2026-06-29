"use client";

import { useMemo, useState, useEffect } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

function diffAge(birth: Date, ref: Date) {
  let years = ref.getFullYear() - birth.getFullYear();
  let months = ref.getMonth() - birth.getMonth();
  let days = ref.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msPerDay = 86400000;
  const totalDays = Math.floor((ref.getTime() - birth.getTime()) / msPerDay);

  let next = new Date(ref.getFullYear(), birth.getMonth(), birth.getDate());
  if (next <= ref) next = new Date(ref.getFullYear() + 1, birth.getMonth(), birth.getDate());
  const daysUntilBirthday = Math.ceil((next.getTime() - ref.getTime()) / msPerDay);

  return { years, months, days, totalDays, daysUntilBirthday };
}

export default function AgeCalculator() {
  const t = useCalcToolLabels("ageCalculator");
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [asOfDate, setAsOfDate] = useState("");

  useEffect(() => {
    setAsOfDate(new Date().toISOString().slice(0, 10));
  }, []);

  const result = useMemo(() => {
    const birth = new Date(birthDate + "T12:00:00");
    const ref = new Date(asOfDate + "T12:00:00");
    if (isNaN(birth.getTime()) || isNaN(ref.getTime()) || birth > ref) return null;
    return diffAge(birth, ref);
  }, [birthDate, asOfDate]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.birthDate}</span>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input-field mt-1 w-full" max={asOfDate} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.asOfDate}</span>
          <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} className="input-field mt-1 w-full" />
        </label>
      </div>
      <button
        type="button"
        onClick={() => setAsOfDate(new Date().toISOString().slice(0, 10))}
        className="btn-secondary text-sm"
      >
        {t.useToday}
      </button>
      {result ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: t.years, value: result.years },
            { label: t.months, value: result.months },
            { label: t.days, value: result.days },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            </div>
          ))}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50 sm:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.totalDays}</p>
            <p className="text-lg font-semibold">{result.totalDays.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.nextBirthday}</p>
            <p className="text-lg font-semibold">{result.daysUntilBirthday}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
