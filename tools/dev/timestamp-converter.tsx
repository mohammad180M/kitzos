"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import DirectionArrow from "@/components/DirectionArrow";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

type CopiedField = "seconds" | "ms" | "date" | null;

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function parseTimestampInput(value: string): { seconds: number; ms: number } | null {
  const trimmed = value.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;

  if (trimmed.length >= 13) {
    return { seconds: Math.floor(num / 1000), ms: num };
  }
  return { seconds: num, ms: num * 1000 };
}

export default function TimestampConverter() {
  const labels = useCommonLabels();
  const t = useDevToolsExtraLabels("timestampConverter");
  const [timestampInput, setTimestampInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [copied, setCopied] = useState<CopiedField>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parsedTs = parseTimestampInput(timestampInput);
  const parsedDate = dateInput ? new Date(dateInput) : null;
  const dateFromTs = parsedTs ? new Date(parsedTs.ms) : null;
  const validDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

  const copy = async (field: CopiedField, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignored
    }
  };

  const handleTimestampChange = (value: string) => {
    setTimestampInput(value);
    const parsed = parseTimestampInput(value);
    if (parsed) {
      setDateInput(new Date(parsed.ms).toISOString().slice(0, 16));
    }
  };

  const handleDateChange = (value: string) => {
    setDateInput(value);
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      setTimestampInput(String(Math.floor(d.getTime() / 1000)));
    }
  };

  const nowSeconds = now !== null ? Math.floor(now / 1000) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.currentTime}</p>
        {now !== null ? (
          <>
            <p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">{formatDate(new Date(now))}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-mono text-primary-700 dark:text-primary-300">{nowSeconds} s</span>
              <button
                type="button"
                onClick={() => copy("seconds", String(nowSeconds))}
                className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {copied === "seconds" ? <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {t.copySeconds}
              </button>
              <span className="font-mono text-primary-700 dark:text-primary-300">{now} ms</span>
              <button
                type="button"
                onClick={() => copy("ms", String(now))}
                className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {copied === "ms" ? <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {t.copyMs}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-1 font-mono text-sm text-gray-400 dark:text-gray-500">—</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ts-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.unixTimestamp}
          </label>
          <input
            id="ts-input"
            type="text"
            inputMode="numeric"
            value={timestampInput}
            onChange={(e) => handleTimestampChange(e.target.value)}
            placeholder={t.placeholderTimestamp}
            className="input-field ltr-input mt-1 font-mono"
          />
          {parsedTs && dateFromTs && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <DirectionArrow className="me-1" />
              {formatDate(dateFromTs)}
              <span className="mt-1 block font-mono text-xs text-gray-400 dark:text-gray-500">
                {parsedTs.ms} ms
              </span>
            </p>
          )}
        </div>
        <div>
          <label htmlFor="date-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.dateTime}
          </label>
          <input
            id="date-input"
            type="datetime-local"
            value={dateInput}
            onChange={(e) => handleDateChange(e.target.value)}
            className="input-field mt-1"
          />
          {validDate && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <DirectionArrow className="me-1" />
              <span className="font-mono">{Math.floor(validDate.getTime() / 1000)}</span> {t.seconds}
              <button
                type="button"
                onClick={() => copy("date", String(Math.floor(validDate.getTime() / 1000)))}
                className="ms-2 inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {copied === "date" ? <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {labels.copy}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
