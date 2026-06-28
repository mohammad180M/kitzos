"use client";

import { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import { Download, Upload } from "lucide-react";
import { downloadBlob } from "@/lib/download";

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
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<Set<OutputFormat>>(
    () => new Set<OutputFormat>(["image/png"])
  );
  const [quality, setQuality] = useState(92);
  const [outputs, setOutputs] = useState<{ blob: Blob; ext: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runConversion = useCallback(async (file: File, formats: OutputFormat[], q: number) => {
    setConverting(true);
    setError(null);
    try {
      const results = await Promise.all(formats.map((mime) => convertImage(file, mime, q)));
      setOutputs(results);
    } catch {
      setError("Conversion failed. Try a different format.");
      setOutputs([]);
    } finally {
      setConverting(false);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
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

    const zip = new JSZip();
    for (const out of outputs) {
      zip.file(`${base}.${out.ext}`, out.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${base}-converted.zip`);
  };

  const hasLossy = Array.from(selectedFormats).some((f) => f !== "image/png");

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
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Upload an image to convert</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {previewUrl && (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" loading="lazy" decoding="async" className="max-h-64 w-full object-contain" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Output format(s)</p>
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
              Select one or more formats. Multiple formats download as a ZIP.
            </p>
          </div>

          {hasLossy && (
            <div>
              <label htmlFor="conv-quality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quality: {quality}%
              </label>
              <input
                id="conv-quality"
                type="range"
                min={50}
                max={100}
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="mt-2 w-full accent-primary-600"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => void downloadAll()}
            disabled={!outputs.length || converting}
            className="btn-primary"
          >
            <Download className="h-4 w-4" />
            {outputs.length > 1
              ? `Download ${outputs.length} formats (ZIP)`
              : "Download converted image"}
          </button>
        </>
      )}
    </div>
  );
}
