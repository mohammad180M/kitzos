"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";
import { cleanWhitespace, countLines } from "@/lib/text/clean-whitespace";

export default function RemoveLineBreaks() {
  const t = useTextToolLabels("removeLineBreaks");
  const [input, setInput] = useToolDraft("input", "");
  const [removeLineBreaks, setRemoveLineBreaks] = useState(true);
  const [joinWithSpace, setJoinWithSpace] = useState(false);
  const [collapseSpaces, setCollapseSpaces] = useState(false);
  const [removeBlankLines, setRemoveBlankLines] = useState(false);
  const [trimLines, setTrimLines] = useState(false);

  const output = useMemo(
    () =>
      cleanWhitespace(input, {
        removeLineBreaks,
        joinWithSpace,
        collapseSpaces,
        removeBlankLines,
        trimLines,
      }),
    [input, removeLineBreaks, joinWithSpace, collapseSpaces, removeBlankLines, trimLines]
  );

  const inputChars = input.length;
  const inputLines = countLines(input);
  const outputChars = output.length;
  const outputLines = countLines(output);

  const toggles = [
    {
      checked: collapseSpaces,
      onChange: setCollapseSpaces,
      label: t.collapseSpaces,
    },
    {
      checked: removeBlankLines,
      onChange: setRemoveBlankLines,
      label: t.removeBlankLines,
    },
    {
      checked: trimLines,
      onChange: setTrimLines,
      label: t.trimLines,
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label htmlFor="line-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.input}
          </label>
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {t.statsBefore(inputChars, inputLines)}
          </span>
        </div>
        <textarea
          id="line-input"
          dir="auto"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={t.placeholder}
          className="input-field mt-1 resize-y text-sm"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.options}</legend>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={removeLineBreaks}
              onChange={(e) => setRemoveLineBreaks(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            {t.removeLineBreaks}
          </label>

          {removeLineBreaks && (
            <div className="ms-6 space-y-1.5">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="radio"
                  name="join-mode"
                  checked={!joinWithSpace}
                  onChange={() => setJoinWithSpace(false)}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {t.joinDirectly}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="radio"
                  name="join-mode"
                  checked={joinWithSpace}
                  onChange={() => setJoinWithSpace(true)}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {t.joinWithSpace}
              </label>
            </div>
          )}
        </div>

        {toggles.map(({ checked, onChange, label }) => (
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
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label htmlFor="line-output" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.result}
          </label>
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {t.statsAfter(outputChars, outputLines)}
          </span>
        </div>
        <textarea
          id="line-output"
          dir="auto"
          value={output}
          readOnly
          rows={8}
          className="input-field mt-1 resize-y bg-gray-50 text-sm dark:bg-gray-800/50"
        />
        <CopyButton text={output} className="mt-2" disabled={!output} />
      </div>
    </div>
  );
}
