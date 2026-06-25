"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

export default function GlassmorphismGenerator() {
  const labels = useCommonLabels();
  const [blur, setBlur] = useState(16);
  const [opacity, setOpacity] = useState(0.25);
  const [border, setBorder] = useState(1);
  const [bg, setBg] = useState("#667eea");
  const [copied, setCopied] = useState(false);

  const css = useMemo(
    () =>
      `background: rgba(255, 255, 255, ${opacity});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: ${border}px solid rgba(255, 255, 255, 0.3);\nborder-radius: 16px;`,
    [blur, opacity, border]
  );

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div
        className="flex min-h-[200px] items-center justify-center rounded-xl p-8"
        style={{ background: `linear-gradient(135deg, ${bg}, #764ba2)` }}
      >
        <div
          className="rounded-2xl px-8 py-6 text-center text-white"
          style={{
            background: `rgba(255,255,255,${opacity})`,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            border: `${border}px solid rgba(255,255,255,0.3)`,
          }}
        >
          <p className="text-lg font-semibold">Glass card</p>
          <p className="text-sm opacity-90">Live preview</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Blur ({blur}px)
          <input type="range" min={4} max={40} value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm">Opacity ({opacity})
          <input type="range" min={0.05} max={0.6} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm">Border ({border}px)
          <input type="range" min={0} max={4} value={border} onChange={(e) => setBorder(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm">Backdrop gradient
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="mt-1 h-10 w-full" />
        </label>
      </div>

      <pre className="rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">{css}</pre>

      <button type="button" onClick={() => void copy()} className="btn-secondary inline-flex items-center gap-2">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
