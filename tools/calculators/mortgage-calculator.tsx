"use client";

import { useMemo, useState } from "react";
import { buildAmortizationSchedule, mortgagePayment } from "@/lib/finance-calc";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

export default function MortgageCalculator() {
  const t = useCalcToolLabels("mortgageCalculator");
  const [homePrice, setHomePrice] = useState("350000");
  const [downPct, setDownPct] = useState("20");
  const [rate, setRate] = useState("6.5");
  const [termYears, setTermYears] = useState("30");

  const result = useMemo(() => {
    const price = parseFloat(homePrice);
    const down = parseFloat(downPct);
    const r = parseFloat(rate);
    const years = parseFloat(termYears);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(down) || down < 0 || down >= 100) return null;
    if (!Number.isFinite(r) || r < 0 || !Number.isFinite(years) || years <= 0) return null;

    const loan = price * (1 - down / 100);
    const months = Math.round(years * 12);
    const payment = mortgagePayment(loan, r, months);
    if (!Number.isFinite(payment) || payment <= 0) return null;

    const totalPaid = payment * months;
    const schedule = buildAmortizationSchedule(loan, r, months, 24);

    return { loan, payment, totalInterest: totalPaid - loan, totalPaid, schedule };
  }, [homePrice, downPct, rate, termYears]);

  const fmt = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.homePrice}</span>
          <input type="number" min="0" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.downPayment}</span>
          <input type="number" min="0" max="99" value={downPct} onChange={(e) => setDownPct(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.rate}</span>
          <input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.termYears}</span>
          <input type="number" min="1" max="40" value={termYears} onChange={(e) => setTermYears(e.target.value)} className="input-field mt-1 w-full" />
        </label>
      </div>
      {result ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t.loanAmount, value: fmt(result.loan) },
              { label: t.monthlyPayment, value: fmt(result.payment) },
              { label: t.totalInterest, value: fmt(result.totalInterest) },
              { label: t.totalCost, value: fmt(result.totalPaid) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{value}</p>
              </div>
            ))}
          </div>
          {result.schedule.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-800/50">{t.schedule}</p>
              <table className="w-full min-w-[480px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-2">{t.month}</th>
                    <th className="px-3 py-2">{t.payment}</th>
                    <th className="px-3 py-2">{t.principal}</th>
                    <th className="px-3 py-2">{t.interest}</th>
                    <th className="px-3 py-2">{t.balance}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.month} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-1.5">{row.month}</td>
                      <td className="px-3 py-1.5">{fmt(row.payment)}</td>
                      <td className="px-3 py-1.5">{fmt(row.principal)}</td>
                      <td className="px-3 py-1.5">{fmt(row.interest)}</td>
                      <td className="px-3 py-1.5">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
