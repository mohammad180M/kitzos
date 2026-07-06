"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { canvasToBlob, setupCanvas } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { hexToRgb } from "@/lib/color-convert";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

function contrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#111827" : "#ffffff";
}

export default function LoremPicsumPlaceholder() {
  const t = useDevToolsExtraLabels("loremPicsumPlaceholder");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [color, setColor] = useState("#CCCCCC");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = Math.max(1, Math.min(4000, width));
    const h = Math.max(1, Math.min(4000, height));
    const ctx = setupCanvas(canvas, w, h);

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    const textColor = contrastColor(color);
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const label = `${w} × ${h}`;
    const fontSize = Math.max(14, Math.min(w, h) / 8);
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.fillText(label, w / 2, h / 2);
  }, [width, height, color]);

  useEffect(() => {
    draw();
  }, [draw]);

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, `placeholder-${width}x${height}.png`);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.hint}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.width}</span>
          <input
            type="number"
            min={1}
            max={4000}
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value, 10) || 1)}
            className="input-field mt-1 w-full"
            dir="ltr"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.height}</span>
          <input
            type="number"
            min={1}
            max={4000}
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value, 10) || 1)}
            className="input-field mt-1 w-full"
            dir="ltr"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.color}</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input-field ltr-input flex-1 font-mono uppercase"
              dir="ltr"
            />
          </div>
        </label>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.preview}</p>
        <div className="mt-2 overflow-auto rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <canvas ref={canvasRef} className="mx-auto max-w-full" />
        </div>
      </div>
      <button type="button" onClick={() => void download()} className="btn-secondary">
        <Download className="h-4 w-4" />
        {t.download}
      </button>
    </div>
  );
}
