"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ColorControl({
  label,
  color,
  onChange,
  showAlpha,
  alpha,
  onAlphaChange,
  opacityLabel = "Opacity",
}: {
  label: string;
  color: string;
  onChange: (hex: string) => void;
  showAlpha?: boolean;
  alpha?: number;
  onAlphaChange?: (a: number) => void;
  opacityLabel?: string;
}) {
  return (
    <div className="text-sm">
      <span className="mb-1 block">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 shrink-0 cursor-pointer rounded border dark:border-gray-600"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v.length === 7 ? v : color);
          }}
          className="input-field flex-1 font-mono text-xs"
        />
      </div>
      {showAlpha && onAlphaChange != null && alpha != null && (
        <label className="mt-2 block text-xs text-gray-500">
          {opacityLabel} ({Math.round(alpha * 100)}%)
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(alpha * 100)}
            onChange={(e) => onAlphaChange(Number(e.target.value) / 100)}
            className="mt-1 w-full"
          />
        </label>
      )}
    </div>
  );
}

export default function BoxShadowGenerator() {
  const labels = useCommonLabels();
  const t = useDevToolsExtraLabels("boxShadowGenerator");
  const [x, setX] = useState(0);
  const [y, setY] = useState(8);
  const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(0);
  const [boxColor, setBoxColor] = useState("#ffffff");
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowAlpha, setShadowAlpha] = useState(0.25);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const shadowRgba = useMemo(
    () => hexToRgba(shadowColor, shadowAlpha),
    [shadowColor, shadowAlpha]
  );

  const css = useMemo(() => {
    const insetStr = inset ? "inset " : "";
    return `background: ${boxColor};\nbox-shadow: ${insetStr}${x}px ${y}px ${blur}px ${spread}px ${shadowRgba};`;
  }, [x, y, blur, spread, shadowRgba, inset, boxColor]);

  const shadowStyle = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${shadowRgba}`;

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4" dir="ltr">
      <div className="flex justify-center rounded-xl bg-gray-100 py-10 dark:bg-gray-900">
        <div
          className="h-32 w-48 rounded-xl"
          style={{ backgroundColor: boxColor, boxShadow: shadowStyle }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorControl label={t.boxColor} color={boxColor} onChange={setBoxColor} />
        <ColorControl
          label={t.shadowColor}
          color={shadowColor}
          onChange={setShadowColor}
          showAlpha
          alpha={shadowAlpha}
          onAlphaChange={setShadowAlpha}
          opacityLabel={t.opacity}
        />
        <label className="text-sm">
          {t.xOffset} ({x}px)
          <input
            type="range"
            min={-40}
            max={40}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="text-sm">
          {t.yOffset} ({y}px)
          <input
            type="range"
            min={-40}
            max={40}
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="text-sm">
          {t.blur} ({blur}px)
          <input
            type="range"
            min={0}
            max={80}
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="text-sm">
          {t.spread} ({spread}px)
          <input
            type="range"
            min={-40}
            max={40}
            value={spread}
            onChange={(e) => setSpread(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
          {t.insetShadow}
        </label>
      </div>

      <pre className="rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800">{css}</pre>

      <button
        type="button"
        onClick={() => void copy()}
        className="btn-secondary inline-flex items-center gap-2"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
