"use client";

import { useMemo, useState } from "react";
import { describeCron } from "@/lib/cron-describe";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

export default function CronExpressionParser() {
  const t = useDevToolsExtraLabels("cronExpressionParser");
  const [input, setInput] = useState("0 9 * * 1");

  const description = useMemo(() => describeCron(input), [input]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.hint}</p>
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
      {description ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
          <p className="mt-1 text-base text-gray-900 dark:text-gray-100" dir="ltr">
            {description}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
    </div>
  );
}
