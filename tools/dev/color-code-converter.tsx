"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { computeColorValues, parseColorInput } from "@/lib/color-convert";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

export default function ColorCodeConverter() {
  const t = useDevToolsExtraLabels("colorCodeConverter");
  const [input, setInput] = useState("#3B82F6");

  const values = useMemo(() => {
    const rgb = parseColorInput(input);
    if (!rgb) return null;
    return computeColorValues(rgb);
  }, [input]);

  const rows = values
    ? [
        { key: "hex", label: t.hex, value: values.hex },
        { key: "rgb", label: t.rgb, value: values.rgb },
        { key: "hsl", label: t.hsl, value: values.hsl },
        { key: "hsv", label: t.hsv, value: values.hsv },
      ]
    : [];

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="input-field ltr-input mt-1 w-full font-mono"
          dir="ltr"
          spellCheck={false}
        />
      </label>
      {values ? (
        <>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.preview}</p>
            <div
              className="mt-2 h-16 rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: values.hex }}
              aria-hidden="true"
            />
          </div>
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{row.label}</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm text-gray-900 dark:text-gray-100" dir="ltr">
                    {row.value}
                  </code>
                  <CopyButton text={row.value} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
