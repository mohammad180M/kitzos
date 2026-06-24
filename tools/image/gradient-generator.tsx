"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

type GradientType = "linear" | "radial";

export default function GradientGenerator() {
  const labels = useCommonLabels();
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [colors, setColors] = useState(["#2563eb", "#7c3aed", "#ec4899"]);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => {
    const stops = colors.join(", ");
    if (type === "linear") {
      return `background: linear-gradient(${angle}deg, ${stops});`;
    }
    return `background: radial-gradient(circle, ${stops});`;
  }, [type, angle, colors]);

  const previewStyle = useMemo(() => {
    const stops = colors.join(", ");
    if (type === "linear") {
      return { background: `linear-gradient(${angle}deg, ${stops})` };
    }
    return { background: `radial-gradient(circle, ${stops})` };
  }, [type, angle, colors]);

  const updateColor = (index: number, value: string) => {
    setColors((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const addColor = () => {
    if (colors.length < 6) setColors((prev) => [...prev, "#10b981"]);
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="h-40 w-full rounded-xl border border-gray-200 shadow-inner dark:border-gray-700"
        style={previewStyle}
        aria-label="Gradient preview"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
          <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
            {(["linear", "radial"] as GradientType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  type === t
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {type === "linear" && (
          <div>
            <label htmlFor="angle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Angle: {angle}°
            </label>
            <input
              id="angle"
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Colors</p>
          {colors.length < 6 && (
            <button type="button" onClick={addColor} className="btn-secondary py-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add color
            </button>
          )}
        </div>
        <div className="mt-2 space-y-2">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
                aria-label={`Color ${index + 1}`}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
                className="input-field font-mono text-sm"
              />
              {colors.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                  aria-label={`Remove color ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="css-output" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          CSS
        </label>
        <textarea
          id="css-output"
          value={css}
          readOnly
          rows={2}
          className="input-field mt-1 resize-none font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
        />
        <button type="button" onClick={copy} className="btn-secondary mt-2">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              {labels.copied}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy CSS
            </>
          )}
        </button>
      </div>
    </div>
  );
}
