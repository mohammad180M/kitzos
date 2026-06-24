"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

type CleanMode = "remove-breaks" | "remove-extra-spaces" | "breaks-to-spaces";

export default function RemoveLineBreaks() {
  const labels = useCommonLabels();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CleanMode>("remove-breaks");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";

    switch (mode) {
      case "remove-breaks":
        return input.replace(/[\r\n]+/g, "");
      case "remove-extra-spaces":
        return input
          .replace(/[ \t]+/g, " ")
          .replace(/ *\n */g, "\n")
          .trim();
      case "breaks-to-spaces":
        return input.replace(/[\r\n]+/g, " ").replace(/[ \t]+/g, " ").trim();
      default:
        return input;
    }
  }, [input, mode]);

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="line-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Text
        </label>
        <textarea
          id="line-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Paste text with line breaks…"
          className="input-field mt-1 resize-y text-sm"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Options</legend>
        {[
          { value: "remove-breaks" as const, label: "Remove all line breaks" },
          { value: "remove-extra-spaces" as const, label: "Remove extra spaces (keep line breaks)" },
          { value: "breaks-to-spaces" as const, label: "Convert line breaks to spaces" },
        ].map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name="clean-mode"
              checked={mode === opt.value}
              onChange={() => setMode(opt.value)}
              className="h-4 w-4 border-gray-300 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      {output && (
        <div>
          <label htmlFor="line-output" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Result
          </label>
          <textarea
            id="line-output"
            value={output}
            readOnly
            rows={8}
            className="input-field mt-1 resize-y text-sm bg-gray-50 dark:bg-gray-800/50"
          />
          <button type="button" onClick={copy} className="btn-secondary mt-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                {labels.copied}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {labels.copy}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
