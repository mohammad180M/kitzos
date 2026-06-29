"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

type Harmony = "complementary" | "analogous" | "triadic";

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function generatePalette(base: string, harmony: Harmony): string[] {
  const [h, s, l] = hexToHsl(base);
  if (harmony === "complementary") {
    return [base, hslToHex((h + 180) % 360, s, l)];
  }
  if (harmony === "analogous") {
    return [hslToHex((h - 30 + 360) % 360, s, l), base, hslToHex((h + 30) % 360, s, l)];
  }
  return [base, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
}

export default function ColorPaletteGenerator() {
  const labels = useCommonLabels();
  const t = useDevToolsExtraLabels("colorPaletteGenerator");
  const [base, setBase] = useState("#2563eb");
  const [harmony, setHarmony] = useState<Harmony>("complementary");
  const [copied, setCopied] = useState<string | null>(null);

  const colors = useMemo(() => generatePalette(base, harmony), [base, harmony]);

  const copy = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => void copy(c)}
            className="h-20 w-20 rounded-xl border-2 border-white shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <code key={c} className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">{c}</code>
        ))}
      </div>

      <label className="block text-sm">
        {t.baseColor}
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="mt-1 h-10 w-full max-w-xs" />
      </label>

      <div>
        <p className="text-sm font-medium">{t.harmony}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {(["complementary", "analogous", "triadic"] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHarmony(h)}
              className={`rounded px-3 py-1 text-sm capitalize ${harmony === h ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
            >
              {t.harmonies[h]}
            </button>
          ))}
        </div>
      </div>

      {copied && (
        <p className="text-sm text-green-600 dark:text-green-400 inline-flex items-center gap-1">
          <Check className="h-4 w-4" /> {labels.copied}: {copied}
        </p>
      )}
    </div>
  );
}
