"use client";

import FileDropZone from "@/components/FileDropZone";
import DirectionArrow from "@/components/DirectionArrow";
import { useCallback, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import { useImageToolsExtraLabels } from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isHeicFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return (
    ext === "heic" ||
    ext === "heif" ||
    file.type === "image/heic" ||
    file.type === "image/heif"
  );
}

function loadJSZipModule() {
  return import("jszip");
}

let jsZipModulePromise: ReturnType<typeof loadJSZipModule> | undefined;

function getJSZipModule() {
  if (!jsZipModulePromise) jsZipModulePromise = loadJSZipModule();
  return jsZipModulePromise;
}

interface ConvertedEntry {
  id: string;
  originalName: string;
  originalSize: number;
  blob: Blob;
  outputName: string;
  outputSize: number;
}

export default function HeicToJpg() {
  const t = useImageToolsExtraLabels("heicToJpg");
  const originalFilesRef = useRef<File[]>([]);
  const [entries, setEntries] = useState<ConvertedEntry[]>([]);
  const [quality, setQuality] = useState(90);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(entries.length > 0);

  const convertFiles = useCallback(
    async (files: File[], q: number) => {
      setConverting(true);
      setError(null);

      try {
        const heic2any = (await import("heic2any")).default;
        const converted: ConvertedEntry[] = [];

        for (const file of files) {
          const result = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: q / 100,
          });

          const blob = Array.isArray(result) ? result[0] : result;
          if (!blob) throw new Error("Conversion failed");

          const base = file.name.replace(/\.[^.]+$/i, "") || "converted";
          converted.push({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            originalName: file.name,
            originalSize: file.size,
            blob,
            outputName: `${base}.jpg`,
            outputSize: blob.size,
          });
        }

        setEntries(converted);
      } catch {
        setError(t.errConvertFailed);
        setEntries([]);
      } finally {
        setConverting(false);
      }
    },
    [t.errConvertFailed]
  );

  const handleFiles = (fileList: FileList | File[]) => {
    const list = Array.from(fileList).filter(isHeicFile);
    if (list.length === 0) {
      setError(t.errInvalidFiles);
      return;
    }
    originalFilesRef.current = list;
    void convertFiles(list, quality);
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (originalFilesRef.current.length > 0) {
      void convertFiles(originalFilesRef.current, q);
    }
  };

  const downloadOne = (entry: ConvertedEntry) => {
    downloadBlob(entry.blob, entry.outputName);
  };

  const downloadAll = async () => {
    if (entries.length === 0) return;

    if (entries.length === 1) {
      downloadOne(entries[0]);
      return;
    }

    const JSZip = (await getJSZipModule()).default;
    const zip = new JSZip();
    for (const entry of entries) {
      zip.file(entry.outputName, entry.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "heic-converted.zip");
  };

  return (
    <div className="space-y-4">
      <FileDropZone
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        label={t.uploadHint}
        hint={t.uploadSubHint}
        onFiles={(files) => {
          if (files.length) handleFiles(files);
        }}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {entries.length > 0 && (
        <div>
          <label htmlFor="heic-quality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.qualityLabel(quality)}
          </label>
          <input
            id="heic-quality"
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            disabled={converting}
            className="mt-2 w-full accent-primary-600"
          />
        </div>
      )}

      {converting && (
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t.converting}
        </p>
      )}

      {entries.length > 0 && !converting && (
        <>
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {entry.originalName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.originalSize}: {formatBytes(entry.originalSize)}{" "}
                    <DirectionArrow className="mx-0.5" /> {t.outputSize}:{" "}
                    {formatBytes(entry.outputSize)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadOne(entry)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.downloadJpg}
                </button>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => void downloadAll()} className="btn-primary">
            <Download className="h-4 w-4" />
            {entries.length > 1 ? t.downloadZip(entries.length) : t.downloadJpg}
          </button>
        </>
      )}
    </div>
  );
}
