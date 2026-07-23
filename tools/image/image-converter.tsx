"use client";

import FileDropZone from "@/components/FileDropZone";
import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";
import ProgressIndicator from "@/components/tools/ProgressIndicator";
import { useBatchLabels } from "@/lib/i18n/use-batch-labels";

function loadJSZipModule() {
  return import("jszip");
}

let jsZipModulePromise: ReturnType<typeof loadJSZipModule> | undefined;

function getJSZipModule() {
  if (!jsZipModulePromise) jsZipModulePromise = loadJSZipModule();
  return jsZipModulePromise;
}

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMATS: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

function convertImage(
  file: File,
  mime: OutputFormat,
  q: number
): Promise<{ blob: Blob; ext: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        if (mime === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const qualityValue = mime === "image/png" ? undefined : q / 100;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Conversion failed"));
              return;
            }
            const ext = FORMATS.find((f) => f.value === mime)?.ext ?? "png";
            resolve({ blob, ext });
          },
          mime,
          qualityValue
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function ImageConverter() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageConverter");
  const batchLabels = useBatchLabels();
  const [mode, setMode] = useState<ToolMode>("single");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<Set<OutputFormat>>(
    () => new Set<OutputFormat>(["image/png"])
  );
  const [quality, setQuality] = useState(92);
  const [outputs, setOutputs] = useState<{ blob: Blob; ext: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(originalFile !== null);
  const [converting, setConverting] = useState(false);

  const runConversion = useCallback(async (file: File, formats: OutputFormat[], q: number) => {
    setConverting(true);
    setError(null);
    try {
      const results = await Promise.all(formats.map((mime) => convertImage(file, mime, q)));
      setOutputs(results);
    } catch {
      setError(t.errConvertFailed);
      setOutputs([]);
    } finally {
      setConverting(false);
    }
  }, [t.errConvertFailed]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(shared.invalidImage);
      return;
    }
    setOriginalFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setOutputs([]);
    void runConversion(file, Array.from(selectedFormats), quality);
  };

  const toggleFormat = (mime: OutputFormat) => {
    setSelectedFormats((prev) => {
      const next = new Set(prev);
      if (next.has(mime)) {
        if (next.size > 1) next.delete(mime);
      } else {
        next.add(mime);
      }
      if (originalFile) void runConversion(originalFile, Array.from(next), quality);
      return next;
    });
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (originalFile) void runConversion(originalFile, Array.from(selectedFormats), q);
  };

  const downloadAll = async () => {
    if (!outputs.length || !originalFile) return;
    const base = originalFile.name.replace(/\.[^.]+$/, "") ?? "converted";

    if (outputs.length === 1) {
      const url = URL.createObjectURL(outputs[0].blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}.${outputs[0].ext}`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const JSZip = (await getJSZipModule()).default;
    const zip = new JSZip();
    for (const out of outputs) {
      zip.file(`${base}.${out.ext}`, out.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${base}-converted.zip`);
  };

  const processFile = useCallback(
    async (file: File): Promise<BatchOutput[]> => {
      const formats = Array.from(selectedFormats);
      const results = await Promise.all(
        formats.map(async (mime) => {
          const res = await convertImage(file, mime, quality);
          const base = file.name.replace(/\.[^.]+$/, "") ?? "converted";
          return {
            blob: res.blob,
            name: `${base}.${res.ext}`,
          };
        })
      );
      return results;
    },
    [selectedFormats, quality]
  );

  const hasLossy = Array.from(selectedFormats).some((f) => f !== "image/png");

  const settingsPanel = (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.outputFormats}</p>
        <div className="flex flex-wrap gap-3">
          {FORMATS.map((f) => (
            <label key={f.value} className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedFormats.has(f.value)}
                onChange={() => toggleFormat(f.value)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {f.label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {t.formatHint}
        </p>
      </div>

      {hasLossy && (
        <div>
          <label htmlFor="conv-quality-batch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.qualityLabel(quality)}
          </label>
          <input
            id="conv-quality-batch"
            type="range"
            min={50}
            max={100}
            value={quality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            className="mt-2 w-full accent-primary-600"
          />
        </div>
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
            label={t.uploadHint}
            onFiles={(files) => {
              const f = files[0];
              if (f) handleFile(f);
            }}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
              {error}
            </p>
          )}

          {previewUrl && (
            <>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-55 dark:border-gray-700 dark:bg-gray-800/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={shared.preview} loading="lazy" decoding="async" className="max-h-64 w-full object-contain" />
              </div>

              {settingsPanel}

              <ProgressIndicator active={converting} label={batchLabels.processing} />

              <button
                type="button"
                onClick={() => void downloadAll()}
                disabled={!outputs.length || converting}
                className="btn-primary"
              >
                <Download className="h-4 w-4" />
                {outputs.length > 1
                  ? t.downloadZip(outputs.length)
                  : t.downloadConverted}
              </button>
            </>
          )}
        </>
      ) : (
        <>
          {settingsPanel}

          <BatchUploader
            accept="image/*"
            processFile={processFile}
          />
        </>
      )}
    </div>
  );
}
