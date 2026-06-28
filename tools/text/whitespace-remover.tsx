"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

function cleanWhitespace(
  text: string,
  opts: { trimLines: boolean; collapseSpaces: boolean; removeBlankLines: boolean }
): string {
  let result = text;

  if (opts.collapseSpaces) {
    result = result.replace(/[^\S\n]+/g, " ");
  }

  let lines = result.split("\n");

  if (opts.trimLines) {
    lines = lines.map((line) => line.trim());
  }

  if (opts.removeBlankLines) {
    const collapsed: string[] = [];
    let prevBlank = false;
    for (const line of lines) {
      const blank = line.trim() === "";
      if (blank) {
        if (!prevBlank) collapsed.push("");
        prevBlank = true;
      } else {
        collapsed.push(line);
        prevBlank = false;
      }
    }
    lines = collapsed;
  }

  return lines.join("\n");
}

export default function WhitespaceRemover() {
  const t = useTextToolLabels("whitespaceRemover");
  const [input, setInput] = useToolDraft("input", "");
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(true);

  const output = useMemo(
    () => cleanWhitespace(input, { trimLines, collapseSpaces, removeBlankLines }),
    [input, trimLines, collapseSpaces, removeBlankLines]
  );

  const changed = input !== output;

  const options = [
    { checked: trimLines, onChange: setTrimLines, label: t.trimLines },
    { checked: collapseSpaces, onChange: setCollapseSpaces, label: t.collapseSpaces },
    { checked: removeBlankLines, onChange: setRemoveBlankLines, label: t.removeBlankLines },
  ] as const;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          rows={8}
          className="input-field mt-1 w-full resize-y"
        />
      </label>

      <fieldset className="space-y-2">
        {options.map(({ checked, onChange, label }) => (
          <label key={label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</span>
        <textarea
          value={output}
          readOnly
          rows={8}
          className="input-field mt-1 w-full resize-y bg-gray-50 dark:bg-gray-800/50"
        />
        {input.length > 0 && !changed && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.noChange}</p>
        )}
        <CopyButton text={output} className="mt-2" disabled={!output} />
      </div>
    </div>
  );
}
