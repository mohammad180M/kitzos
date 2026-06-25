"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { downloadBlob } from "@/lib/download";
import {
  RIPPLE_PRESETS,
  CURSOR_PRESETS,
  buildRippleCss,
  buildRippleJs,
  buildCursorCss,
  buildCursorJs,
  type RipplePreset,
  type CursorPreset,
} from "@/lib/interaction-presets";

function PresetCard({
  name,
  active,
  onClick,
}: {
  name: string;
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
      {name}
    </button>
  );
}

export default function InteractionFx() {
  const labels = useCommonLabels();
  const rippleRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [ripplePreset, setRipplePreset] = useState<RipplePreset>(RIPPLE_PRESETS[0]);
  const [cursorPreset, setCursorPreset] = useState<CursorPreset>(CURSOR_PRESETS[0]);
  const [rippleColor, setRippleColor] = useState(RIPPLE_PRESETS[0].color);
  const [rippleDuration, setRippleDuration] = useState(RIPPLE_PRESETS[0].duration);
  const [rippleSize, setRippleSize] = useState(RIPPLE_PRESETS[0].size);
  const [copiedRipple, setCopiedRipple] = useState(false);
  const rippleHex = rippleColor.length >= 7 ? rippleColor.slice(0, 7) : "#2563eb";
  const [copiedCursor, setCopiedCursor] = useState(false);

  const activeRipple: RipplePreset = useMemo(
    () => ({ ...ripplePreset, color: rippleColor, duration: rippleDuration, size: rippleSize }),
    [ripplePreset, rippleColor, rippleDuration, rippleSize]
  );

  const rippleCss = buildRippleCss(activeRipple);
  const rippleJs = buildRippleJs(activeRipple);
  const rippleExport = `${rippleCss}\n\n${rippleJs}`;

  const cursorCss = buildCursorCss(cursorPreset);
  const cursorJs = buildCursorJs(cursorPreset);
  const cursorExport = `${cursorCss}\n\n${cursorJs}`;

  const applyRipplePreset = (p: RipplePreset) => {
    setRipplePreset(p);
    setRippleColor(p.color);
    setRippleDuration(p.duration);
    setRippleSize(p.size);
  };

  const onRippleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = rippleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement("span");
    const d = Math.max(rect.width, rect.height, activeRipple.size);
    Object.assign(ripple.style, {
      position: "absolute",
      borderRadius: "50%",
      width: `${d}px`,
      height: `${d}px`,
      left: `${e.clientX - rect.left - d / 2}px`,
      top: `${e.clientY - rect.top - d / 2}px`,
      background: activeRipple.color,
      transform: "scale(0)",
      animation: `ripple-preview ${activeRipple.duration}ms ${activeRipple.easing}`,
      pointerEvents: "none",
    });
    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    el.replaceChildren();
    el.className =
      "relative flex h-48 cursor-crosshair items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-800";

    const p = cursorPreset;

    if (p.mode === "glow") {
      el.classList.add("cursor-glow-wrap");
      const glow = document.createElement("div");
      glow.className = "cursor-glow";
      Object.assign(glow.style, {
        position: "absolute",
        width: `${p.size}px`,
        height: `${p.size}px`,
        borderRadius: "50%",
        background: p.color,
        filter: `blur(${p.blur}px)`,
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        transition: "left 0.08s ease-out, top 0.08s ease-out",
      });
      el.appendChild(glow);
      const move = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        glow.style.left = `${e.clientX - rect.left}px`;
        glow.style.top = `${e.clientY - rect.top}px`;
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    }

    if (p.mode === "ring") {
      const ring = document.createElement("div");
      Object.assign(ring.style, {
        position: "absolute",
        width: `${p.size}px`,
        height: `${p.size}px`,
        border: `2px solid ${p.color}`,
        borderRadius: "50%",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        transition: "left 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      });
      el.appendChild(ring);
      const move = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        ring.style.left = `${e.clientX - rect.left}px`;
        ring.style.top = `${e.clientY - rect.top}px`;
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    }

    if (p.mode === "trail") {
      let last = 0;
      const move = (e: PointerEvent) => {
        const now = Date.now();
        if (now - last < 40) return;
        last = now;
        const dot = document.createElement("div");
        Object.assign(dot.style, {
          position: "absolute",
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: "50%",
          background: p.color,
          pointerEvents: "none",
          left: "0",
          top: "0",
          transform: "translate(-50%, -50%)",
          animation: "trail-fade 0.5s ease-out forwards",
        });
        const rect = el.getBoundingClientRect();
        dot.style.left = `${e.clientX - rect.left}px`;
        dot.style.top = `${e.clientY - rect.top}px`;
        el.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove());
        while (el.children.length > p.trailLength + 1) {
          el.firstChild?.remove();
        }
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    }

    const dot = document.createElement("div");
    Object.assign(dot.style, {
      position: "absolute",
      width: `${p.size}px`,
      height: `${p.size}px`,
      borderRadius: "50%",
      background: p.color,
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
      transition: "left 0.05s linear, top 0.05s linear",
    });
    el.appendChild(dot);
    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      dot.style.left = `${e.clientX - rect.left}px`;
      dot.style.top = `${e.clientY - rect.top}px`;
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, [cursorPreset]);

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
    const content = `/* Click Ripple */\n${rippleExport}\n\n/* Cursor Motion */\n${cursorExport}\n\n// Usage:\n// attachRipple(document.querySelector('.my-button'));\n// attachCursorDot(document.querySelector('.my-area'));`;
    downloadBlob(new Blob([content], { type: "text/plain" }), "interaction-effects.txt");
  };

  return (
    <div className="space-y-8" dir="ltr">
      <style>{`
        @keyframes ripple-preview { to { transform: scale(${activeRipple.scale}); opacity: 0; } }
        @keyframes trail-fade {
          0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
        }
      `}</style>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Click ripple</h3>
          <p className="text-sm text-gray-500">Choose a preset, customize, then click the preview.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {RIPPLE_PRESETS.map((p) => (
            <PresetCard
              key={p.id}
              name={p.name}
              active={ripplePreset.id === p.id}
              onClick={() => applyRipplePreset(p)}
            />
          ))}
        </div>

        <div
          ref={rippleRef}
          onPointerDown={onRippleDown}
          className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-800"
          style={{ touchAction: "none" }}
        >
          Click to preview ripple
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Color
            <input
              type="color"
              value={rippleHex}
              onChange={(e) => setRippleColor(e.target.value + (rippleColor.length === 9 ? rippleColor.slice(7) : "80"))}
              className="mt-1 h-10 w-full cursor-pointer rounded border dark:border-gray-600"
            />
          </label>
          <label className="text-sm">
            Duration ({rippleDuration}ms)
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
            Size ({rippleSize}px)
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
          {copiedRipple ? labels.copied : "Copy ripple CSS + JS"}
        </button>
      </section>

      <hr className="border-gray-200 dark:border-gray-700" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cursor motion</h3>
          <p className="text-sm text-gray-500">Move your pointer over the preview — not just on click.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CURSOR_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCursorPreset(p)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                cursorPreset.id === p.id
                  ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/40"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <span className="block font-medium">{p.name}</span>
              <span className="text-xs text-gray-500">{p.description}</span>
            </button>
          ))}
        </div>

        <div ref={cursorRef} style={{ touchAction: "none" }}>
          Move cursor here
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
            {copiedCursor ? labels.copied : "Copy cursor CSS + JS"}
          </button>
          <button
            type="button"
            onClick={downloadBundle}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download all effects
          </button>
        </div>
      </section>
    </div>
  );
}
