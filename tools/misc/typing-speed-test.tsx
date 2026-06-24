"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank on a sunny afternoon.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "Privacy matters because people deserve control over how their personal information is used.",
  "A journey of a thousand miles begins with a single step taken with courage and purpose.",
  "Good design is as little design as possible, focused on clarity and usefulness above all.",
];

function pickSample(): string {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
}

export default function TypingSpeedTest() {
  const [sample, setSample] = useState(pickSample);
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [tick, setTick] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!startedAt || finished) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 500);
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
    setSample(pickSample());
    setInput("");
    setStartedAt(null);
    setFinished(false);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [sample]);

  const elapsedMin = startedAt ? (Date.now() - startedAt) / 60000 : 0;
  void tick;
  const correctChars = input.split("").filter((c, i) => c === sample[i]).length;
  const wpm = startedAt && elapsedMin > 0 ? Math.round(correctChars / 5 / elapsedMin) : 0;
  const accuracy =
    input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;

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
      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm leading-relaxed dark:border-gray-700 dark:bg-gray-800/50">
        {renderSample()}
      </div>

      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        disabled={finished}
        placeholder="Start typing here…"
        rows={4}
        className="input-field resize-none font-mono text-sm"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-label="Typing input"
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">WPM</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{wpm}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{accuracy}%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {Math.min(100, Math.round((input.length / sample.length) * 100))}%
          </p>
        </div>
      </div>

      {finished && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center dark:border-green-800 dark:bg-green-950/40">
          <p className="font-semibold text-green-800 dark:text-green-200">Test complete!</p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            {wpm} WPM with {accuracy}% accuracy
          </p>
        </div>
      )}

      <button type="button" onClick={reset} className="btn-secondary">
        <RotateCcw className="h-4 w-4" />
        New test
      </button>
    </div>
  );
}
