"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
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
import { useUnsavedWork } from "@/lib/unsaved-work";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";

const MAX_PREVIEW = 600;

export default function FlipImage() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("flipImage");
  const { locale } = useLocale();
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);
  const [mode, setMode] = useState<ToolMode>("single");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const { imgRef, hasImage, imageVersion, error, loadFile } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Batch: click → large flip preview (same pattern as image-resizer)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchName, setSelectedBatchName] = useState<string | null>(null);
  const [batchPreviewUrl, setBatchPreviewUrl] = useState<string | null>(null);

  useUnsavedWork(hasImage);

  useEffect(() => {
    return () => {
      if (batchPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(batchPreviewUrl);
    };
  }, [batchPreviewUrl]);

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
    ctx.save();
    ctx.translate(dispW / 2, dispH / 2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, (-natW * scale) / 2, (-natH * scale) / 2, natW * scale, natH * scale);
    ctx.restore();
  }, [flipH, flipV, imgRef]);

  useEffect(() => {
    if (hasImage) render();
  }, [hasImage, imageVersion, render]);

  const toggleBoth = () => {
    const next = !(flipH && flipV);
    setFlipH(next);
    setFlipV(next);
  };

  const exportImage = async () => {
    const img = imgRef.current;
    if (!img) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const off = document.createElement("canvas");
    const ctx = setupCanvas(off, natW, natH);
    ctx.save();
    ctx.translate(natW / 2, natH / 2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
    ctx.restore();

    const mime = sourceFile?.type === "image/jpeg" ? "image/jpeg" : "image/png";
    const ext = mime === "image/jpeg" ? "jpg" : "png";

    try {
      const blob = await canvasToBlob(off, mime);
      downloadBlob(blob, `flipped.${ext}`);
    } catch {
      // canvas unsupported
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
      const ctx = setupCanvas(off, natW, natH);
      ctx.save();
      ctx.translate(natW / 2, natH / 2);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
      ctx.restore();

      const mime = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
      const ext = mime === "image/jpeg" ? "jpg" : "png";
      const blob = await canvasToBlob(off, mime);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      return { blob, name: `${baseName}-flipped.${ext}` };
    },
    [flipH, flipV, shared.loadFailed]
  );

  const clearBatchPreview = useCallback(() => {
    setSelectedBatchId(null);
    setSelectedBatchName(null);
    setBatchPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const onSelectBatchFile = useCallback(
    (f: File | null, id: string | null) => {
      if (!f || !id) {
        clearBatchPreview();
        return;
      }
      setSelectedBatchId(id);
      setSelectedBatchName(f.name);
      setBatchPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
    },
    [clearBatchPreview]
  );

  const flipTransform =
    flipH || flipV
      ? `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
      : undefined;

  const flipButtons = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setFlipH((v) => !v)}
        className={`btn-secondary text-sm ${flipH ? "ring-2 ring-primary-500" : ""}`}
      >
        {t.flipH}
      </button>
      <button
        type="button"
        onClick={() => setFlipV((v) => !v)}
        className={`btn-secondary text-sm ${flipV ? "ring-2 ring-primary-500" : ""}`}
      >
        {t.flipV}
      </button>
      <button
        type="button"
        onClick={toggleBoth}
        className={`btn-secondary text-sm ${flipH && flipV ? "ring-2 ring-primary-500" : ""}`}
      >
        {t.flipBoth}
      </button>
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
              if (!f) return;
              setSourceFile(f);
              setFlipH(false);
              setFlipV(false);
              loadFile(f, messages);
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

          {hasImage && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {shared.preview}
                </p>
                <canvas
                  ref={canvasRef}
                  className="mx-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>

              {flipButtons}

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
        </>
      ) : (
        <>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
            <p className="text-sm font-medium text-[var(--text)]">{t.flipDirection}</p>
            {flipButtons}
          </div>

          <p className="text-xs text-[var(--muted)]">{t.batchClickHint}</p>

          {batchPreviewUrl && (
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
                  alt={shared.preview}
                  decoding="async"
                  className="max-h-[min(60vh,420px)] max-w-full object-contain transition-transform duration-200 ease-out motion-reduce:transition-none"
                  style={flipTransform ? { transform: flipTransform } : undefined}
                />
              </div>
            </div>
          )}

          <BatchUploader
            accept="image/*"
            processFile={processFile}
            onSelectFile={onSelectBatchFile}
            selectedFileId={selectedBatchId}
            thumbnailFlip={
              flipH || flipV ? { horizontal: flipH, vertical: flipV } : null
            }
          />
        </>
      )}

      <p className="text-sm text-secondary">
        <Link
          href={`/${locale}/tools/image-rotator/`}
          className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
        >
          {t.needRotateLink}
        </Link>
      </p>
    </div>
  );
}
