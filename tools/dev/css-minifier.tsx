"use client";

import { useState } from "react";
import { Minimize2, Wand2 } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { formatCss, minifyCss } from "@/lib/css-minify";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

export default function CssMinifier() {
  const t = useDevToolsExtraLabels("cssMinifier");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = (minify: boolean) => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(minify ? minifyCss(input) : formatCss(input));
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
          className="input-field mt-1 w-full resize-y font-mono text-sm"
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
      {output && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.output}</label>
          <textarea
            value={output}
            readOnly
            rows={8}
            className="input-field mt-1 w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
            dir="ltr"
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
