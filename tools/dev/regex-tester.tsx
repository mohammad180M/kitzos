"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import ToolEmptyHint from "@/components/ToolEmptyHint";
import { usePersistedInput } from "@/lib/hooks/use-persisted-input";
import { useToolKeyboard } from "@/lib/hooks/use-tool-keyboard";
import { buildHighlightSegments, testRegex } from "@/lib/regex-test";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

const FLAG_KEYS = ["g", "i", "m", "s", "u", "y"] as const;

export default function RegexTester() {
  const { locale, t } = useLocale();
  const labels = useCommonLabels();
  const ui = t.regexTester;

  const [pattern, setPattern] = usePersistedInput("kitzos-regex-pattern");
  const [flags, setFlags] = useState<Record<(typeof FLAG_KEYS)[number], boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [testText, setTestText] = usePersistedInput("kitzos-regex-test-text");

  const flagString = FLAG_KEYS.filter((key) => flags[key]).join("");

  const { matches, error, segments } = useMemo(() => {
    const outcome = testRegex(pattern, flagString, testText);
    return {
      matches: outcome.matches,
      error: outcome.error,
      segments: buildHighlightSegments(testText, outcome.matches),
    };
  }, [pattern, flagString, testText]);

  useToolKeyboard({
    onClear: () => {
      setPattern("");
      setTestText("");
    },
  });

  const applyExample = (index: number) => {
    const example = ui.examples[index];
    if (!example) return;
    setPattern(example.pattern);
    setTestText(example.text);
    setFlags({ g: true, i: example.caseInsensitive, m: false, s: false, u: false, y: false });
  };

  return (
    <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <ToolEmptyHint
        message={t.common.emptyStateHint}
        show={!pattern.trim() && !testText.trim()}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.common.keyboardHint}</p>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.examplesTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ui.examples.map((example, index) => (
            <button
              key={example.label}
              type="button"
              onClick={() => applyExample(index)}
              className="btn-secondary py-1.5 text-xs"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="regex-pattern" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {ui.patternLabel}
          </label>
          <CopyButton text={pattern} label={ui.copyPattern} disabled={!pattern} />
        </div>
        <input
          id="regex-pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder={ui.patternPlaceholder}
          className="input-field ltr-input font-mono text-sm"
          spellCheck={false}
          dir="ltr"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.flags}</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {FLAG_KEYS.map((key) => (
            <label key={key} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={flags[key]}
                onChange={(e) => setFlags((prev) => ({ ...prev, [key]: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="font-mono">{key}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="regex-test-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {ui.testTextLabel}
        </label>
        <div className="relative mt-1 min-h-[10rem] rounded-lg border border-gray-300 dark:border-gray-600">
          <div
            className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm text-gray-900 dark:text-gray-100"
            aria-hidden="true"
          >
            {segments.map((segment, index) =>
              segment.highlighted ? (
                <mark
                  key={index}
                  className="rounded bg-amber-200 text-gray-900 dark:bg-amber-500/40 dark:text-gray-100"
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={index}>{segment.text}</span>
              )
            )}
          </div>
          <textarea
            id="regex-test-text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder={ui.testTextPlaceholder}
            rows={8}
            className="relative w-full resize-y bg-transparent p-3 font-mono text-sm text-transparent caret-gray-900 outline-none dark:caret-gray-100"
            spellCheck={false}
            dir="ltr"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400">
        {ui.matchCount}: <span className="font-semibold tabular-nums">{matches.length}</span>
      </p>

      {matches.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.matchesTitle}</h3>
          <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            {matches.map((match, index) => (
              <li key={`${match.index}-${index}`} className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  #{index + 1}
                </span>{" "}
                <span className="text-gray-500 dark:text-gray-400">
                  {ui.atIndex} {match.index}
                </span>
                <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-800">
                  {match.match}
                </pre>
                {match.groups.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                    {match.groups.map((group, groupIndex) => (
                      <li key={groupIndex}>
                        {ui.group} {groupIndex + 1}: {group ?? ui.emptyGroup}
                      </li>
                    ))}
                  </ul>
                )}
                {Object.keys(match.namedGroups).length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                    {Object.entries(match.namedGroups).map(([name, value]) => (
                      <li key={name}>
                        {ui.namedGroup} {name}: {value}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(pattern || testText) && (
        <button
          type="button"
          onClick={() => {
            setPattern("");
            setTestText("");
          }}
          className="btn-secondary"
        >
          {labels.clear}
        </button>
      )}
    </div>
  );
}
