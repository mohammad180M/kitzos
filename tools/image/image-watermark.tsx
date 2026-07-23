"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { getToolSlugFromPath, toolImageSessionKey } from "@/lib/hooks/use-tool-draft";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";

const MAX_PREVIEW = 700;

interface WatermarkPosition {
  xRatio: number;
  yRatio: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  fontSize: number,
  color: string,
  opacity: number,
  rotation: number,
  position: WatermarkPosition,
  tile: boolean
) {
  if (!text.trim()) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px sans-serif`;

  if (tile) {
    const angle = (rotation * Math.PI) / 180;
    const textWidth = ctx.measureText(text).width;
    const stepX = textWidth + fontSize;
    const stepY = fontSize * 2.5;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    for (let row = 0, y = -stepY; y < h + stepY; row++, y += stepY) {
      for (let x = -w + (row % 2) * (stepX / 2); x < w * 2; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    const x = position.xRatio * w;
    const y = position.yRatio * h;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
}

export default function ImageWatermark() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageWatermark");
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);
  const [mode, setMode] = useState<ToolMode>("single");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const batchCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const batchOverlayRef = useRef<HTMLDivElement>(null);
  const previewScaleRef = useRef(1);
  const batchScaleRef = useRef(1);
  const batchImgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ grabX: number; grabY: number; pointerId: number } | null>(null);

  const { imgRef, hasImage, imageVersion, error, setError, loadFile } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [sourceMime, setSourceMime] = useState("image/png");
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(0.4);
  const [rotation, setRotation] = useState(-35);
  const [tile, setTile] = useState(false);
  const [position, setPosition] = useState<WatermarkPosition>({ xRatio: 0.5, yRatio: 0.5 });
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 });
  const [batchPreviewSize, setBatchPreviewSize] = useState({ w: 0, h: 0 });

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchName, setSelectedBatchName] = useState<string | null>(null);
  const [batchImageVersion, setBatchImageVersion] = useState(0);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    previewScaleRef.current = scale;
    const w = Math.round(natW * scale);
    const h = Math.round(natH * scale);
    setPreviewSize({ w, h });

    const ctx = setupCanvas(canvas, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const previewFontSize = Math.max(8, Math.round(fontSize * scale));
    drawWatermark(ctx, w, h, text, previewFontSize, color, opacity, rotation, position, tile);
  }, [text, fontSize, color, opacity, rotation, position, tile, imgRef]);

  const renderBatchPreview = useCallback(() => {
    const canvas = batchCanvasRef.current;
    const img = batchImgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    batchScaleRef.current = scale;
    const w = Math.round(natW * scale);
    const h = Math.round(natH * scale);
    setBatchPreviewSize({ w, h });

    const ctx = setupCanvas(canvas, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const previewFontSize = Math.max(8, Math.round(fontSize * scale));
    drawWatermark(ctx, w, h, text, previewFontSize, color, opacity, rotation, position, tile);
  }, [text, fontSize, color, opacity, rotation, position, tile]);

  useEffect(() => {
    setPosition({ xRatio: 0.5, yRatio: 0.5 });
  }, [imageVersion]);

  useEffect(() => {
    if (hasImage && mode === "single") render();
  }, [hasImage, imageVersion, text, fontSize, color, opacity, rotation, position, tile, render, mode]);

  useEffect(() => {
    if (mode === "batch" && batchImgRef.current) renderBatchPreview();
  }, [
    mode,
    batchImageVersion,
    text,
    fontSize,
    color,
    opacity,
    rotation,
    position,
    tile,
    renderBatchPreview,
  ]);

  const onPointerDownDrag = (
    e: React.PointerEvent,
    overlay: HTMLDivElement | null,
    size: { w: number; h: number }
  ) => {
    if (tile || !text.trim() || !overlay || size.w < 1) return;
    e.stopPropagation();
    const rect = overlay.getBoundingClientRect();
    const overlayLeft = position.xRatio * rect.width;
    const overlayTop = position.yRatio * rect.height;
    dragRef.current = {
      pointerId: e.pointerId,
      grabX: e.clientX - rect.left - overlayLeft,
      grabY: e.clientY - rect.top - overlayTop,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent, overlay: HTMLDivElement | null) => {
    const drag = dragRef.current;
    if (!drag || !overlay || drag.pointerId !== e.pointerId) return;
    const rect = overlay.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const xRatio = clamp((e.clientX - rect.left - drag.grabX) / rect.width, 0, 1);
    const yRatio = clamp((e.clientY - rect.top - drag.grabY) / rect.height, 0, 1);
    setPosition({ xRatio, yRatio });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const exportImage = async () => {
    const img = imgRef.current;
    if (!img) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const off = document.createElement("canvas");
    off.width = natW;
    off.height = natH;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, natW, natH);
    drawWatermark(ctx, natW, natH, text, fontSize, color, opacity, rotation, position, tile);

    const isJpeg = sourceMime === "image/jpeg" || sourceMime === "image/jpg";
    const mime = isJpeg ? "image/jpeg" : sourceMime.startsWith("image/") ? sourceMime : "image/png";
    const ext = isJpeg ? "jpg" : mime.split("/")[1] || "png";

    try {
      const blob = isJpeg
        ? await new Promise<Blob>((resolve, reject) => {
            off.toBlob((b) => (b ? resolve(b) : reject(new Error("export"))), mime, 0.92);
          })
        : await canvasToBlob(off, mime);
      downloadBlob(blob, `watermarked.${ext}`);
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
      drawWatermark(ctx, natW, natH, text, fontSize, color, opacity, rotation, position, tile);

      const isJpeg = file.type === "image/jpeg";
      const mime = isJpeg ? "image/jpeg" : "image/png";
      const ext = isJpeg ? "jpg" : "png";
      const blob = isJpeg
        ? await new Promise<Blob>((resolve, reject) => {
            off.toBlob((b) => (b ? resolve(b) : reject(new Error("export"))), mime, 0.92);
          })
        : await canvasToBlob(off, mime);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      return { blob, name: `${baseName}-watermarked.${ext}` };
    },
    [text, fontSize, color, opacity, rotation, position, tile, shared.loadFailed]
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
      const img = new Image();
      const loadId = id;
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Ignore stale loads if the user clicked another file.
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

  const singlePreviewFontSize = Math.max(
    8,
    Math.round(fontSize * (previewSize.w / (imgRef.current?.naturalWidth || previewSize.w || 1)))
  );

  const batchPreviewFontSize = Math.max(
    8,
    Math.round(
      fontSize *
        (batchPreviewSize.w /
          (batchImgRef.current?.naturalWidth || batchPreviewSize.w || 1))
    )
  );

  const settingsPanel = (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.watermarkText}</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.textPlaceholder}
          className="input-field mt-1 w-full"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.fontSizeLabel(fontSize)}</span>
        <input
          type="range"
          min={12}
          max={120}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="mt-2 w-full accent-primary-600"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.color}</span>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="mt-1 h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.opacityLabel(Math.round(opacity * 100))}
        </span>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="mt-2 w-full accent-primary-600"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.rotationLabel(rotation)}</span>
        <input
          type="range"
          min={-90}
          max={90}
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
          className="mt-2 w-full accent-primary-600"
        />
      </label>

      <label className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          checked={tile}
          onChange={(e) => setTile(e.target.checked)}
          className="accent-primary-600"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{t.tile}</span>
      </label>
    </div>
  );

  const watermarkDragOverlay = (
    overlayElRef: React.RefObject<HTMLDivElement | null>,
    size: { w: number; h: number },
    overlayFontSize: number
  ) =>
    !tile && text.trim() && size.w > 0 ? (
      <div
        ref={overlayElRef as React.Ref<HTMLDivElement>}
        dir="ltr"
        className="absolute inset-0 touch-none"
        style={{ width: size.w, height: size.h }}
        onPointerMove={(e) => onPointerMove(e, overlayElRef.current)}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="absolute cursor-move select-none whitespace-nowrap font-bold"
          style={{
            left: `${position.xRatio * 100}%`,
            top: `${position.yRatio * 100}%`,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            fontSize: overlayFontSize,
            color,
            opacity,
            pointerEvents: "auto",
          }}
          onPointerDown={(e) => onPointerDownDrag(e, overlayElRef.current, size)}
        >
          {text}
        </div>
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
            if (!f) return;
            setSourceMime(f.type || "image/png");
            loadFile(f, messages);
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
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.preview}</p>
            <div className="relative mx-auto inline-block max-w-full">
              <canvas
                ref={canvasRef}
                className="block max-w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
              {watermarkDragOverlay(overlayRef, previewSize, singlePreviewFontSize)}
            </div>
            {!tile && text.trim() && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.dragHint}</p>
            )}
          </div>

          {settingsPanel}

          <button
            type="button"
            onClick={() => void exportImage()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {common.download}
          </button>
        </>
      )}

      {mode === "batch" && (
        <>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
            <p className="text-sm font-medium text-[var(--text)]">{t.settingsTitle}</p>
            {settingsPanel}
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
                  className="block max-w-full rounded-lg border border-gray-200 dark:border-gray-700"
                />
                {watermarkDragOverlay(batchOverlayRef, batchPreviewSize, batchPreviewFontSize)}
              </div>
              {!tile && text.trim() && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.dragHint}</p>
              )}
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
