"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useMiscToolsExtraLabels } from "@/lib/i18n/use-misc-tools-extra-labels";

const STORAGE_KEY = "kitzos-notepad";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export default function OnlineNotepad() {
  const labels = useCommonLabels();
  const t = useMiscToolsExtraLabels("onlineNotepad");
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setText(stored);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setSaved(false);
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text);
        setSaved(true);
      } catch {
        // ignored
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [text, mounted]);

  const clear = useCallback(() => {
    if (!window.confirm(t.clearConfirm)) return;
    setText("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignored
    }
  }, [t]);

  const words = countWords(text);
  const chars = text.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>{words} {t.words}</span>
          <span>·</span>
          <span>{chars} {t.characters}</span>
          <span>·</span>
          <span className={saved ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
            {saved ? t.saved : t.saving}
          </span>
        </div>
        <button type="button" onClick={clear} className="btn-secondary py-1.5 text-xs">
          <Trash2 className="h-3.5 w-3.5" />
          {labels.clear}
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        rows={14}
        className="input-field ltr-input resize-y font-mono text-sm leading-relaxed"
        aria-label={t.ariaLabel}
      />
    </div>
  );
}
