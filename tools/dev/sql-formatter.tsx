"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

export default function SqlFormatter() {
  const t = useDevToolsExtraLabels("sqlFormatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const format = async () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { format: sqlFormat } = await import("sql-formatter");
      setOutput(sqlFormat(input, { language: "sql" }));
    } catch {
      setOutput("");
      setError(t.error);
    } finally {
      setLoading(false);
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
      <button type="button" onClick={() => void format()} disabled={loading} className="btn-secondary">
        <Wand2 className="h-4 w-4" />
        {loading ? t.loading : t.format}
      </button>
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
