"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useMiscToolsExtraLabels } from "@/lib/i18n/use-misc-tools-extra-labels";

type Phase = "work" | "break";

type AlarmSound = "chime" | "bell" | "beep" | "alarm";

const ALARM_SOUNDS: AlarmSound[] = ["chime", "bell", "beep", "alarm"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function playAlarm(sound: AlarmSound, volume: number) {
  try {
    const ctx = new AudioContext();
    const t0 = ctx.currentTime;

    const playTone = (freq: number, start: number, dur: number, type: OscillatorType = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(volume, t0 + start);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.05);
    };

    switch (sound) {
      case "chime":
        playTone(880, 0, 0.4);
        playTone(1100, 0.15, 0.5);
        break;
      case "bell":
        playTone(660, 0, 0.6);
        playTone(990, 0.1, 0.5);
        playTone(1320, 0.2, 0.4);
        break;
      case "beep":
        for (let i = 0; i < 3; i++) playTone(1000, i * 0.25, 0.15, "square");
        break;
      case "alarm":
        for (let i = 0; i < 4; i++) {
          playTone(800, i * 0.3, 0.12, "sawtooth");
          playTone(600, i * 0.3 + 0.12, 0.12, "sawtooth");
        }
        break;
    }
  } catch {
    // audio not available
  }
}

export default function PomodoroTimer() {
  const t = useMiscToolsExtraLabels("pomodoroTimer");
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alarmSound, setAlarmSound] = useState<AlarmSound>("chime");
  const [volume, setVolume] = useState(0.75);
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const alarmRef = useRef({ sound: alarmSound, volume, enabled: soundEnabled });

  useEffect(() => {
    alarmRef.current = { sound: alarmSound, volume, enabled: soundEnabled };
  }, [alarmSound, volume, soundEnabled]);

  const switchPhase = useCallback(() => {
    setPhase((current) => {
      const next: Phase = current === "work" ? "break" : "work";
      if (next === "work") setCycles((c) => c + 1);
      setSecondsLeft((next === "work" ? workMin : breakMin) * 60);
      const { sound, volume: vol, enabled } = alarmRef.current;
      if (enabled) playAlarm(sound, vol);
      return next;
    });
  }, [workMin, breakMin]);

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

  const testSound = () => playAlarm(alarmSound, volume);

  const progress =
    phase === "work"
      ? 1 - secondsLeft / (workMin * 60)
      : 1 - secondsLeft / (breakMin * 60);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {phase === "work" ? t.focus : t.break}
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
          {t.completedCycles}: <span className="font-semibold text-gray-900 dark:text-gray-100">{cycles}</span>
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
              {t.pause}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {t.start}
            </>
          )}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          <RotateCcw className="h-4 w-4" />
          {t.reset}
        </button>
      </div>

      <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 sm:grid-cols-2">
        <div>
          <label htmlFor="work-min" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.workMinutes}: {workMin}
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
            {t.breakMinutes}: {breakMin}
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

      <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
          />
          {t.playSoundOnPhaseEnd}
        </label>

        {soundEnabled && (
          <>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.alarmSound}</p>
              <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
                {ALARM_SOUNDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAlarmSound(id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      alarmSound === id
                        ? "bg-primary-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    {t.alarms[id]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="alarm-vol" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.volume}: {Math.round(volume * 100)}%
              </label>
              <input
                id="alarm-vol"
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="mt-2 w-full accent-primary-600"
              />
            </div>

            <button type="button" onClick={testSound} className="btn-secondary text-sm">
              {t.testSound}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
