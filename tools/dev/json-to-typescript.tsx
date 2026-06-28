"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { jsonToTypeScript } from "@/lib/json-to-ts";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

export default function JsonToTypescript() {
  const t = useDevToolsExtraLabels("jsonToTypescript");
  const [input, setInput] = useState('{\n  "name": "Alice",\n  "age": 30\n}');
  const [rootName, setRootName] = useState("Root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    const result = jsonToTypeScript(input, rootName || "Root");
    if (result.error) {
      setOutput("");
      setError(t.error);
    } else {
      setOutput(result.code);
      setError(null);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.rootName}</span>
        <input
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          className="input-field mt-1 w-full max-w-xs font-mono"
          dir="ltr"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          rows={8}
          className="input-field mt-1 w-full resize-y font-mono text-sm"
          dir="ltr"
          spellCheck={false}
        />
      </label>
      <button type="button" onClick={convert} className="btn-secondary">
        <Wand2 className="h-4 w-4" />
        {t.convert}
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
            rows={12}
            className="input-field mt-1 w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
            dir="ltr"
            spellCheck={false}
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
