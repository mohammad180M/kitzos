"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMATS: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

export default function ImageConverter() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const convert = useCallback((file: File, mime: OutputFormat, q: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Canvas not supported in this browser.");
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
              setError("Conversion failed. Try a different format.");
              return;
            }
            setOutputBlob(blob);
            setError(null);
          },
          mime,
          qualityValue
        );
      };
      img.onerror = () => setError("Failed to load image.");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setOriginalFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOutputBlob(null);
    convert(file, format, quality);
  };

  const handleFormatChange = (mime: OutputFormat) => {
    setFormat(mime);
    if (originalFile) convert(originalFile, mime, quality);
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (originalFile) convert(originalFile, format, q);
  };

  const download = () => {
    if (!outputBlob) return;
    const ext = FORMATS.find((f) => f.value === format)?.ext ?? "png";
    const base = originalFile?.name.replace(/\.[^.]+$/, "") ?? "converted";
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLossy = format !== "image/png";

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
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" loading="lazy" decoding="async" width={800} height={512} className="max-h-64 w-full object-contain" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Output format</p>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 p-0.5">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleFormatChange(f.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ format === f.value ? "bg-primary-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              PNG and WebP preserve transparency. JPG uses a white background.
            </p>
          </div>

          {isLossy && (
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

          <button type="button" onClick={download} disabled={!outputBlob} className="btn-primary">
            <Download className="h-4 w-4" />
            Download converted image
          </button>
        </>
      )}
    </div>
  );
}
