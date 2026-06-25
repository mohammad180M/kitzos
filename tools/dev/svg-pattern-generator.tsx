"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

type PatternType = "dots" | "lines" | "grid";

export default function SvgPatternGenerator() {
  const labels = useCommonLabels();
  const [type, setType] = useState<PatternType>("dots");
  const [color, setColor] = useState("#2563eb");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(20);
  const [copied, setCopied] = useState(false);

  const svg = useMemo(() => {
    let inner = "";
    if (type === "dots") {
      inner = `<circle cx="${size / 2}" cy="${size / 2}" r="3" fill="${color}"/>`;
    } else if (type === "lines") {
      inner = `<path d="M0 ${size} L${size} 0" stroke="${color}" stroke-width="2"/>`;
    } else {
      inner = `<path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-width="1"/>`;
    }
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }, [type, color, size]);

  const css = `background-color: ${bg};\nbackground-image: url("data:image/svg+xml,${encodeURIComponent(svg)}");`;

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div
        className="h-40 rounded-xl border dark:border-gray-700"
        style={{
          backgroundColor: bg,
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium">Pattern</p>
          <div className="mt-1 flex gap-1">
            {(["dots", "lines", "grid"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded px-3 py-1 text-sm capitalize ${type === t ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <label className="text-sm">
          Tile size
          <input type="number" min={8} max={80} value={size} onChange={(e) => setSize(Number(e.target.value))} className="input-field mt-1" />
        </label>
        <label className="text-sm">
          Pattern color
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full" />
        </label>
        <label className="text-sm">
          Background
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 h-10 w-full" />
        </label>
      </div>

      <pre className="overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">{css}</pre>

      <button type="button" onClick={() => void copy()} className="btn-secondary inline-flex items-center gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
