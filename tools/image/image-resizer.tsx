"use client";

import FileDropZone from "@/components/FileDropZone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import AspectRatioConnector from "./AspectRatioConnector";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";

const PREVIEW_MAX_W = 400;
const PREVIEW_MAX_H = 192;
const BATCH_PREVIEW_MAX_W = 480;
const BATCH_PREVIEW_MAX_H = 280;

function targetDimsForFile(
  natW: number,
  natH: number,
  width: number,
  height: number,
  lockAspect: boolean
): { w: number; h: number } {
  if (natW <= 0 || natH <= 0) {
    return { w: Math.max(1, width), h: Math.max(1, height) };
  }
  if (lockAspect) {
    if (width > 0) {
      return {
        w: width,
        h: Math.max(1, Math.round(width * (natH / natW))),
      };
    }
    if (height > 0) {
      return {
        w: Math.max(1, Math.round(height * (natW / natH))),
        h: height,
      };
    }
    return { w: natW, h: natH };
  }
  return {
    w: width > 0 ? width : natW,
    h: height > 0 ? height : natH,
  };
}

export default function ImageResizer() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageResizer");
  const [mode, setMode] = useState<ToolMode>("single");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Batch: click-to-preview selection
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchName, setSelectedBatchName] = useState<string | null>(null);
  const [batchPreviewUrl, setBatchPreviewUrl] = useState<string | null>(null);
  const [batchNatW, setBatchNatW] = useState(0);
  const [batchNatH, setBatchNatH] = useState(0);

  /** width/height ratio of the reference image (single upload or first batch file). */
  const aspectRatioRef = useRef(1);
  const lockAspectRef = useRef(lockAspect);
  lockAspectRef.current = lockAspect;

  useUnsavedWork(file !== null);

  useEffect(() => {
    return () => {
      if (batchPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(batchPreviewUrl);
    };
  }, [batchPreviewUrl]);

  const previewScale = useMemo(() => {
    if (width <= 0 || height <= 0) return 1;
    return Math.min(1, PREVIEW_MAX_W / width, PREVIEW_MAX_H / height);
  }, [width, height]);

  const batchTarget = useMemo(
    () => targetDimsForFile(batchNatW, batchNatH, width, height, lockAspect),
    [batchNatW, batchNatH, width, height, lockAspect]
  );

  const batchPreviewScale = useMemo(() => {
    if (batchTarget.w <= 0 || batchTarget.h <= 0) return 1;
    return Math.min(
      1,
      BATCH_PREVIEW_MAX_W / batchTarget.w,
      BATCH_PREVIEW_MAX_H / batchTarget.h
    );
  }, [batchTarget]);

  const getAspectRatio = useCallback(() => {
    if (originalWidth > 0 && originalHeight > 0) {
      return originalWidth / originalHeight;
    }
    return aspectRatioRef.current > 0 ? aspectRatioRef.current : 1;
  }, [originalWidth, originalHeight]);

  const rememberAspect = useCallback((w: number, h: number) => {
    if (w > 0 && h > 0) aspectRatioRef.current = w / h;
  }, []);

  const heightForWidth = useCallback(
    (w: number) => Math.max(1, Math.round(w / getAspectRatio())),
    [getAspectRatio]
  );

  const widthForHeight = useCallback(
    (h: number) => Math.max(1, Math.round(h * getAspectRatio())),
    [getAspectRatio]
  );

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) {
        setError(shared.invalidImage);
        return;
      }

      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        setFile(f);
        setPreviewUrl(url);
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
        rememberAspect(img.width, img.height);
        setLockAspect(true);
        setError(null);
      };
      img.onerror = () => {
        setError(shared.loadFailed);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [shared.invalidImage, shared.loadFailed, rememberAspect]
  );

  const handleWidthChange = (raw: number) => {
    const w = Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : 0;
    setWidth(w);
    if (lockAspectRef.current && w > 0) {
      setHeight(heightForWidth(w));
    }
  };

  const handleHeightChange = (raw: number) => {
    const h = Number.isFinite(raw) ? Math.max(0, Math.round(raw)) : 0;
    setHeight(h);
    if (lockAspectRef.current && h > 0) {
      setWidth(widthForHeight(h));
    }
  };

  const toggleAspectLock = () => {
    setLockAspect((prev) => {
      const next = !prev;
      lockAspectRef.current = next;
      if (next) {
        if (width > 0) {
          setHeight(heightForWidth(width));
        } else if (height > 0) {
          setWidth(widthForHeight(height));
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (!lockAspect) return;
    if (originalWidth <= 0 || originalHeight <= 0) return;
    if (width <= 0) return;
    const expected = Math.max(1, Math.round(width / (originalWidth / originalHeight)));
    if (expected !== height) {
      setHeight(expected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalWidth, originalHeight, lockAspect]);

  const download = () => {
    if (!file || !previewUrl || width <= 0 || height <= 0) {
      setError(t.errInvalidDims);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError(t.errCanvasNotSupported);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type || "image/png";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(t.errResizeFailed);
            return;
          }
          const ext = mimeType.split("/")[1] || "png";
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `resized-${width}x${height}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        },
        mimeType,
        0.92
      );
    };
    img.src = previewUrl;
  };

  const processFile = useCallback(
    async (f: File): Promise<BatchOutput> => {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(f);
        const el = new Image();
        el.onload = () => {
          URL.revokeObjectURL(url);
          resolve(el);
        };
        el.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error(shared.loadFailed));
        };
        el.src = url;
      });

      const { w: targetW, h: targetH } = targetDimsForFile(
        img.width,
        img.height,
        width,
        height,
        lockAspect
      );

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(t.errCanvasNotSupported);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const mimeType = f.type || "image/png";
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error(t.errResizeFailed))),
          mimeType,
          0.92
        );
      });

      const ext = mimeType.split("/")[1] || "png";
      const baseName = f.name.replace(/\.[^.]+$/, "");
      return { blob, name: `${baseName}-resized-${targetW}x${targetH}.${ext}` };
    },
    [width, height, lockAspect, shared.loadFailed, t.errCanvasNotSupported, t.errResizeFailed]
  );

  const clearBatchPreview = useCallback(() => {
    setSelectedBatchId(null);
    setSelectedBatchName(null);
    setBatchNatW(0);
    setBatchNatH(0);
    setBatchPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const onSelectBatchFile = useCallback((f: File | null, id: string | null) => {
    if (!f || !id) {
      clearBatchPreview();
      return;
    }
    setSelectedBatchId(id);
    setSelectedBatchName(f.name);
    setBatchPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        setBatchNatW(img.width);
        setBatchNatH(img.height);
      };
      img.onerror = () => {
        setBatchNatW(0);
        setBatchNatH(0);
      };
      img.src = url;
      return url;
    });
  }, [clearBatchPreview]);

  const onBatchFilesChange = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        clearBatchPreview();
        return;
      }
      const f = files[0];
      if (!f.type.startsWith("image/")) return;

      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const ow = img.width;
        const oh = img.height;
        if (ow <= 0 || oh <= 0) return;

        setOriginalWidth(ow);
        setOriginalHeight(oh);
        rememberAspect(ow, oh);

        setWidth((prevW) => {
          const nextW = prevW > 0 ? prevW : ow;
          if (lockAspectRef.current) {
            setHeight(Math.max(1, Math.round(nextW / (ow / oh))));
          } else if (prevW <= 0) {
            setHeight(oh);
          }
          return nextW;
        });
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    },
    [rememberAspect, clearBatchPreview]
  );

  const thumbnailAspect =
    width > 0 && height > 0 ? { width, height } : null;

  const settingsPanel = (
    <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="width-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.width}
          </label>
          <input
            id="width-input"
            type="number"
            min={1}
            value={width || ""}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="input-field mt-1"
          />
        </div>

        <div className="flex items-center justify-center sm:pb-0.5">
          <AspectRatioConnector
            connected={lockAspect}
            onToggle={toggleAspectLock}
            lockedLabel={t.aspectConnectorLocked}
            unlockedLabel={t.aspectConnectorUnlocked}
          />
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor="height-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.height}
          </label>
          <input
            id="height-input"
            type="number"
            min={1}
            value={height || ""}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            className="input-field mt-1"
          />
        </div>
      </div>
      {mode === "batch" && originalWidth > 0 && originalHeight > 0 && (
        <p className="text-xs text-[var(--muted)]">
          {t.originalDims(originalWidth, originalHeight)}
          {lockAspect ? ` · ${t.aspectConnectorLocked}` : ` · ${t.aspectConnectorUnlocked}`}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ToolModeToggle mode={mode} onChange={setMode} />
      </div>

      {mode === "single" ? (
        <>
          <FileDropZone
            accept="image/*"
            label={shared.uploadImage}
            onFiles={(files) => {
              const f = files[0];
              if (f) handleFile(f);
            }}
          />

          {error && (
            <p
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}

          {previewUrl && (
            <>
              <div className="flex min-h-[12rem] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={t.previewAlt}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: Math.max(1, Math.round(width * previewScale)),
                    height: Math.max(1, Math.round(height * previewScale)),
                  }}
                  className="block"
                />
              </div>

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.previewDims(width, height)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.originalDims(originalWidth, originalHeight)}
              </p>

              {settingsPanel}

              <button type="button" onClick={download} className="btn-primary">
                <Download className="h-4 w-4" />
                {t.downloadResized}
              </button>
            </>
          )}
        </>
      ) : (
        <>
          {settingsPanel}

          <p className="text-xs text-[var(--muted)]">{t.batchClickHint}</p>

          {batchPreviewUrl && batchTarget.w > 0 && batchTarget.h > 0 && (
            <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium text-[var(--text)]">{t.batchPreviewTitle}</h3>
                {selectedBatchName && (
                  <p className="truncate text-xs text-[var(--muted)] max-w-[min(100%,16rem)]">
                    {selectedBatchName}
                  </p>
                )}
              </div>
              <div className="flex min-h-[12rem] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={batchPreviewUrl}
                  alt={t.previewAlt}
                  decoding="async"
                  style={{
                    width: Math.max(1, Math.round(batchTarget.w * batchPreviewScale)),
                    height: Math.max(1, Math.round(batchTarget.h * batchPreviewScale)),
                  }}
                  className="block object-fill transition-[width,height] duration-150 ease-out motion-reduce:transition-none"
                />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.previewDims(batchTarget.w, batchTarget.h)}
              </p>
              {batchNatW > 0 && batchNatH > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.originalDims(batchNatW, batchNatH)}
                </p>
              )}
            </div>
          )}

          <BatchUploader
            accept="image/*"
            processFile={processFile}
            onFilesChange={onBatchFilesChange}
            thumbnailAspect={thumbnailAspect}
            onSelectFile={onSelectBatchFile}
            selectedFileId={selectedBatchId}
          />
        </>
      )}
    </div>
  );
}
