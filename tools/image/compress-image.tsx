"use client";

import { useCallback, useRef, useState } from "react";
import { Download, ImageIcon, Upload } from "lucide-react";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function effectiveJpegQuality(sliderValue: number): number {
  // Cap re-encode quality so high slider values don't inflate already-compressed JPEGs
  return Math.min(sliderValue / 100, 0.92);
}

export default function CompressImage() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("compressImage");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [usingOriginal, setUsingOriginal] = useState(false);
  const [savingsPercent, setSavingsPercent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useUnsavedWork(originalFile !== null);

  const applyResult = useCallback((file: File, candidate: Blob) => {
    if (candidate.size >= file.size) {
      setDownloadBlob(file);
      setOutputSize(file.size);
      setUsingOriginal(true);
      setSavingsPercent(null);
    } else {
      setDownloadBlob(candidate);
      setOutputSize(candidate.size);
      setUsingOriginal(false);
      setSavingsPercent(Math.round((1 - candidate.size / file.size) * 100));
    }
    setError(null);
  }, []);

  const compress = useCallback(
    (file: File, q: number) => {
      const isPng = file.type === "image/png";

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setError(shared.canvasNotSupported);
            return;
          }
          ctx.drawImage(img, 0, 0);

          const mimeType = isPng ? "image/png" : "image/jpeg";
          const qualityValue = isPng ? undefined : effectiveJpegQuality(q);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setError(t.errCompressionFailed);
                return;
              }
              applyResult(file, blob);
            },
            mimeType,
            qualityValue
          );
        };
        img.onerror = () => setError(shared.loadFailed);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => setError(t.errReadFailed);
      reader.readAsDataURL(file);
    },
    [applyResult, shared.canvasNotSupported, shared.loadFailed, t.errCompressionFailed, t.errReadFailed]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setError(t.errInvalidFormat);
        return;
      }
      setOriginalFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOutputSize(null);
      setDownloadBlob(null);
      setUsingOriginal(false);
      setSavingsPercent(null);
      compress(file, quality);
    },
    [compress, quality, t.errInvalidFormat]
  );

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (originalFile) compress(originalFile, q);
  };

  const download = () => {
    if (!downloadBlob || !originalFile) return;
    const isPng = originalFile.type === "image/png";
    const ext = isPng ? "png" : "jpg";
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = usingOriginal ? originalFile.name : `compressed.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPng = originalFile?.type === "image/png";

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/30"
      >
        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.uploadHint}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {originalFile && previewUrl && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.preview}</p>
              <div
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                style={{
                  backgroundImage: isPng
                    ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                    : undefined,
                  backgroundSize: isPng ? "16px 16px" : undefined,
                  backgroundPosition: isPng ? "0 0, 0 8px, 8px -8px, -8px 0" : undefined,
                  backgroundColor: isPng ? "#f9fafb" : "#f3f4f6",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={t.previewAlt}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={512}
                  className="max-h-64 w-full object-contain"
                />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">{originalFile.name}</span>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">{t.originalSize}</dt>
                    <dd className="font-medium">{formatBytes(originalFile.size)}</dd>
                  </div>
                  {outputSize !== null && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-gray-500 dark:text-gray-400">{t.outputSize}</dt>
                        <dd className="font-medium text-primary-600 dark:text-primary-400">
                          {formatBytes(outputSize)}
                        </dd>
                      </div>
                      {usingOriginal ? (
                        <div className="flex justify-between">
                          <dt className="text-gray-500 dark:text-gray-400">{t.status}</dt>
                          <dd className="font-medium text-amber-700 dark:text-amber-300">
                            {t.alreadyOptimized}
                          </dd>
                        </div>
                      ) : (
                        savingsPercent !== null &&
                        savingsPercent > 0 && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500 dark:text-gray-400">{t.saved}</dt>
                            <dd className="font-medium text-green-600 dark:text-green-400">
                              {savingsPercent}%
                            </dd>
                          </div>
                        )
                      )}
                    </>
                  )}
                </dl>
              </div>

              {!isPng && (
                <div>
                  <label htmlFor="quality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.qualityLabel(quality)}
                  </label>
                  <input
                    id="quality"
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => handleQualityChange(Number(e.target.value))}
                    className="mt-2 w-full accent-primary-600"
                  />
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {t.qualityHint}
                  </p>
                </div>
              )}

              {isPng && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.pngHint}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={download}
            disabled={!downloadBlob}
            className="btn-primary"
          >
            <Download className="h-4 w-4" />
            {usingOriginal ? t.downloadOriginal : t.downloadCompressed}
          </button>
        </>
      )}
    </div>
  );
}
