"use client";

import { useState } from "react";
import { Minimize2, Wand2 } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";
import { formatXml, minifyXml } from "@/lib/xml-format";

export default function XmlFormatter() {
  const t = useDevToolsExtraLabels("xmlFormatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = (minify: boolean) => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      setOutput(minify ? minifyXml(input) : formatXml(input));
      setError(null);
    } catch {
      setOutput("");
      setError(t.error);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          rows={8}
          className="input-field ltr-input mt-1 w-full resize-y font-mono text-sm"
          dir="ltr"
          spellCheck={false}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => run(false)} className="btn-secondary">
          <Wand2 className="h-4 w-4" />
          {t.format}
        </button>
        <button type="button" onClick={() => run(true)} className="btn-secondary">
          <Minimize2 className="h-4 w-4" />
          {t.minify}
        </button>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
      {output && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.output}</label>
          <textarea
            value={output}
            readOnly
            rows={8}
            className="input-field ltr-input mt-1 w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
            dir="ltr"
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
