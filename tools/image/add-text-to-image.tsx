"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { getToolSlugFromPath, toolImageSessionKey, useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";

const MAX_WIDTH = 700;

type TextPosition = "top" | "center" | "bottom";

export default function AddTextToImage() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("addTextToImage");
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imgRef, inputRef, hasImage, imageVersion, error, setError, handleInputChange } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [text, setText] = useToolDraft("text", "");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [position, setPosition] = useState<TextPosition>("bottom");

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const ctx = setupCanvas(canvas, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    if (!text.trim()) return;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeEnabled ? Math.max(2, fontSize / 12) : 0;

    let y = fontSize + 8;
    if (position === "center") y = h / 2 + fontSize / 3;
    if (position === "bottom") y = h - 16;

    const x = w / 2;
    if (strokeEnabled) ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }, [text, fontSize, color, strokeEnabled, strokeColor, position, imgRef]);

  useEffect(() => {
    if (hasImage) render();
  }, [text, fontSize, color, strokeEnabled, strokeColor, position, hasImage, imageVersion, render]);

  const exportPng = async () => {
    render();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob, "text-overlay.png");
    } catch {
      setError(shared.canvasNotSupported);
    }
  };

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
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.uploadImage}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleInputChange(e, messages)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {hasImage && (
        <canvas
          ref={canvasRef}
          className="mx-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700"
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.text}</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.textPlaceholder}
            className="input-field mt-1 w-full"
            disabled={!hasImage}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.fontSize}: {fontSize}px
          </span>
          <input
            type="range"
            min={12}
            max={120}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="mt-2 w-full accent-primary-600"
            disabled={!hasImage}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.color}</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            disabled={!hasImage}
          />
        </label>

        <div className="block sm:col-span-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.position}</span>
          <div className="mt-1 inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
            {(["top", "center", "bottom"] as TextPosition[]).map((pos) => (
              <button
                key={pos}
                type="button"
                disabled={!hasImage}
                onClick={() => setPosition(pos)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  position === pos
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {pos === "top" ? t.posTop : pos === "center" ? t.posCenter : t.posBottom}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={strokeEnabled}
            onChange={(e) => setStrokeEnabled(e.target.checked)}
            disabled={!hasImage}
            className="accent-primary-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{t.stroke}</span>
        </label>

        {strokeEnabled && (
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.strokeColor}</span>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              disabled={!hasImage}
            />
          </label>
        )}
      </div>

      <button
        type="button"
        onClick={() => void exportPng()}
        disabled={!hasImage}
        className="btn-primary inline-flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {common.download}
      </button>
    </div>
  );
}
