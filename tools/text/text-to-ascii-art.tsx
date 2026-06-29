"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import {
  classifyAsciiInput,
  containsArabic,
  extractLatinForFiglet,
  type AsciiInputMode,
} from "@/lib/arabic-block-letters";
import { FIGLET_FONTS, type FigletFont, renderFiglet } from "@/lib/figlet-browser";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

export default function TextToAsciiArt() {
  const { locale } = useLocale();
  const t = useTextToolLabels("asciiArt");
  const [input, setInput] = useToolDraft("input", locale === "ar" ? "مرحباً" : "Hello");
  const [font, setFont] = useState<FigletFont>("Standard");
  const [art, setArt] = useState("");
  const [mode, setMode] = useState<AsciiInputMode>("empty");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = input.trim();
    const inputMode = classifyAsciiInput(trimmed);
    setMode(inputMode);

    if (inputMode === "empty") {
      setArt("");
      setError(null);
      setLoading(false);
      return;
    }

    if (inputMode === "arabic-only") {
      setArt("");
      setError(null);
      setLoading(false);
      return;
    }

    const figletText = inputMode === "mixed" ? extractLatinForFiglet(trimmed) : trimmed;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void renderFiglet(figletText, font)
      .then((data) => {
        if (cancelled) return;
        setLoading(false);
        setArt(data);
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

  const inputDir = containsArabic(input) ? "rtl" : "ltr";
  const showFontPicker = mode !== "arabic-only" && mode !== "empty";

  const download = () => {
    if (!art) return;
    const blob = new Blob([art], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ascii-art.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const fontLabel = (f: FigletFont) => {
    const labels: Record<FigletFont, string> = {
      Standard: t.fontStandard,
      Big: t.fontBig,
      Slant: t.fontSlant,
      Banner: t.fontBanner,
      Block: t.fontBlock,
    };
    return labels[f];
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className={`input-field mt-1 w-full font-mono ${inputDir === "rtl" ? "text-right" : ""}`}
          dir={inputDir}
        />
      </label>

      {showFontPicker && (
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.font}</span>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value as FigletFont)}
            className="input-field mt-1 w-full"
          >
            {FIGLET_FONTS.map((f) => (
              <option key={f} value={f}>
                {fontLabel(f)}
              </option>
            ))}
          </select>
        </label>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.loading}</p>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : mode === "arabic-only" ? (
        <div
          className="rounded-xl border border-primary-200 bg-primary-50/80 px-4 py-4 text-sm leading-relaxed text-primary-900 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-100"
          role="status"
        >
          {t.arabicOnlyNotice}
        </div>
      ) : art ? (
        <div className="space-y-3">
          {mode === "mixed" && (
            <p
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
              role="status"
            >
              {t.mixedNotice}
            </p>
          )}
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</span>
            <pre className="input-field mt-1 overflow-x-auto whitespace-pre bg-gray-50 p-4 font-mono text-xs leading-tight dark:bg-gray-800/50 sm:text-sm">
              {art}
            </pre>
            <div className="mt-2 flex flex-wrap gap-2">
              <CopyButton text={art} />
              <button type="button" onClick={download} className="btn-secondary">
                <Download className="h-4 w-4" />
                {t.downloadTxt}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.empty}</p>
      )}
    </div>
  );
}
