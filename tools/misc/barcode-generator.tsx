"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { useMiscToolsExtraLabels } from "@/lib/i18n/use-misc-tools-extra-labels";

type BarcodeFormat = "CODE128" | "EAN13" | "UPC" | "CODE39";
type RenderMode = "svg" | "canvas";

const FORMATS: BarcodeFormat[] = ["CODE128", "EAN13", "UPC", "CODE39"];

export default function BarcodeGenerator() {
  const t = useMiscToolsExtraLabels("barcodeGenerator");
  const [text, setText] = useState("123456789012");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [renderMode, setRenderMode] = useState<RenderMode>("svg");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderBarcode() {
      if (!text.trim()) {
        setError(null);
        setReady(false);
        return;
      }

      const target = renderMode === "svg" ? svgRef.current : canvasRef.current;
      if (!target) return;

      if (renderMode === "svg" && svgRef.current) {
        while (svgRef.current.firstChild) svgRef.current.removeChild(svgRef.current.firstChild);
      }

      try {
        const JsBarcode = (await import("jsbarcode")).default;
        if (cancelled) return;
        JsBarcode(target, text, {
          format,
          displayValue: true,
          margin: 10,
          width: 2,
          height: 80,
        });
        setError(null);
        setReady(true);
      } catch {
        if (!cancelled) {
          setError(t.invalid);
          setReady(false);
        }
      }
    }

    renderBarcode();
    return () => {
      cancelled = true;
    };
  }, [text, format, renderMode, t.invalid]);

  const downloadPng = useCallback(() => {
    if (!ready) return;

    const save = (dataUrl: string) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "barcode.png";
      a.click();
    };

    if (renderMode === "canvas" && canvasRef.current) {
      save(canvasRef.current.toDataURL("image/png"));
      return;
    }

    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        save(canvas.toDataURL("image/png"));
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [ready, renderMode]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.text}</span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          className="input-field mt-1 w-full font-mono"
          dir="ltr"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.format}</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
            className="input-field mt-1 w-full"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {t.formats[f]}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.renderAs}</span>
          <div className="mt-1 flex gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
            {(["svg", "canvas"] as RenderMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setRenderMode(mode)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  renderMode === mode
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {mode === "svg" ? t.svg : t.canvas}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-center rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        {renderMode === "svg" ? (
          <svg ref={svgRef} role="img" aria-label={t.preview} className="max-w-full" />
        ) : (
          <canvas ref={canvasRef} aria-label={t.preview} className="max-w-full" />
        )}
      </div>

      <button type="button" onClick={downloadPng} disabled={!ready} className="btn-primary">
        <Download className="h-4 w-4" />
        {t.downloadPng}
      </button>
    </div>
  );
}
