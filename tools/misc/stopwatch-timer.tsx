"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { useMiscToolsExtraLabels } from "@/lib/i18n/use-misc-tools-extra-labels";

type Tab = "stopwatch" | "countdown";

function formatStopwatch(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // audio not available
  }
}

export default function StopwatchTimer() {
  const t = useMiscToolsExtraLabels("stopwatchTimer");
  const [tab, setTab] = useState<Tab>("stopwatch");

  const [elapsed, setElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swStartRef = useRef<number | null>(null);
  const swAccumRef = useRef(0);

  const [countMin, setCountMin] = useState(1);
  const [countSec, setCountSec] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [cdRunning, setCdRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!swRunning) return;
    let raf: number;
    const tick = () => {
      if (swStartRef.current != null) {
        setElapsed(swAccumRef.current + performance.now() - swStartRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [swRunning]);

  const swStart = () => {
    swStartRef.current = performance.now();
    setSwRunning(true);
  };

  const swPause = () => {
    if (swStartRef.current != null) {
      swAccumRef.current += performance.now() - swStartRef.current;
      swStartRef.current = null;
    }
    setSwRunning(false);
  };

  const swReset = () => {
    swAccumRef.current = 0;
    swStartRef.current = null;
    setElapsed(0);
    setSwRunning(false);
    setLaps([]);
  };

  const swLap = () => {
    setLaps((prev) => [...prev, elapsed]);
  };

  const applyCountdownDuration = useCallback(() => {
    const total = countMin * 60 + countSec;
    setSecondsLeft(total > 0 ? total : 0);
    setFinished(false);
    setCdRunning(false);
  }, [countMin, countSec]);

  const startCountdown = () => {
    if (finished) {
      applyCountdownDuration();
      setCdRunning(true);
      return;
    }
    setFinished(false);
    setSecondsLeft((s) => {
      if (s > 0) return s;
      const total = countMin * 60 + countSec;
      return total > 0 ? total : 60;
    });
    setCdRunning(true);
  };

  useEffect(() => {
    if (!cdRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setCdRunning(false);
          setFinished(true);
          playBeep();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [cdRunning]);

  const cdReset = () => {
    setCdRunning(false);
    setFinished(false);
    const total = countMin * 60 + countSec;
    setSecondsLeft(total > 0 ? total : 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        {(["stopwatch", "countdown"] as Tab[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {id === "stopwatch" ? t.tabStopwatch : t.tabCountdown}
          </button>
        ))}
      </div>

      {tab === "stopwatch" ? (
        <>
          <div className="text-center">
            <p className="font-mono text-6xl font-bold tabular-nums text-gray-900 dark:text-gray-100" dir="ltr">
              {formatStopwatch(elapsed)}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={swRunning ? swPause : swStart}
              className="btn-primary min-w-[120px]"
            >
              {swRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  {t.pause}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {t.start}
                </>
              )}
            </button>
            <button type="button" onClick={swLap} disabled={!swRunning && elapsed === 0} className="btn-secondary">
              <Flag className="h-4 w-4" />
              {t.lap}
            </button>
            <button type="button" onClick={swReset} className="btn-secondary">
              <RotateCcw className="h-4 w-4" />
              {t.reset}
            </button>
          </div>

          {laps.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.laps}</p>
              <ul className="mt-2 space-y-1">
                {[...laps].reverse().map((lapMs, i) => (
                  <li
                    key={laps.length - i}
                    className="flex justify-between font-mono text-sm text-gray-600 dark:text-gray-400"
                    dir="ltr"
                  >
                    <span>
                      {t.lapNumber} {laps.length - i}
                    </span>
                    <span>{formatStopwatch(lapMs)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="text-center">
            <p
              className={`font-mono text-6xl font-bold tabular-nums ${
                finished ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-gray-100"
              }`}
              dir="ltr"
            >
              {formatCountdown(secondsLeft)}
            </p>
            {finished && (
              <p className="mt-3 text-lg font-medium text-primary-600 dark:text-primary-400" role="status">
                {t.timeUp}
              </p>
            )}
          </div>

          {!cdRunning && !finished && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.setDuration}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t.minutes}</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={countMin}
                    onChange={(e) => setCountMin(Math.max(0, Number(e.target.value) || 0))}
                    className="input-field mt-1 w-full"
                    dir="ltr"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t.seconds}</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={countSec}
                    onChange={(e) => setCountSec(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                    className="input-field mt-1 w-full"
                    dir="ltr"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => (cdRunning ? setCdRunning(false) : startCountdown())}
              disabled={!cdRunning && !finished && countMin === 0 && countSec === 0}
              className="btn-primary min-w-[120px]"
            >
              {cdRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  {t.pause}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {t.start}
                </>
              )}
            </button>
            <button type="button" onClick={cdReset} className="btn-secondary">
              <RotateCcw className="h-4 w-4" />
              {t.reset}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
