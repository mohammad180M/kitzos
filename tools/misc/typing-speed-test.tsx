"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMiscToolsExtraLabels } from "@/lib/i18n/use-misc-tools-extra-labels";
import {
  defaultTypingPassage,
  pickTypingPassage,
  type PassageLength,
  type TypingLocale,
} from "@/lib/typing/passages";

function OptionGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <div
        className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800"
        role="group"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
}

function OptionChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary-600 text-white"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function TypingSpeedTest() {
  const t = useMiscToolsExtraLabels("typingSpeedTest");
  const { locale } = useLocale();
  const typingLocale: TypingLocale = locale === "ar" ? "ar" : "en";
  const dir = typingLocale === "ar" ? "rtl" : "ltr";

  const [passageLength, setPassageLength] = useState<PassageLength>("short");
  const [withTashkeel, setWithTashkeel] = useState(false);
  const [sample, setSample] = useState(() =>
    defaultTypingPassage(typingLocale, { length: "short", withTashkeel: false })
  );
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [tick, setTick] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const effectiveTashkeel = typingLocale === "ar" && withTashkeel;

  useEffect(() => {
    if (typingLocale !== "ar" && withTashkeel) {
      setWithTashkeel(false);
    }
  }, [typingLocale, withTashkeel]);

  useEffect(() => {
    setSample(
      pickTypingPassage(typingLocale, {
        withTashkeel: effectiveTashkeel,
        length: passageLength,
      })
    );
    setInput("");
    setStartedAt(null);
    setFinished(false);
  }, [typingLocale, effectiveTashkeel, passageLength]);

  useEffect(() => {
    if (!startedAt || finished) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [startedAt, finished]);

  const handleInput = (value: string) => {
    if (finished) return;
    if (!startedAt && value.length > 0) setStartedAt(Date.now());
    setInput(value);
    if (value.length >= sample.length) {
      setFinished(true);
    }
  };

  const reset = useCallback(() => {
    setSample(
      pickTypingPassage(typingLocale, {
        withTashkeel: effectiveTashkeel,
        length: passageLength,
        exclude: sample,
      })
    );
    setInput("");
    setStartedAt(null);
    setFinished(false);
    inputRef.current?.focus();
  }, [typingLocale, effectiveTashkeel, passageLength, sample]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [sample]);

  const elapsedMin = startedAt ? (Date.now() - startedAt) / 60000 : 0;
  void tick;
  const correctChars = input.split("").filter((c, i) => c === sample[i]).length;
  const wpm = startedAt && elapsedMin > 0 ? Math.round(correctChars / 5 / elapsedMin) : 0;
  const accuracy =
    input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;
  const progress =
    sample.length > 0 ? Math.min(100, Math.round((input.length / sample.length) * 100)) : 0;

  const renderSample = () => {
    return sample.split("").map((char, i) => {
      let className = "text-gray-400 dark:text-gray-500";
      if (i < input.length) {
        className =
          input[i] === char
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 bg-red-100 dark:bg-red-950/40 dark:text-red-400";
      } else if (i === input.length) {
        className = "border-b-2 border-primary-600 text-gray-900 dark:text-gray-100";
      }
      // Keep real spaces so the paragraph wraps inside the box (NBSP blocked wrapping).
      return (
        <span key={i} className={`${className}${char === " " ? " inline" : ""}`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex flex-wrap gap-4">
        <OptionGroup label={t.lengthLabel}>
          <OptionChip
            active={passageLength === "short"}
            onClick={() => setPassageLength("short")}
          >
            {t.lengthShort}
          </OptionChip>
          <OptionChip
            active={passageLength === "long"}
            onClick={() => setPassageLength("long")}
          >
            {t.lengthLong}
          </OptionChip>
        </OptionGroup>

        {typingLocale === "ar" && (
          <OptionGroup label={t.tashkeelLabel}>
            <OptionChip active={!withTashkeel} onClick={() => setWithTashkeel(false)}>
              {t.tashkeelWithout}
            </OptionChip>
            <OptionChip active={withTashkeel} onClick={() => setWithTashkeel(true)}>
              {t.tashkeelWith}
            </OptionChip>
          </OptionGroup>
        )}
      </div>

      <div
        className={`min-w-0 max-w-full overflow-x-hidden whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed dark:border-gray-700 dark:bg-gray-800/50 ${
          typingLocale === "ar" ? "font-sans" : "font-mono"
        }`}
        lang={typingLocale}
      >
        {renderSample()}
      </div>

      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        disabled={finished}
        placeholder={t.placeholder}
        rows={passageLength === "long" ? 6 : 4}
        dir={dir}
        lang={typingLocale}
        className={`input-field resize-none text-sm ${
          typingLocale === "ar" ? "" : "font-mono"
        }`}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-label={t.ariaLabel}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.wpm}</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{wpm}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.accuracy}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{accuracy}%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.progress}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{progress}%</p>
        </div>
      </div>

      {finished && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center dark:border-green-800 dark:bg-green-950/40">
          <p className="font-semibold text-green-800 dark:text-green-200">{t.testComplete}</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            {t.resultSummary.replace("{wpm}", String(wpm)).replace("{accuracy}", String(accuracy))}
          </p>
        </div>
      )}

      <button type="button" onClick={reset} className="btn-secondary">
        <RotateCcw className="h-4 w-4" />
        {t.newTest}
      </button>
    </div>
  );
}
