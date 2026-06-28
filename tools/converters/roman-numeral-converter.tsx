"use client";

import { useMemo, useState } from "react";
import { intToRoman, romanToInt } from "@/lib/roman-numerals";
import { useConverterToolLabels } from "@/lib/i18n/use-converter-tool-labels";

type Mode = "to-roman" | "to-arabic";

export default function RomanNumeralConverter() {
  const t = useConverterToolLabels("romanNumeral");
  const [mode, setMode] = useState<Mode>("to-roman");
  const [input, setInput] = useState("2026");

  const result = useMemo(() => {
    if (mode === "to-roman") {
      const n = parseInt(input, 10);
      if (!Number.isFinite(n)) return null;
      return intToRoman(n);
    }
    return romanToInt(input)?.toString() ?? null;
  }, [mode, input]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        {(["to-roman", "to-arabic"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {m === "to-roman" ? t.modeArabic : t.modeRoman}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "to-roman" ? t.placeholderNum : t.placeholderRoman}
          className="input-field mt-1 w-full font-mono"
          dir="ltr"
        />
      </label>
      {result != null ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400" dir="ltr">{result}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
