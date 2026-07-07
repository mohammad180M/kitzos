"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Trash2, Upload } from "lucide-react";
import { canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import {
  applyRegionsToCanvas,
  naturalPixelSize,
  outlineRegion,
  type BlurRegion,
} from "@/lib/image/blur-regions";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { getToolSlugFromPath, toolImageSessionKey } from "@/lib/hooks/use-tool-draft";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";

const MAX_PREVIEW = 600;

type EffectMode = "blur" | "pixelate";

type RatioRect = { x: number; y: number; w: number; h: number };

function nextRegionId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function pointerToRatio(e: React.PointerEvent<HTMLCanvasElement>): RatioRect | null {
  const canvas = e.currentTarget;
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: (e.clientX - rect.left) / rect.width,
    y: (e.clientY - rect.top) / rect.height,
    w: 0,
    h: 0,
  };
}

function rectFromDrag(start: RatioRect, end: RatioRect): RatioRect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(end.x - start.x);
  const h = Math.abs(end.y - start.y);
  return { x, y, w, h };
}

export default function BlurImage() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("blurImage");
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imgRef, inputRef, hasImage, imageVersion, error, setError, handleInputChange } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [sourceMime, setSourceMime] = useState("image/png");
  const [mode, setMode] = useState<EffectMode>("pixelate");
  const [intensity, setIntensity] = useState(16);
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [draft, setDraft] = useState<RatioRect | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<RatioRect | null>(null);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSourceMime(file.type || "image/png");
    handleInputChange(e, messages);
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    const w = Math.round(natW * scale);
    const h = Math.round(natH * scale);

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    applyRegionsToCanvas(canvas, img, regions, mode, intensity, natW, natH);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (const region of regions) {
      outlineRegion(ctx, region, w, h);
    }
    if (draft && draft.w > 0 && draft.h > 0) {
      outlineRegion(ctx, { id: "draft", ...draft }, w, h);
    }
  }, [regions, draft, mode, intensity, imgRef]);

  useEffect(() => {
    setRegions([]);
    setDraft(null);
  }, [imageVersion]);

  useEffect(() => {
    if (hasImage) render();
  }, [hasImage, imageVersion, regions, draft, mode, intensity, render]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = pointerToRatio(e);
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragStart(p);
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStart) return;
    const p = pointerToRatio(e);
    if (!p) return;
    setDraft(rectFromDrag(dragStart, p));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStart) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const p = pointerToRatio(e);
    setDragging(false);
    const start = dragStart;
    setDragStart(null);
    setDraft(null);
    if (!p) return;
    const rect = rectFromDrag(start, p);
    if (rect.w > 0.002 && rect.h > 0.002) {
      setRegions((prev) => [...prev, { id: nextRegionId(), ...rect }]);
    }
  };

  const removeRegion = (id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
  };

  const exportImage = async () => {
    const img = imgRef.current;
    if (!img) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    const off = document.createElement("canvas");
    off.width = natW;
    off.height = natH;

    applyRegionsToCanvas(off, img, regions, mode, intensity, natW, natH);

    const isJpeg = sourceMime === "image/jpeg" || sourceMime === "image/jpg";
    const mime = isJpeg ? "image/jpeg" : "image/png";
    const ext = isJpeg ? "jpg" : "png";

    try {
      const blob = isJpeg
        ? await new Promise<Blob>((resolve, reject) => {
            off.toBlob((b) => (b ? resolve(b) : reject(new Error("export"))), mime, 0.92);
          })
        : await canvasToBlob(off, mime);
      downloadBlob(blob, `redacted.${ext}`);
    } catch {
      setError(shared.canvasNotSupported);
    }
  };

  const intensityMin = mode === "blur" ? 2 : 8;
  const intensityMax = mode === "blur" ? 40 : 64;

  const switchMode = (next: EffectMode) => {
    setMode(next);
    setIntensity(next === "blur" ? 12 : 16);
  };

  const img = imgRef.current;
  const natW = img?.naturalWidth ?? 0;
  const natH = img?.naturalHeight ?? 0;

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
          onChange={onFileChange}
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
            {(["pixelate", "blur"] as EffectMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {m === "blur" ? t.modeBlur : t.modePixelate}
              </button>
            ))}
          </div>

          <p className="text-xs text-amber-700 dark:text-amber-300">{t.redactionHint}</p>

          <p className="text-xs text-gray-500 dark:text-gray-400">{t.drawHint}</p>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.preview}</p>
            <canvas
              ref={canvasRef}
              className="mx-auto max-w-full cursor-crosshair touch-none rounded-lg border border-gray-200 dark:border-gray-700"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          {regions.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.regions}</p>
              <ul className="space-y-2">
                {regions.map((region, index) => {
                  const { w, h } = naturalPixelSize(region, natW, natH);
                  return (
                    <li
                      key={region.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t.regionItem(index + 1)} — {w} × {h} px
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRegion(region.id)}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        aria-label={t.deleteRegion}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t.deleteRegion}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "blur" ? t.intensityBlur(intensity) : t.intensityPixelate(intensity)}
            </span>
            <input
              type="range"
              min={intensityMin}
              max={intensityMax}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
          </label>

          <button type="button" onClick={() => void exportImage()} className="btn-primary inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            {common.download}
          </button>
        </>
      )}
    </div>
  );
}
