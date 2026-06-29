"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Dices, RefreshCw } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useMiscToolsExtraLabels } from "@/lib/i18n/use-misc-tools-extra-labels";

type Mode = "list" | "number";

const WHEEL_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#ca8a04", "#dc2626",
];

const SPIN_MS = 3500;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Pointer at top; wheel rotates clockwise. Land winner segment center under pointer. */
function spinRotation(current: number, winnerIndex: number, segmentCount: number): number {
  const slice = 360 / segmentCount;
  const centerAngle = (winnerIndex + 0.5) * slice;
  const landOffset = (360 - centerAngle) % 360;
  const fullSpins = (4 + Math.floor(Math.random() * 3)) * 360;
  const currentNorm = ((current % 360) + 360) % 360;
  let delta = fullSpins + landOffset - currentNorm;
  while (delta < fullSpins) delta += 360;
  return current + delta;
}

/** Which segment center sits under the top pointer after rotation. */
function winnerIndexAtRotation(rotation: number, count: number): number {
  const slice = 360 / count;
  const norm = ((rotation % 360) + 360) % 360;
  const angleAtPointer = (360 - norm) % 360;
  let idx = Math.floor(angleAtPointer / slice);
  if (idx >= count) idx = count - 1;
  if (idx < 0) idx = 0;
  return idx;
}

function truncateLabel(text: string, max = 10): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function RandomPicker() {
  const labels = useCommonLabels();
  const t = useMiscToolsExtraLabels("randomPicker");
  const [mode, setMode] = useState<Mode>("list");
  const [listInput, setListInput] = useState("Alice\nBob\nCharlie\nDiana\nEve");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const rotationRef = useRef(0);
  const spinTimerRef = useRef<number | null>(null);
  const itemsRef = useRef<string[]>([]);

  const items = listInput
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  itemsRef.current = items;

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current !== null) window.clearTimeout(spinTimerRef.current);
    };
  }, []);

  const pickFromList = useCallback(() => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) return;

    const winnerIndex = Math.floor(Math.random() * currentItems.length);

    if (spinTimerRef.current !== null) {
      window.clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }

    if (prefersReducedMotion() || currentItems.length === 1) {
      setResult(currentItems[winnerIndex]);
      setSpinning(false);
      return;
    }

    setResult(null);
    setSpinning(true);

    const nextRotation = spinRotation(rotationRef.current, winnerIndex, currentItems.length);
    rotationRef.current = nextRotation;
    setRotation(nextRotation);

    spinTimerRef.current = window.setTimeout(() => {
      const idx = winnerIndexAtRotation(rotationRef.current, currentItems.length);
      setResult(currentItems[idx]);
      setSpinning(false);
      spinTimerRef.current = null;
    }, SPIN_MS);
  }, []);

  const pickNumber = () => {
    const lo = parseInt(min, 10);
    const hi = parseInt(max, 10);
    if (isNaN(lo) || isNaN(hi) || lo > hi) return;
    const n = Math.floor(Math.random() * (hi - lo + 1)) + lo;
    setResult(String(n));
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  const slice = items.length > 0 ? 360 / items.length : 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.mode}</p>
        <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => {
              setMode("list");
              setResult(null);
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "list"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {t.pickFromList}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("number");
              setResult(null);
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "number"
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {t.randomNumber}
          </button>
        </div>
      </div>

      {mode === "list" ? (
        <>
          <div>
            <label htmlFor="pick-list" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.options}
            </label>
            <textarea
              id="pick-list"
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              rows={5}
              className="input-field mt-1 resize-y"
            />
          </div>

          {items.length >= 2 && (
            <div className="flex justify-center py-2">
              <div className="relative h-56 w-56">
                <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-0.5">
                  <div className="h-0 w-0 border-x-[10px] border-b-[18px] border-x-transparent border-b-primary-600 drop-shadow-sm" />
                </div>

                <div
                  className="absolute inset-0 rounded-full border-4 border-gray-200 shadow-md will-change-transform dark:border-gray-700"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning
                      ? `transform ${SPIN_MS}ms cubic-bezier(0.2, 0.8, 0.3, 1)`
                      : "none",
                    background: `conic-gradient(from -90deg, ${items
                      .map((_, i) => {
                        const color = WHEEL_COLORS[i % WHEEL_COLORS.length];
                        const start = slice * i;
                        const end = slice * (i + 1);
                        return `${color} ${start}deg ${end}deg`;
                      })
                      .join(", ")})`,
                  }}
                  aria-hidden="true"
                >
                  {items.map((item, i) => {
                    const angle = slice * i + slice / 2 - 90;
                    return (
                      <span
                        key={`${i}-${item}`}
                        className="absolute left-1/2 top-1/2 max-w-[5.5rem] truncate text-center text-[11px] font-semibold leading-tight text-white drop-shadow-sm"
                        style={{
                          transform: `rotate(${angle}deg) translate(0, -5.5rem) rotate(${-angle}deg)`,
                        }}
                      >
                        {truncateLabel(item, items.length > 6 ? 8 : 12)}
                      </span>
                    );
                  })}
                </div>

                <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-100 shadow dark:border-gray-300 dark:bg-gray-200" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={pickFromList}
            disabled={items.length < 1 || spinning}
            className="btn-primary"
          >
            <RefreshCw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
            {spinning ? t.spinning : t.pickRandom}
          </button>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="min-num" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.minimum}
              </label>
              <input
                id="min-num"
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label htmlFor="max-num" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.maximum}
              </label>
              <input
                id="max-num"
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="input-field mt-1"
              />
            </div>
          </div>
          <button type="button" onClick={pickNumber} className="btn-primary">
            <Dices className="h-4 w-4" />
            {labels.generate}
          </button>
        </>
      )}

      {result && !spinning && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-4 text-center dark:border-primary-800 dark:bg-primary-950/40">
          <p className="text-sm text-primary-600 dark:text-primary-400">{t.result}</p>
          <p className="mt-1 text-2xl font-bold text-primary-800 dark:text-primary-200">{result}</p>
          <button type="button" onClick={copy} className="btn-secondary mt-3">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                {labels.copied}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {labels.copy}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
