"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Check, Copy, Upload } from "lucide-react";
import { setupCanvas } from "@/lib/canvas-utils";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { rgbToHex, rgbToHsl, type RgbColor } from "@/lib/image/color-format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

const MAX_PREVIEW = 600;
const MAX_HISTORY = 12;

function formatRgb({ r, g, b }: RgbColor): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function formatHsl(color: RgbColor): string {
  const { h, s, l } = rgbToHsl(color);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function colorsEqual(a: RgbColor, b: RgbColor): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

export default function ImageColorPicker() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageColorPicker");
  const { locale } = useLocale();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imgRef, inputRef, hasImage, imageVersion, error, handleInputChange } = useImageLoader();

  const [picked, setPicked] = useState<RgbColor | null>(null);
  const [history, setHistory] = useState<RgbColor[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useUnsavedWork(hasImage);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    const dispW = Math.round(natW * scale);
    const dispH = Math.round(natH * scale);

    const ctx = setupCanvas(canvas, dispW, dispH);
    ctx.clearRect(0, 0, dispW, dispH);
    ctx.drawImage(img, 0, 0, dispW, dispH);
  }, [imgRef]);

  useEffect(() => {
    if (hasImage) render();
  }, [hasImage, imageVersion, render]);

  const addToHistory = (color: RgbColor) => {
    setHistory((prev) => {
      const filtered = prev.filter((c) => !colorsEqual(c, color));
      return [color, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const pickAt = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    const { data } = ctx.getImageData(x, y, 1, 1);
    const color: RgbColor = { r: data[0], g: data[1], b: data[2] };
    setPicked(color);
    addToHistory(color);
  };

  const copy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignored
    }
  };

  const hexValue = picked ? rgbToHex(picked) : "—";
  const rgbValue = picked ? formatRgb(picked) : "—";
  const hslValue = picked ? formatHsl(picked) : "—";

  const colorRows = [
    { key: "hex", label: t.hex, value: hexValue },
    { key: "rgb", label: t.rgb, value: rgbValue },
    { key: "hsl", label: t.hsl, value: hslValue },
  ];

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/30"
      >
        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.uploadHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            setPicked(null);
            setHistory([]);
            handleInputChange(e, messages);
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {hasImage && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.pickHint}</p>
            <canvas
              ref={canvasRef}
              onClick={pickAt}
              className="mx-auto max-w-full cursor-crosshair rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: picked ? rgbToHex(picked) : "transparent" }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 space-y-2">
              {colorRows.map((row) => (
                <div key={row.key} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {row.label}
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={row.value}
                    className="input-field ltr-input min-w-0 flex-1 font-mono text-sm"
                  />
                  <button
                    type="button"
                    disabled={!picked}
                    onClick={() => copy(row.key, row.value)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    aria-label={`${common.copy} ${row.label}`}
                  >
                    {copiedField === row.key ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.history}</p>
              <div className="flex flex-wrap gap-2">
                {history.map((color, i) => {
                  const hex = rgbToHex(color);
                  const selected = picked !== null && colorsEqual(picked, color);
                  return (
                    <button
                      key={`${hex}-${i}`}
                      type="button"
                      onClick={() => setPicked(color)}
                      className={`h-9 w-9 rounded-lg border-2 transition-transform hover:scale-105 ${
                        selected
                          ? "border-primary-500 ring-2 ring-primary-300 dark:ring-primary-600"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={hex}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          href={`/${locale}/tools/color-picker`}
          className="text-primary-600 hover:underline dark:text-primary-400"
        >
          {t.colorToolsLink}
        </Link>
      </p>
    </div>
  );
}
