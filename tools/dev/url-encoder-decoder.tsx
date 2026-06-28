"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

type Mode = "encode" | "decode";

export default function UrlEncoderDecoder() {
  const t = useDevToolsExtraLabels("urlEncoderDecoder");
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };

    try {
      if (mode === "encode") {
        return { output: encodeURIComponent(input), error: null };
      }
      return { output: decodeURIComponent(input.trim()), error: null };
    } catch {
      return { output: "", error: t.error };
    }
  }, [mode, input, t.error]);

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setInput("");
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {m === "encode" ? t.modeEncode : t.modeDecode}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? t.placeholderEncode : t.placeholderDecode}
          rows={5}
          className="input-field mt-1 w-full resize-y font-mono text-sm"
          dir="ltr"
          spellCheck={false}
        />
      </label>
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
            rows={5}
            className="input-field mt-1 w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
            dir="ltr"
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
