"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useMiscToolsExtraLabels } from "@/lib/i18n/use-misc-tools-extra-labels";
import { downloadBlob } from "@/lib/download";
import {
  RIPPLE_PATTERNS,
  CURSOR_PRESETS,
  DEFAULT_RIPPLE_STYLE,
  buildRippleCss,
  buildRippleJs,
  buildCursorCss,
  buildCursorJs,
  setupCursorPreview,
  spawnPressEffect,
  type RipplePattern,
  type RippleStyle,
  type CursorPreset,
} from "@/lib/interaction-presets";

function PatternCard({
  name,
  description,
  active,
  onClick,
}: {
  name: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        active
          ? "border-primary-500 bg-primary-50 text-primary-800 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-200"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      <span className="block font-medium">{name}</span>
      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{description}</span>
    </button>
  );
}

function rippleScale(size: number): number {
  return Math.max(3, size / 22);
}

export default function InteractionFx() {
  const labels = useCommonLabels();
  const t = useMiscToolsExtraLabels("interactionFx");
  const rippleRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [ripplePattern, setRipplePattern] = useState<RipplePattern>("ripple");
  const [cursorModeId, setCursorModeId] = useState(CURSOR_PRESETS[0].id);
  const [cursorColor, setCursorColor] = useState(CURSOR_PRESETS[0].color);
  const [cursorSize, setCursorSize] = useState(CURSOR_PRESETS[0].size);
  const [cursorBlur, setCursorBlur] = useState(CURSOR_PRESETS[0].blur);
  const [rippleColor, setRippleColor] = useState(DEFAULT_RIPPLE_STYLE.ripple.color);
  const [rippleDuration, setRippleDuration] = useState(DEFAULT_RIPPLE_STYLE.ripple.duration);
  const [rippleSize, setRippleSize] = useState(DEFAULT_RIPPLE_STYLE.ripple.size);
  const [copiedRipple, setCopiedRipple] = useState(false);
  const rippleHex = rippleColor.length >= 7 ? rippleColor.slice(0, 7) : "#2563eb";
  const cursorHex = cursorColor.length >= 7 ? cursorColor.slice(0, 7) : "#2563eb";
  const [copiedCursor, setCopiedCursor] = useState(false);

  const activeCursor: CursorPreset = useMemo(() => {
    const base = CURSOR_PRESETS.find((p) => p.id === cursorModeId) ?? CURSOR_PRESETS[0];
    return { ...base, color: cursorColor, size: cursorSize, blur: cursorBlur };
  }, [cursorModeId, cursorColor, cursorSize, cursorBlur]);

  const activeRipple: RippleStyle = useMemo(
    () => ({
      pattern: ripplePattern,
      color: rippleColor,
      duration: rippleDuration,
      size: rippleSize,
    }),
    [ripplePattern, rippleColor, rippleDuration, rippleSize]
  );

  const rippleCss = buildRippleCss(activeRipple);
  const rippleJs = buildRippleJs(activeRipple);
  const rippleExport = `${rippleCss}\n\n${rippleJs}`;

  const cursorCss = buildCursorCss(activeCursor);
  const cursorJs = buildCursorJs(activeCursor);
  const cursorExport = `${cursorCss}\n\n${cursorJs}`;

  const applyRipplePattern = (pattern: RipplePattern) => {
    const defaults = DEFAULT_RIPPLE_STYLE[pattern];
    setRipplePattern(pattern);
    setRippleColor(defaults.color);
    setRippleDuration(defaults.duration);
    setRippleSize(defaults.size);
    rippleRef.current?.replaceChildren();
  };

  const applyCursorMode = (preset: CursorPreset) => {
    setCursorModeId(preset.id);
    setCursorColor(preset.color);
    setCursorSize(preset.size);
    setCursorBlur(preset.blur);
  };

  const onRippleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = rippleRef.current;
    if (!el) return;
    spawnPressEffect(el, e.clientX, e.clientY, activeRipple);
  };

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    return setupCursorPreview(el, activeCursor);
  }, [activeCursor]);

  const copyText = async (text: string, which: "ripple" | "cursor") => {
    await navigator.clipboard.writeText(text);
    if (which === "ripple") {
      setCopiedRipple(true);
      setTimeout(() => setCopiedRipple(false), 2000);
    } else {
      setCopiedCursor(true);
      setTimeout(() => setCopiedCursor(false), 2000);
    }
  };

  const downloadBundle = () => {
    const attachName =
      activeCursor.mode === "glow"
        ? "attachCursorGlow"
        : activeCursor.mode === "ring"
          ? "attachCursorRing"
          : activeCursor.mode === "trail"
            ? "attachCursorTrail"
            : "attachCursorDot";

    const content = `/* Press effect (${activeRipple.pattern}) */\n${rippleExport}\n\n/* Cursor motion (${activeCursor.mode}) */\n${cursorExport}\n\n// Usage:\n// attachPressEffect(document.querySelector('.my-button'));\n// ${attachName}(document.querySelector('.my-area'));`;
    downloadBlob(new Blob([content], { type: "text/plain" }), "interaction-effects.txt");
  };

  const scale = rippleScale(rippleSize);

  return (
    <div className="space-y-8" dir="ltr">
      <style>{`
        @keyframes press-ripple { to { transform: scale(${scale}); opacity: 0; } }
        @keyframes press-burst-fly {
          from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          to {
            transform: translate(calc(-50% + var(--bx)), calc(-50% + var(--by))) scale(0.2);
            opacity: 0;
          }
        }
        @keyframes press-shockwave { to { transform: scale(${scale * 1.2}); opacity: 0; } }
        @keyframes press-ring-pulse { to { transform: scale(${scale}); opacity: 0; } }
        @keyframes press-ink-spread {
          to {
            transform: scaleX(${scale * 0.9}) scaleY(${scale * 0.75});
            opacity: 0;
            border-radius: 2px;
          }
        }
        @keyframes cursor-trail-fade {
          0% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
        }
      `}</style>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t.pressEffects}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.pressHint}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RIPPLE_PATTERNS.map((p) => {
            const meta = t.patterns[p.id];
            return (
              <PatternCard
                key={p.id}
                name={meta.name}
                description={meta.description}
                active={ripplePattern === p.id}
                onClick={() => applyRipplePattern(p.id)}
              />
            );
          })}
        </div>

        <div
          ref={rippleRef}
          onPointerDown={onRippleDown}
          className="relative flex h-44 cursor-pointer select-none items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-800"
          style={{ touchAction: "none" }}
        >
          {t.tapPreview} {t.patterns[ripplePattern].name}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            {t.color}
            <input
              type="color"
              value={rippleHex}
              onChange={(e) =>
                setRippleColor(
                  e.target.value + (rippleColor.length === 9 ? rippleColor.slice(7) : "80")
                )
              }
              className="mt-1 h-10 w-full cursor-pointer rounded border dark:border-gray-600"
            />
          </label>
          <label className="text-sm">
            {t.duration} ({rippleDuration}ms)
            <input
              type="range"
              min={200}
              max={1200}
              step={50}
              value={rippleDuration}
              onChange={(e) => setRippleDuration(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="text-sm">
            {t.size} ({rippleSize}px)
            <input
              type="range"
              min={40}
              max={160}
              value={rippleSize}
              onChange={(e) => setRippleSize(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>

        <pre className="max-h-40 overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">
          {rippleExport}
        </pre>

        <button
          type="button"
          onClick={() => void copyText(rippleExport, "ripple")}
          className="btn-secondary inline-flex items-center gap-2"
        >
          {copiedRipple ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copiedRipple ? labels.copied : t.copyPress}
        </button>
      </section>

      <hr className="border-gray-200 dark:border-gray-700" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t.cursorMotion}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.cursorHint}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CURSOR_PRESETS.map((p) => {
            const meta = t.cursors[p.id as keyof typeof t.cursors];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyCursorMode(p)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  cursorModeId === p.id
                    ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/40"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="block font-medium">{meta.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{meta.description}</span>
              </button>
            );
          })}
        </div>

        <div
          ref={cursorRef}
          className="relative flex h-48 w-full min-h-[12rem] cursor-crosshair items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
          style={{ touchAction: "none" }}
          aria-label={t.cursorPreview}
        >
          <span
            data-preview-hint
            className="pointer-events-none z-0 select-none transition-opacity duration-200"
          >
            {t.moveCursor}
          </span>
        </div>

        <div className={`grid gap-3 ${activeCursor.mode === "glow" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <label className="text-sm text-gray-700 dark:text-gray-300">
            {t.color}
            <input
              type="color"
              value={cursorHex}
              onChange={(e) => {
                const alpha =
                  activeCursor.mode === "glow" || activeCursor.mode === "trail"
                    ? cursorColor.length === 9
                      ? cursorColor.slice(7)
                      : "99"
                    : "";
                setCursorColor(
                  activeCursor.mode === "glow" || activeCursor.mode === "trail"
                    ? e.target.value + alpha
                    : e.target.value
                );
              }}
              className="mt-1 h-10 w-full cursor-pointer rounded border dark:border-gray-600"
            />
          </label>
          <label className="text-sm text-gray-700 dark:text-gray-300">
            {t.size} ({cursorSize}px)
            <input
              type="range"
              min={activeCursor.mode === "glow" ? 60 : 6}
              max={activeCursor.mode === "glow" ? 200 : activeCursor.mode === "ring" ? 80 : 24}
              step={1}
              value={cursorSize}
              onChange={(e) => setCursorSize(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
          {activeCursor.mode === "glow" && (
            <label className="text-sm text-gray-700 dark:text-gray-300">
              {t.blur} ({cursorBlur}px)
              <input
                type="range"
                min={8}
                max={48}
                step={2}
                value={cursorBlur}
                onChange={(e) => setCursorBlur(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
          )}
        </div>

        <pre className="max-h-40 overflow-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">
          {cursorExport}
        </pre>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyText(cursorExport, "cursor")}
            className="btn-secondary inline-flex items-center gap-2"
          >
            {copiedCursor ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedCursor ? labels.copied : t.copyCursor}
          </button>
          <button
            type="button"
            onClick={downloadBundle}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t.downloadAll}
          </button>
        </div>
      </section>
    </div>
  );
}
