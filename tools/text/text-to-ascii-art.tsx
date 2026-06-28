"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { loadFiglet } from "@/lib/figlet-browser";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

type FigletFont = "Standard" | "Slant";

export default function TextToAsciiArt() {
  const t = useTextToolLabels("asciiArt");
  const [input, setInput] = useToolDraft("input", "Hello");
  const [font, setFont] = useState<FigletFont>("Standard");
  const [art, setArt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setArt("");
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadFiglet()
      .then((figlet) => {
        if (cancelled) return;
        figlet.text(trimmed, { font }, (err, data) => {
          if (cancelled) return;
          setLoading(false);
          if (err || !data) {
            setArt("");
            setError(t.error);
            return;
          }
          setArt(data);
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        setArt("");
        setError(t.error);
      });

    return () => {
      cancelled = true;
    };
  }, [input, font, t.error]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="input-field mt-1 w-full font-mono"
          dir="ltr"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.font}</span>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value as FigletFont)}
          className="input-field mt-1 w-full"
        >
          <option value="Standard">{t.fontStandard}</option>
          <option value="Slant">{t.fontSlant}</option>
        </select>
      </label>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.loading}</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : art ? (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</span>
          <pre className="input-field mt-1 overflow-x-auto whitespace-pre bg-gray-50 p-4 font-mono text-xs leading-tight dark:bg-gray-800/50 sm:text-sm">
            {art}
          </pre>
          <CopyButton text={art} className="mt-2" />
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.empty}</p>
      )}
    </div>
  );
}
