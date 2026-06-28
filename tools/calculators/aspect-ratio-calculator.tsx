"use client";

import { useMemo, useState } from "react";
import { simplifyRatio } from "@/lib/finance-calc";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";

const PRESETS = [
  { label: "16:9", w: 16, h: 9 },
  { label: "4:3", w: 4, h: 3 },
  { label: "3:2", w: 3, h: 2 },
  { label: "1:1", w: 1, h: 1 },
  { label: "9:16", w: 9, h: 16 },
];

export default function AspectRatioCalculator() {
  const t = useCalcToolLabels("aspectRatioCalculator");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [targetW, setTargetW] = useState("1280");
  const [targetH, setTargetH] = useState("720");

  const ratio = useMemo(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;
    const s = simplifyRatio(w, h);
    return { w, h, simple: `${s.w}:${s.h}`, decimal: (w / h).toFixed(4) };
  }, [width, height]);

  const fromWidth = useMemo(() => {
    if (!ratio) return null;
    const tw = parseFloat(targetW);
    if (!Number.isFinite(tw) || tw <= 0) return null;
    return Math.round((tw / ratio.w) * ratio.h);
  }, [ratio, targetW]);

  const fromHeight = useMemo(() => {
    if (!ratio) return null;
    const th = parseFloat(targetH);
    if (!Number.isFinite(th) || th <= 0) return null;
    return Math.round((th / ratio.h) * ratio.w);
  }, [ratio, targetH]);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t.presets}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => { setWidth(String(p.w * 100)); setHeight(String(p.h * 100)); }} className="btn-secondary text-xs">{p.label}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.width}</span>
          <input type="number" min="1" value={width} onChange={(e) => setWidth(e.target.value)} className="input-field mt-1 w-full" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.height}</span>
          <input type="number" min="1" value={height} onChange={(e) => setHeight(e.target.value)} className="input-field mt-1 w-full" />
        </label>
      </div>
      {ratio ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.ratio}</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{ratio.simple}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">({ratio.decimal})</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.invalid}</p>
      )}
      {ratio && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.calcFromWidth}</span>
            <input type="number" min="1" value={targetW} onChange={(e) => setTargetW(e.target.value)} className="input-field mt-1 w-full" />
            {fromWidth != null && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t.result}: {fromWidth}px</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.calcFromHeight}</span>
            <input type="number" min="1" value={targetH} onChange={(e) => setTargetH(e.target.value)} className="input-field mt-1 w-full" />
            {fromHeight != null && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t.result}: {fromHeight}px</p>}
          </label>
        </div>
      )}
    </div>
  );
}
