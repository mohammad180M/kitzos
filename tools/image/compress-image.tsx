"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

interface LoadedImage {
  file: File;
  img: HTMLImageElement;
  isPng: boolean;
  hasAlpha: boolean;
}

function detectTransparency(img: HTMLImageElement): boolean {
  const sampleW = Math.min(img.width, 512);
  const sampleH = Math.max(1, Math.round(img.height * (sampleW / img.width)));
  const canvas = document.createElement("canvas");
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const { data } = ctx.getImageData(0, 0, sampleW, sampleH);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 252) return true;
  }
  return false;
}

function loadImageFromFile(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const isPng = file.type === "image/png";
        resolve({
          file,
          img,
          isPng,
          hasAlpha: isPng ? detectTransparency(img) : false,
        });
      };
      img.onerror = () => reject(new Error("load"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

export default function CompressImage() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("compressImage");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [convertPngToJpeg, setConvertPngToJpeg] = useState(true);
  const [hasAlpha, setHasAlpha] = useState(false);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [usingOriginal, setUsingOriginal] = useState(false);
  const [savingsPercent, setSavingsPercent] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef<LoadedImage | null>(null);
  const compressGenRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useUnsavedWork(originalFile !== null);

  const setPreviewFromBlob = useCallback((blob: Blob) => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }, []);

  const applyResult = useCallback(
    (file: File, candidate: Blob) => {
      setPreviewFromBlob(candidate);
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
    },
    [setPreviewFromBlob]
  );

  const runCompress = useCallback(
    (file: File, q: number, pngAsJpeg: boolean) => {
      const loaded = loadedRef.current;
      if (!loaded || loaded.file !== file) return;

      const gen = ++compressGenRef.current;
      setCompressing(true);

      const outputJpeg = !loaded.isPng || (loaded.isPng && pngAsJpeg && !loaded.hasAlpha);
      const mimeType = outputJpeg ? "image/jpeg" : "image/png";
      const qualityValue = outputJpeg ? q / 100 : undefined;

      const canvas = document.createElement("canvas");
      canvas.width = loaded.img.width;
      canvas.height = loaded.img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError(shared.canvasNotSupported);
        setCompressing(false);
        return;
      }
      ctx.drawImage(loaded.img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (gen !== compressGenRef.current) return;
          setCompressing(false);
          if (!blob) {
            setError(t.errCompressionFailed);
            return;
          }
          applyResult(file, blob);
        },
        mimeType,
        qualityValue
      );
    },
    [applyResult, shared.canvasNotSupported, t.errCompressionFailed]
  );

  const scheduleCompress = useCallback(
    (file: File, q: number, pngAsJpeg: boolean, immediate = false) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const run = () => runCompress(file, q, pngAsJpeg);
      if (immediate) run();
      else debounceRef.current = setTimeout(run, 250);
    },
    [runCompress]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setError(t.errInvalidFormat);
        return;
      }
      setError(null);
      setOriginalFile(file);
      setOutputSize(null);
      setDownloadBlob(null);
      setUsingOriginal(false);
      setSavingsPercent(null);
      setPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });

      try {
        const loaded = await loadImageFromFile(file);
        loadedRef.current = loaded;
        setHasAlpha(loaded.hasAlpha);
        setConvertPngToJpeg(loaded.isPng && !loaded.hasAlpha);
        scheduleCompress(file, quality, loaded.isPng && !loaded.hasAlpha, true);
      } catch {
        setError(t.errReadFailed);
      }
    },
    [quality, scheduleCompress, t.errInvalidFormat, t.errReadFailed]
  );

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (originalFile) scheduleCompress(originalFile, q, convertPngToJpeg);
  };

  const handleConvertToggle = (checked: boolean) => {
    setConvertPngToJpeg(checked);
    if (originalFile) scheduleCompress(originalFile, quality, checked, true);
  };

  const download = () => {
    if (!downloadBlob || !originalFile) return;
    const ext = downloadBlob.type === "image/jpeg" ? "jpg" : "png";
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = usingOriginal ? originalFile.name : `compressed.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPng = originalFile?.type === "image/png";
  const showQualitySlider = !isPng || (isPng && convertPngToJpeg && !hasAlpha);

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
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.uploadHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {originalFile && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.preview}</p>
              <div
                className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                style={{
                  backgroundImage:
                    isPng && hasAlpha && !convertPngToJpeg
                      ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                      : undefined,
                  backgroundSize: isPng && hasAlpha && !convertPngToJpeg ? "16px 16px" : undefined,
                  backgroundPosition:
                    isPng && hasAlpha && !convertPngToJpeg ? "0 0, 0 8px, 8px -8px, -8px 0" : undefined,
                  backgroundColor: isPng && hasAlpha && !convertPngToJpeg ? "#f9fafb" : "#f3f4f6",
                }}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={t.previewAlt}
                    loading="lazy"
                    decoding="async"
                    className="max-h-64 w-full object-contain"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-gray-400">
                    {compressing ? "…" : ""}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ImageIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{originalFile.name}</span>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 dark:text-gray-400">{t.originalSize}</dt>
                    <dd className="font-medium">{formatBytes(originalFile.size)}</dd>
                  </div>
                  {outputSize !== null && (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500 dark:text-gray-400">{t.outputSize}</dt>
                        <dd className="font-medium text-primary-600 dark:text-primary-400">
                          {formatBytes(outputSize)}
                        </dd>
                      </div>
                      {usingOriginal ? (
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500 dark:text-gray-400">{t.status}</dt>
                            <dd className="text-end font-medium text-amber-700 dark:text-amber-300">
                              {t.alreadyOptimized}
                            </dd>
                          </div>
                          <p className="tool-notice tool-notice--warning mt-2 text-xs">
                            {t.alreadyOptimizedHint}
                          </p>
                        </div>
                      ) : (
                        savingsPercent !== null &&
                        savingsPercent > 0 && (
                          <div className="flex justify-between gap-4">
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

              {isPng && !hasAlpha && (
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={convertPngToJpeg}
                    onChange={(e) => handleConvertToggle(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t.convertToJpeg}</span>
                    <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                      {t.convertToJpegHint}
                    </span>
                  </span>
                </label>
              )}

              {isPng && hasAlpha && (
                <p className="tool-notice tool-notice--warning tool-notice--image text-xs">{t.pngTransparentHint}</p>
              )}

              {isPng && !hasAlpha && !convertPngToJpeg && (
                <p className="tool-notice tool-notice--warning tool-notice--image text-xs">{t.pngHint}</p>
              )}

              {showQualitySlider && (
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
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t.qualityHint}</p>
                </div>
              )}
            </div>
          </div>

          <button type="button" onClick={download} disabled={!downloadBlob} className="btn-primary">
            <Download className="h-4 w-4" />
            {usingOriginal ? t.downloadOriginal : t.downloadCompressed}
          </button>
        </>
      )}
    </div>
  );
}
