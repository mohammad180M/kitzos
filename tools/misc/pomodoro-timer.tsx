"use client";

import { useCallback, useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

type Phase = "work" | "break";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // audio not available
  }
}

export default function PomodoroTimer() {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  const switchPhase = useCallback(() => {
    setPhase((current) => {
      const next: Phase = current === "work" ? "break" : "work";
      if (next === "work") setCycles((c) => c + 1);
      setSecondsLeft((next === "work" ? workMin : breakMin) * 60);
      if (soundEnabled) playChime();
      return next;
    });
  }, [workMin, breakMin, soundEnabled]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          switchPhase();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, switchPhase]);

  const reset = () => {
    setRunning(false);
    setPhase("work");
    setSecondsLeft(workMin * 60);
  };

  const applyDurations = () => {
    setRunning(false);
    setPhase("work");
    setSecondsLeft(workMin * 60);
  };

  const progress =
    phase === "work"
      ? 1 - secondsLeft / (workMin * 60)
      : 1 - secondsLeft / (breakMin * 60);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {phase === "work" ? "Focus" : "Break"}
        </p>
        <p className="mt-2 font-mono text-6xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
          {formatTime(secondsLeft)}
        </p>
        <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-1000 ${
              phase === "work" ? "bg-primary-600" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Completed cycles: <span className="font-semibold text-gray-900 dark:text-gray-100">{cycles}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="btn-primary min-w-[120px]"
        >
          {running ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start
            </>
          )}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 sm:grid-cols-2">
        <div>
          <label htmlFor="work-min" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Work (minutes): {workMin}
          </label>
          <input
            id="work-min"
            type="range"
            min={1}
            max={60}
            value={workMin}
            onChange={(e) => setWorkMin(Number(e.target.value))}
            onMouseUp={applyDurations}
            onTouchEnd={applyDurations}
            className="mt-2 w-full accent-primary-600"
          />
        </div>
        <div>
          <label htmlFor="break-min" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Break (minutes): {breakMin}
          </label>
          <input
            id="break-min"
            type="range"
            min={1}
            max={30}
            value={breakMin}
            onChange={(e) => setBreakMin(Number(e.target.value))}
            onMouseUp={applyDurations}
            onTouchEnd={applyDurations}
            className="mt-2 w-full accent-primary-600"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(e) => setSoundEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
        />
        Play sound when a phase ends
      </label>
    </div>
  );
}
