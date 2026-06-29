"use client";

import { useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

type TermUnit = "years" | "months";

/** Standard fixed-rate amortization: M = P * r(1+r)^n / ((1+r)^n - 1) */
function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export default function LoanCalculator() {
  const t = useCalcToolLabels("loanCalculator");
  const [amount, setAmount] = useState("250000");
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState("30");
  const [termUnit, setTermUnit] = useState<TermUnit>("years");

  const result = useMemo(() => {
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const termVal = parseFloat(term);

    if (!Number.isFinite(principal) || principal <= 0) return null;
    if (!Number.isFinite(annualRate) || annualRate < 0) return null;
    if (!Number.isFinite(termVal) || termVal <= 0) return null;

    const months = Math.round(termUnit === "years" ? termVal * 12 : termVal);
    if (months < 1) return null;

    const payment = monthlyPayment(principal, annualRate, months);
    if (!Number.isFinite(payment) || payment <= 0) return null;

    const totalPaid = payment * months;
    const totalInterest = totalPaid - principal;

    return {
      payment,
      totalPaid,
      totalInterest,
      months,
    };
  }, [amount, rate, term, termUnit]);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const termUnits: { value: TermUnit; label: string }[] = [
    { value: "years", label: t.years },
    { value: "months", label: t.months },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="loan-amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.loanAmount}
        </label>
        <input
          id="loan-amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field mt-1"
        />
      </div>

      <div>
        <label htmlFor="loan-rate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.annualRate}
        </label>
        <input
          id="loan-rate"
          type="number"
          min="0"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="input-field mt-1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="loan-term" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.loanTerm}
          </label>
          <input
            id="loan-term"
            type="number"
            min="1"
            step="1"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="input-field mt-1"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.termUnit}</p>
          <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
            {termUnits.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTermUnit(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  termUnit === value
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-950/40">
            <p className="text-xs text-primary-600 dark:text-primary-400">{t.monthlyPayment}</p>
            <p className="text-xl font-bold text-primary-700 dark:text-primary-300">
              {fmt(result.payment)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalInterest}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {fmt(result.totalInterest)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalPaid}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {fmt(result.totalPaid)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">{t.disclaimer}</p>
    </div>
  );
}
