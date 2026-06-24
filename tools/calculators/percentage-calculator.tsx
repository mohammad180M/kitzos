"use client";

import { useMemo, useState } from "react";

type Mode = "percent-of" | "what-percent" | "change";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("percent-of");
  const [a, setA] = useState("20");
  const [b, setB] = useState("150");

  const result = useMemo(() => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return null;

    switch (mode) {
      case "percent-of":
        if (numB === 0) return null;
        return { text: `${numA}% of ${numB} = ${((numA / 100) * numB).toLocaleString(undefined, { maximumFractionDigits: 4 })}` };
      case "what-percent":
        if (numB === 0) return null;
        return { text: `${numA} is ${((numA / numB) * 100).toLocaleString(undefined, { maximumFractionDigits: 4 })}% of ${numB}` };
      case "change": {
        if (numA === 0) return null;
        const change = ((numB - numA) / numA) * 100;
        const direction = change >= 0 ? "increase" : "decrease";
        return {
          text: `From ${numA} to ${numB} is a ${Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 4 })}% ${direction}`,
        };
      }
      default:
        return null;
    }
  }, [mode, a, b]);

  const labels: Record<Mode, { a: string; b: string }> = {
    "percent-of": { a: "Percentage (%)", b: "Of number" },
    "what-percent": { a: "Value", b: "Of total" },
    change: { a: "Original value", b: "New value" },
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode</p>
        <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setMode("percent-of")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "percent-of"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            X% of Y
          </button>
          <button
            type="button"
            onClick={() => setMode("what-percent")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "what-percent"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            X is ?% of Y
          </button>
          <button
            type="button"
            onClick={() => setMode("change")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "change"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            % change
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pct-a" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {labels[mode].a}
          </label>
          <input
            id="pct-a"
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label htmlFor="pct-b" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {labels[mode].b}
          </label>
          <input
            id="pct-b"
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="input-field mt-1"
          />
        </div>
      </div>

      {result ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{result.text}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Enter valid numbers to calculate.</p>
      )}
    </div>
  );
}
