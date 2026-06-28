"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { getToolSlugFromPath, toolImageSessionKey } from "@/lib/hooks/use-tool-draft";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";

const MAX_PREVIEW = 600;
const SHADOW_OFFSET = 8;

export default function ImageBorderAdder() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageBorderAdder");
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imgRef, inputRef, hasImage, imageVersion, error, setError, handleInputChange } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );
  const [borderWidth, setBorderWidth] = useState(16);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [padding, setPadding] = useState(0);
  const [shadow, setShadow] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(12);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const getOutputSize = useCallback(
    (img: HTMLImageElement) => {
      const shadowExtra = shadow ? shadowBlur + SHADOW_OFFSET : 0;
      const frameW = img.naturalWidth + (borderWidth + padding) * 2;
      const frameH = img.naturalHeight + (borderWidth + padding) * 2;
      return {
        width: frameW + shadowExtra,
        height: frameH + shadowExtra,
        frameW,
        frameH,
      };
    },
    [borderWidth, padding, shadow, shadowBlur]
  );

  const drawBordered = useCallback(
    (ctx: CanvasRenderingContext2D, img: HTMLImageElement, scale: number) => {
      const natW = img.naturalWidth * scale;
      const natH = img.naturalHeight * scale;
      const bw = borderWidth * scale;
      const pad = padding * scale;
      const frameW = natW + (bw + pad) * 2;
      const frameH = natH + (bw + pad) * 2;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (shadow) {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = shadowBlur * scale;
        ctx.shadowOffsetX = SHADOW_OFFSET * scale;
        ctx.shadowOffsetY = SHADOW_OFFSET * scale;
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, frameW, frameH);
        ctx.restore();
      } else {
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, frameW, frameH);
      }

      ctx.drawImage(img, bw + pad, bw + pad, natW, natH);
    },
    [borderWidth, borderColor, padding, shadow, shadowBlur]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const { width: outW, height: outH } = getOutputSize(img);
    const scale = Math.min(1, MAX_PREVIEW / Math.max(outW, outH));
    const dispW = Math.round(outW * scale);
    const dispH = Math.round(outH * scale);

    const ctx = setupCanvas(canvas, dispW, dispH);
    drawBordered(ctx, img, scale);
  }, [drawBordered, getOutputSize]);

  useEffect(() => {
    if (hasImage) render();
  }, [hasImage, imageVersion, render]);

  const exportPng = async () => {
    const img = imgRef.current;
    if (!img) return;

    const { width: outW, height: outH } = getOutputSize(img);

    const off = document.createElement("canvas");
    const ctx = setupCanvas(off, outW, outH);
    drawBordered(ctx, img, 1);

    try {
      const blob = await canvasToBlob(off);
      downloadBlob(blob, "bordered.png");
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
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.preview}</p>
            <canvas
              ref={canvasRef}
              className="mx-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.borderWidth}: {borderWidth}px
              </span>
              <input
                type="range"
                min={0}
                max={80}
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
                className="mt-2 w-full accent-primary-600"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.padding}: {padding}px
              </span>
              <input
                type="range"
                min={0}
                max={48}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="mt-2 w-full accent-primary-600"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.borderColor}</span>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => setShadow(e.target.checked)}
                  className="accent-primary-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.shadow}</span>
              </label>

              {shadow && (
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.shadowBlur}: {shadowBlur}px
                  </span>
                  <input
                    type="range"
                    min={4}
                    max={40}
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(Number(e.target.value))}
                    className="mt-2 w-full accent-primary-600"
                  />
                </label>
              )}
            </div>
          </div>

          <button type="button" onClick={() => void exportPng()} className="btn-primary inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            {common.download}
          </button>
        </>
      )}
    </div>
  );
}
