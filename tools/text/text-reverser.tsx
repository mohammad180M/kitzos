"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

type ReverseMode = "whole" | "lines" | "words";

function reverseText(text: string, mode: ReverseMode): string {
  switch (mode) {
    case "whole":
      return Array.from(text).reverse().join("");
    case "lines":
      return text.split("\n").reverse().join("\n");
    case "words":
      return text.split(/(\s+)/).reverse().join("");
  }
}

export default function TextReverser() {
  const t = useTextToolLabels("textReverser");
  const [input, setInput] = useToolDraft("input", "");
  const [mode, setMode] = useState<ReverseMode>("whole");

  const output = useMemo(() => reverseText(input, mode), [input, mode]);

  const modes: { value: ReverseMode; label: string }[] = [
    { value: "whole", label: t.modeWhole },
    { value: "lines", label: t.modeLines },
    { value: "words", label: t.modeWords },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        {modes.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === value
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          rows={6}
          className="input-field mt-1 w-full resize-y"
        />
      </label>

      {input && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</span>
          <textarea
            value={output}
            readOnly
            rows={6}
            className="input-field mt-1 w-full resize-y bg-gray-50 dark:bg-gray-800/50"
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
