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

type PixelMode = "full" | "region";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function pixelateRect(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
  block: number
) {
  const sw = Math.max(1, Math.floor(destW / block));
  const sh = Math.max(1, Math.floor(destH / block));
  const small = document.createElement("canvas");
  small.width = sw;
  small.height = sh;
  const sctx = small.getContext("2d");
  if (!sctx) return;
  sctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, sw, sh);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, sw, sh, destX, destY, destW, destH);
}

export default function PixelateImage() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("pixelateImage");
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imgRef, inputRef, hasImage, imageVersion, error, handleInputChange } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [pixelSize, setPixelSize] = useState(12);
  const [mode, setMode] = useState<PixelMode>("full");
  const [region, setRegion] = useState<Rect | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [displayScale, setDisplayScale] = useState(1);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    setDisplayScale(scale);
    const w = Math.round(natW * scale);
    const h = Math.round(natH * scale);

    const ctx = setupCanvas(canvas, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const block = Math.max(2, pixelSize);

    if (mode === "full") {
      pixelateRect(ctx, img, 0, 0, w, h, block);
    } else if (region && region.w > 2 && region.h > 2) {
      pixelateRect(ctx, img, region.x, region.y, region.w, region.h, block);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(region.x, region.y, region.w, region.h);
      ctx.setLineDash([]);
    }
  }, [pixelSize, mode, region, imgRef]);

  useEffect(() => {
    if (hasImage) {
      setRegion(null);
      render();
    }
  }, [hasImage, imageVersion, render]);

  useEffect(() => {
    if (hasImage) render();
  }, [pixelSize, mode, region, hasImage, render]);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "region") return;
    const p = pointerPos(e);
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragStart(p);
    setRegion({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStart || mode !== "region") return;
    const p = pointerPos(e);
    if (!p) return;
    const x = Math.min(dragStart.x, p.x);
    const y = Math.min(dragStart.y, p.y);
    const w = Math.abs(p.x - dragStart.x);
    const h = Math.abs(p.y - dragStart.y);
    setRegion({ x, y, w, h });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    setDragStart(null);
  };

  const exportPng = async () => {
    const img = imgRef.current;
    if (!img) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const block = Math.max(2, pixelSize);

    const off = document.createElement("canvas");
    off.width = natW;
    off.height = natH;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, natW, natH);

    if (mode === "full") {
      pixelateRect(ctx, img, 0, 0, natW, natH, block);
    } else if (region && region.w > 0 && region.h > 0) {
      const rx = Math.round(region.x / displayScale);
      const ry = Math.round(region.y / displayScale);
      const rw = Math.round(region.w / displayScale);
      const rh = Math.round(region.h / displayScale);
      pixelateRect(ctx, img, rx, ry, rw, rh, block);
    }

    try {
      const blob = await canvasToBlob(off);
      downloadBlob(blob, "pixelated.png");
    } catch {
      // ignored
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
          <div className="inline-flex gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
            {(["full", "region"] as PixelMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  if (m === "full") setRegion(null);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {m === "full" ? t.modeFull : t.modeRegion}
              </button>
            ))}
          </div>

          {mode === "region" && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.drawHint}</p>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.preview}</p>
            <canvas
              ref={canvasRef}
              className={`mx-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700 ${
                mode === "region" ? "cursor-crosshair touch-none" : ""
              }`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          {mode === "region" && region && (
            <button type="button" onClick={() => setRegion(null)} className="btn-secondary text-sm">
              {t.clearRegion}
            </button>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.pixelSize}: {pixelSize}px
            </span>
            <input
              type="range"
              min={4}
              max={64}
              value={pixelSize}
              onChange={(e) => setPixelSize(Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.hint}</p>
          </label>

          <button type="button" onClick={() => void exportPng()} className="btn-primary inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            {common.download}
          </button>
        </>
      )}
    </div>
  );
}
