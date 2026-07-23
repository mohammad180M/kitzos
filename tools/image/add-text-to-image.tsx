"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Plus, Trash2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
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
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";

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
  const [mode, setMode] = useState<ToolMode>("single");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const batchCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const batchOverlayRef = useRef<HTMLDivElement>(null);
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const batchImgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    layerId: string;
    pointerId: number;
    grabX: number;
    grabY: number;
    overlay: "single" | "batch";
  } | null>(null);

  const { imgRef, hasImage, imageVersion, error, setError, loadFile } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [layers, setLayers] = useState<TextOverlayLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 });
  const [batchPreviewSize, setBatchPreviewSize] = useState({ w: 0, h: 0 });
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchName, setSelectedBatchName] = useState<string | null>(null);
  const [batchImageVersion, setBatchImageVersion] = useState(0);
  const layersBootstrapped = useRef(false);

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

  // Ensure at least one text layer exists (needed for batch before any single upload).
  useEffect(() => {
    if (layersBootstrapped.current) return;
    layersBootstrapped.current = true;
    const initial = makeDefaultLayer();
    setLayers([initial]);
    setSelectedId(initial.id);
  }, [makeDefaultLayer]);

  // Reset layers when a new single-file image is loaded.
  useEffect(() => {
    if (!imageVersion) return;
    const initial = makeDefaultLayer();
    setLayers([initial]);
    setSelectedId(initial.id);
  }, [imageVersion, makeDefaultLayer]);

  const updateLayer = useCallback(
    (id: string, patch: Partial<TextOverlayLayer>, natW?: number, natH?: number) => {
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== id) return layer;
          const next = { ...layer, ...sanitizeLayerPatch(layer, patch) };
          const img = imgRef.current;
          const batchImg = batchImgRef.current;
          const width = natW ?? (mode === "batch" ? batchImg?.naturalWidth : img?.naturalWidth);
          const height = natH ?? (mode === "batch" ? batchImg?.naturalHeight : img?.naturalHeight);
          const ctx = getMeasureCtx();
          if (width && height && ctx) {
            const box = measureTextLayerBox(ctx, next, next.fontSize);
            const clamped = clampLayerPosition(
              next.xRatio,
              next.yRatio,
              box.width,
              box.height,
              width,
              height
            );
            return { ...next, ...clamped };
          }
          return next;
        })
      );
    },
    [getMeasureCtx, imgRef, mode]
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

  const renderBatchPreview = useCallback(async () => {
    const canvas = batchCanvasRef.current;
    const img = batchImgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    const w = Math.round(natW * scale);
    const h = Math.round(natH * scale);
    setBatchPreviewSize({ w, h });

    const ctx = setupCanvas(canvas, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    await drawAllTextLayers(ctx, layers, w, h, scale);
  }, [layers]);

  useEffect(() => {
    if (!hasImage || mode !== "single") return;
    let cancelled = false;
    void renderPreview().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [hasImage, imageVersion, layers, renderPreview, mode]);

  useEffect(() => {
    if (mode !== "batch" || !batchImgRef.current) return;
    let cancelled = false;
    void renderBatchPreview().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [mode, batchImageVersion, layers, renderBatchPreview]);

  const previewScale =
    previewSize.w > 0 && imgRef.current?.naturalWidth
      ? previewSize.w / imgRef.current.naturalWidth
      : 1;

  const batchPreviewScale =
    batchPreviewSize.w > 0 && batchImgRef.current?.naturalWidth
      ? batchPreviewSize.w / batchImgRef.current.naturalWidth
      : 1;

  const activeNatSize = useCallback(() => {
    if (mode === "batch" && batchImgRef.current?.naturalWidth) {
      return {
        w: batchImgRef.current.naturalWidth,
        h: batchImgRef.current.naturalHeight,
      };
    }
    const img = imgRef.current;
    if (img?.naturalWidth) return { w: img.naturalWidth, h: img.naturalHeight };
    return null;
  }, [mode, imgRef]);

  const clampDragPosition = useCallback(
    (layer: TextOverlayLayer, xRatio: number, yRatio: number) => {
      const nat = activeNatSize();
      const ctx = getMeasureCtx();
      if (!nat || !ctx) {
        return { xRatio: clamp(xRatio, 0, 1), yRatio: clamp(yRatio, 0, 1) };
      }
      const box = measureTextLayerBox(ctx, layer, layer.fontSize);
      return clampLayerPosition(xRatio, yRatio, box.width, box.height, nat.w, nat.h);
    },
    [activeNatSize, getMeasureCtx]
  );

  const onOverlayPointerDown = (
    e: React.PointerEvent,
    overlay: HTMLDivElement | null
  ) => {
    if (e.target === overlay) {
      setSelectedId(null);
    }
  };

  const onPointerDownLayer = (
    layerId: string,
    e: React.PointerEvent,
    which: "single" | "batch"
  ) => {
    e.stopPropagation();
    setSelectedId(layerId);
    setDraggingId(layerId);
    const overlay = which === "batch" ? batchOverlayRef.current : overlayRef.current;
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
      overlay: which,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const overlay =
      drag.overlay === "batch" ? batchOverlayRef.current : overlayRef.current;
    if (!overlay) return;

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
    const previewActive =
      (mode === "single" && hasImage) || (mode === "batch" && Boolean(selectedBatchId));
    if (!previewActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }

      if (!selectedLayer) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;

      e.preventDefault();
      const nat = activeNatSize();
      const ctx = getMeasureCtx();
      if (!nat || !ctx) return;

      const dx = e.key === "ArrowLeft" ? -NUDGE_STEP : e.key === "ArrowRight" ? NUDGE_STEP : 0;
      const dy = e.key === "ArrowUp" ? -NUDGE_STEP : e.key === "ArrowDown" ? NUDGE_STEP : 0;
      const nudged = nudgeLayerPosition(selectedLayer, dx, dy, nat.w, nat.h, ctx);
      updateLayer(selectedLayer.id, nudged);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedLayer,
    hasImage,
    mode,
    selectedBatchId,
    getMeasureCtx,
    activeNatSize,
    updateLayer,
  ]);

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

  const processFile = useCallback(
    async (file: File): Promise<BatchOutput> => {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const im = new Image();
        im.onload = () => {
          URL.revokeObjectURL(url);
          resolve(im);
        };
        im.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error(shared.loadFailed));
        };
        im.src = url;
      });

      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      const off = document.createElement("canvas");
      off.width = natW;
      off.height = natH;
      const ctx = off.getContext("2d");
      if (!ctx) throw new Error("canvas not supported");

      ctx.drawImage(img, 0, 0, natW, natH);
      await drawAllTextLayers(ctx, layers, natW, natH, 1);

      const blob = await canvasToBlob(off);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      return { blob, name: `${baseName}-text.png` };
    },
    [layers, shared.loadFailed]
  );

  const clearBatchPreview = useCallback(() => {
    setSelectedBatchId(null);
    setSelectedBatchName(null);
    batchImgRef.current = null;
    setBatchPreviewSize({ w: 0, h: 0 });
    setBatchImageVersion((v) => v + 1);
  }, []);

  const onSelectBatchFile = useCallback(
    (f: File | null, id: string | null) => {
      if (!f || !id) {
        clearBatchPreview();
        return;
      }
      setSelectedBatchId(id);
      setSelectedBatchName(f.name);
      const url = URL.createObjectURL(f);
      const loadId = id;
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        setSelectedBatchId((current) => {
          if (current !== loadId) return current;
          batchImgRef.current = img;
          setBatchImageVersion((v) => v + 1);
          return current;
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setSelectedBatchId((current) => {
          if (current === loadId) clearBatchPreview();
          return current;
        });
      };
      img.src = url;
    },
    [clearBatchPreview]
  );

  const layersPanel = (
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
  );

  const selectedLayerEditor = selectedLayer ? (
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
        <span className="text-sm font-medium text-foreground">
          {t.fontSizeLabel(selectedLayer.fontSize)}
        </span>
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
  ) : null;

  const textHitOverlay = (
    which: "single" | "batch",
    size: { w: number; h: number },
    scale: number,
    overlayElRef: React.RefObject<HTMLDivElement | null>
  ) =>
    size.w > 0 ? (
      <div
        ref={overlayElRef as React.Ref<HTMLDivElement>}
        className="absolute inset-0 touch-none"
        style={{ width: size.w, height: size.h }}
        onPointerDown={(e) => onOverlayPointerDown(e, overlayElRef.current)}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {layers.map((layer) => {
          if (!layer.text.trim()) return null;
          const isActive = layer.id === selectedId || layer.id === draggingId;
          const previewFontSize = Math.max(8, Math.round(layer.fontSize * scale));
          const ctx = getMeasureCtx();
          const box = ctx
            ? measureTextLayerBox(ctx, layer, previewFontSize)
            : { width: previewFontSize * 4, height: previewFontSize };

          return (
            <div
              key={layer.id}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => onPointerDownLayer(layer.id, e, which)}
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
    ) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ToolModeToggle mode={mode} onChange={setMode} />
      </div>

      {mode === "single" ? (
        <FileDropZone
          accept="image/*"
          label={shared.uploadImage}
          onFiles={(files) => {
            const f = files[0];
            if (f) loadFile(f, messages);
          }}
        />
      ) : null}

      {error && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {hasImage && mode === "single" && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{shared.preview}</p>
            <div className="relative mx-auto inline-block max-w-full">
              <canvas ref={canvasRef} className="block max-w-full rounded-lg border border-line" />
              {textHitOverlay("single", previewSize, previewScale, overlayRef)}
            </div>
            <p className="mt-1 text-xs text-muted">{t.dragHint}</p>
          </div>

          {layersPanel}
          {selectedLayerEditor}

          <button
            type="button"
            onClick={() => void exportPng()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {common.download}
          </button>
        </>
      )}

      {mode === "batch" && (
        <>
          <div className="space-y-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-sm font-medium text-[var(--text)]">{t.settingsTitle}</p>
            {layersPanel}
            {selectedLayerEditor}
          </div>

          <p className="text-xs text-[var(--muted)]">{t.batchClickHint}</p>

          {selectedBatchId && (
            <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium text-[var(--text)]">{t.batchPreviewTitle}</h3>
                {selectedBatchName && (
                  <p className="truncate text-xs text-[var(--muted)] max-w-[min(100%,16rem)]">
                    {selectedBatchName}
                  </p>
                )}
              </div>
              <div className="relative mx-auto inline-block max-w-full">
                <canvas
                  ref={batchCanvasRef}
                  className="block max-w-full rounded-lg border border-line"
                />
                {textHitOverlay("batch", batchPreviewSize, batchPreviewScale, batchOverlayRef)}
              </div>
              <p className="text-xs text-muted">{t.dragHint}</p>
            </div>
          )}

          <BatchUploader
            accept="image/*"
            processFile={processFile}
            onSelectFile={onSelectBatchFile}
            selectedFileId={selectedBatchId}
          />
        </>
      )}
    </div>
  );
}
