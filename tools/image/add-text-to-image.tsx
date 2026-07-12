"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Plus, Trash2, Upload } from "lucide-react";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { getToolSlugFromPath, toolImageSessionKey } from "@/lib/hooks/use-tool-draft";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { TEXT_OVERLAY_FONTS } from "@/lib/image/text-overlay-fonts";
import {
  MAX_TEXT_LAYERS,
  clamp,
  clampLayerPosition,
  createTextLayer,
  drawAllTextLayers,
  layerHasArabic,
  measureTextLayerBox,
  nudgeLayerPosition,
  sanitizeLayerPatch,
  type TextOverlayLayer,
} from "@/lib/image/text-overlay-layers";

const MAX_PREVIEW = 700;
const NUDGE_STEP = 0.01;

function layerStyleFrom(
  layer: TextOverlayLayer
): Omit<TextOverlayLayer, "id" | "text" | "xRatio" | "yRatio"> {
  return {
    fontSize: layer.fontSize,
    fontFamily: layer.fontFamily,
    curvature: layer.curvature,
    color: layer.color,
    strokeEnabled: layer.strokeEnabled,
    strokeColor: layer.strokeColor,
  };
}

export default function AddTextToImage() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("addTextToImage");
  const { locale } = useLocale();
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{
    layerId: string;
    pointerId: number;
    grabX: number;
    grabY: number;
  } | null>(null);

  const { imgRef, inputRef, hasImage, imageVersion, error, setError, handleInputChange } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [layers, setLayers] = useState<TextOverlayLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 });

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const selectedLayer = useMemo(
    () => (selectedId ? layers.find((l) => l.id === selectedId) ?? null : null),
    [layers, selectedId]
  );

  const getMeasureCtx = useCallback(() => {
    if (!measureCanvasRef.current) {
      measureCanvasRef.current = document.createElement("canvas");
    }
    return measureCanvasRef.current.getContext("2d");
  }, []);

  const makeDefaultLayer = useCallback(
    (style?: Partial<TextOverlayLayer>) =>
      createTextLayer(
        {
          text: t.newLayerDefault,
          xRatio: 0.5,
          yRatio: 0.5,
          ...style,
        },
        locale
      ),
    [locale, t.newLayerDefault]
  );

  useEffect(() => {
    const initial = makeDefaultLayer();
    setLayers([initial]);
    setSelectedId(initial.id);
  }, [imageVersion, makeDefaultLayer]);

  const updateLayer = useCallback(
    (id: string, patch: Partial<TextOverlayLayer>) => {
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== id) return layer;
          const next = { ...layer, ...sanitizeLayerPatch(layer, patch) };
          const img = imgRef.current;
          const ctx = getMeasureCtx();
          if (img?.naturalWidth && ctx) {
            const box = measureTextLayerBox(ctx, next, next.fontSize);
            const clamped = clampLayerPosition(
              next.xRatio,
              next.yRatio,
              box.width,
              box.height,
              img.naturalWidth,
              img.naturalHeight
            );
            return { ...next, ...clamped };
          }
          return next;
        })
      );
    },
    [getMeasureCtx, imgRef]
  );

  const renderPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    const w = Math.round(natW * scale);
    const h = Math.round(natH * scale);
    setPreviewSize({ w, h });

    const ctx = setupCanvas(canvas, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    await drawAllTextLayers(ctx, layers, w, h, scale);
  }, [imgRef, layers]);

  useEffect(() => {
    if (!hasImage) return;
    let cancelled = false;
    void renderPreview().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [hasImage, imageVersion, layers, renderPreview]);

  const previewScale =
    previewSize.w > 0 && imgRef.current?.naturalWidth
      ? previewSize.w / imgRef.current.naturalWidth
      : 1;

  const clampDragPosition = useCallback(
    (layer: TextOverlayLayer, xRatio: number, yRatio: number) => {
      const img = imgRef.current;
      const ctx = getMeasureCtx();
      if (!img?.naturalWidth || !ctx) {
        return { xRatio: clamp(xRatio, 0, 1), yRatio: clamp(yRatio, 0, 1) };
      }
      const box = measureTextLayerBox(ctx, layer, layer.fontSize);
      return clampLayerPosition(xRatio, yRatio, box.width, box.height, img.naturalWidth, img.naturalHeight);
    },
    [getMeasureCtx, imgRef]
  );

  const onOverlayPointerDown = (e: React.PointerEvent) => {
    if (e.target === overlayRef.current) {
      setSelectedId(null);
    }
  };

  const onPointerDownLayer = (layerId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedId(layerId);
    setDraggingId(layerId);
    const overlay = overlayRef.current;
    const layer = layers.find((l) => l.id === layerId);
    if (!overlay || !layer) return;

    const rect = overlay.getBoundingClientRect();
    const overlayLeft = layer.xRatio * rect.width;
    const overlayTop = layer.yRatio * rect.height;
    dragRef.current = {
      layerId,
      pointerId: e.pointerId,
      grabX: e.clientX - rect.left - overlayLeft,
      grabY: e.clientY - rect.top - overlayTop,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const overlay = overlayRef.current;
    if (!drag || !overlay || drag.pointerId !== e.pointerId) return;

    const layer = layers.find((l) => l.id === drag.layerId);
    if (!layer) return;

    const rect = overlay.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const rawX = (e.clientX - rect.left - drag.grabX) / rect.width;
    const rawY = (e.clientY - rect.top - drag.grabY) / rect.height;
    const clamped = clampDragPosition(layer, rawX, rawY);
    updateLayer(drag.layerId, clamped);
  };

  const endDrag = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDraggingId(null);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    if (!hasImage) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable) {
        return;
      }

      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }

      if (!selectedLayer) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;

      e.preventDefault();
      const img = imgRef.current;
      const ctx = getMeasureCtx();
      if (!img?.naturalWidth || !ctx) return;

      const dx = e.key === "ArrowLeft" ? -NUDGE_STEP : e.key === "ArrowRight" ? NUDGE_STEP : 0;
      const dy = e.key === "ArrowUp" ? -NUDGE_STEP : e.key === "ArrowDown" ? NUDGE_STEP : 0;
      const nudged = nudgeLayerPosition(
        selectedLayer,
        dx,
        dy,
        img.naturalWidth,
        img.naturalHeight,
        ctx
      );
      updateLayer(selectedLayer.id, nudged);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedLayer, hasImage, getMeasureCtx, imgRef, updateLayer]);

  const addLayer = () => {
    if (layers.length >= MAX_TEXT_LAYERS) return;
    const style = selectedLayer ? layerStyleFrom(selectedLayer) : undefined;
    const layer = makeDefaultLayer(style);
    setLayers((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  };

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };

  const exportPng = async () => {
    const img = imgRef.current;
    if (!img?.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const off = document.createElement("canvas");
    off.width = natW;
    off.height = natH;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, natW, natH);
    await drawAllTextLayers(ctx, layers, natW, natH, 1);

    try {
      const blob = await canvasToBlob(off);
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
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-surface-2 px-6 py-10 transition-colors hover:border-accent hover:bg-surface"
      >
        <Upload className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-foreground">{shared.uploadImage}</p>
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
            <p className="mb-2 text-sm font-medium text-foreground">{shared.preview}</p>
            <div className="relative mx-auto inline-block max-w-full">
              <canvas
                ref={canvasRef}
                className="block max-w-full rounded-lg border border-line"
              />
              {previewSize.w > 0 && (
                <div
                  ref={overlayRef}
                  className="absolute inset-0 touch-none"
                  style={{ width: previewSize.w, height: previewSize.h }}
                  onPointerDown={onOverlayPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerLeave={endDrag}
                >
                  {layers.map((layer) => {
                    if (!layer.text.trim()) return null;
                    const isActive = layer.id === selectedId || layer.id === draggingId;
                    const previewFontSize = Math.max(8, Math.round(layer.fontSize * previewScale));
                    const ctx = getMeasureCtx();
                    const box = ctx
                      ? measureTextLayerBox(ctx, layer, previewFontSize)
                      : { width: previewFontSize * 4, height: previewFontSize };

                    return (
                      <div
                        key={layer.id}
                        role="button"
                        tabIndex={0}
                        onPointerDown={(e) => onPointerDownLayer(layer.id, e)}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setSelectedId(layer.id);
                        }}
                        className={`absolute cursor-move rounded-sm ${
                          isActive ? "ring-2 ring-accent ring-offset-1 ring-offset-transparent" : ""
                        }`}
                        style={{
                          left: `${layer.xRatio * 100}%`,
                          top: `${layer.yRatio * 100}%`,
                          width: Math.max(box.width, 24),
                          height: Math.max(box.height, 20),
                          transform: "translate(-50%, -50%)",
                        }}
                        aria-label={t.layerPreview(layer.text)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{t.dragHint}</p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{t.layers}</span>
              <button
                type="button"
                onClick={addLayer}
                disabled={layers.length >= MAX_TEXT_LAYERS}
                className="btn-secondary inline-flex items-center gap-1.5 py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.addLayer}
              </button>
            </div>
            {layers.length >= MAX_TEXT_LAYERS && (
              <p className="text-xs text-muted">{t.maxLayers}</p>
            )}
            <ul className="space-y-1">
              {layers.map((layer) => {
                const isSelected = layer.id === selectedId;
                return (
                  <li key={layer.id}>
                    <div
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? "border-accent bg-surface-2 text-foreground"
                          : "border-line bg-surface text-secondary hover:bg-surface-2"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(layer.id)}
                        className="min-w-0 flex-1 truncate text-start"
                      >
                        {t.layerPreview(layer.text)}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLayer(layer.id)}
                        disabled={layers.length <= 1}
                        className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40"
                        aria-label={t.deleteLayer}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedLayer && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-foreground">{t.text}</span>
                <input
                  value={selectedLayer.text}
                  onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                  placeholder={t.textPlaceholder}
                  dir="auto"
                  className="input-field mt-1 w-full"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-foreground">{t.fontFamily}</span>
                <select
                  value={selectedLayer.fontFamily}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, {
                      fontFamily: e.target.value as TextOverlayLayer["fontFamily"],
                    })
                  }
                  className="input-field mt-1 w-full"
                >
                  {TEXT_OVERLAY_FONTS.map((font) => (
                    <option key={font.id} value={font.id} style={{ fontFamily: font.cssFamily }}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">{t.fontSizeLabel(selectedLayer.fontSize)}</span>
                <input
                  type="range"
                  min={12}
                  max={120}
                  value={selectedLayer.fontSize}
                  onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                  className="input-range"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  {t.curvatureLabel(selectedLayer.curvature)}
                </span>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={layerHasArabic(selectedLayer.text) ? 0 : selectedLayer.curvature}
                  disabled={layerHasArabic(selectedLayer.text)}
                  onChange={(e) => updateLayer(selectedLayer.id, { curvature: Number(e.target.value) })}
                  className="input-range disabled:opacity-50"
                />
                {layerHasArabic(selectedLayer.text) && (
                  <p className="mt-1 text-xs text-muted">{t.curvatureArabicNote}</p>
                )}
              </label>

              <div className="block">
                <span className="text-sm font-medium text-foreground">{t.color}</span>
                <label className="color-swatch">
                  <div className="color-swatch__fill" style={{ backgroundColor: selectedLayer.color }} />
                  <input
                    type="color"
                    value={selectedLayer.color}
                    onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={selectedLayer.strokeEnabled}
                  onChange={(e) => updateLayer(selectedLayer.id, { strokeEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
                />
                <span className="text-sm text-foreground">{t.stroke}</span>
              </label>

              {selectedLayer.strokeEnabled && (
                <div className="block sm:col-span-2">
                  <span className="text-sm font-medium text-foreground">{t.strokeColor}</span>
                  <label className="color-swatch">
                    <div
                      className="color-swatch__fill"
                      style={{ backgroundColor: selectedLayer.strokeColor }}
                    />
                    <input
                      type="color"
                      value={selectedLayer.strokeColor}
                      onChange={(e) => updateLayer(selectedLayer.id, { strokeColor: e.target.value })}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <button type="button" onClick={() => void exportPng()} className="btn-primary inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            {common.download}
          </button>
        </>
      )}
    </div>
  );
}
