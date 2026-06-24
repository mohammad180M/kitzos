"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Lock, Unlock, Upload } from "lucide-react";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = originalWidth / originalHeight || 1;

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
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
      setError(null);
    };
    img.onerror = () => {
      setError("Failed to load image.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockAspect && originalHeight > 0) {
      setHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockAspect && originalWidth > 0) {
      setWidth(Math.round(h * aspectRatio));
    }
  };

  const download = () => {
    if (!file || !previewUrl || width <= 0 || height <= 0) {
      setError("Enter valid dimensions.");
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas not supported.");
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type || "image/png";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Resize failed.");
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
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Upload an image</p>
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
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Image preview"
              className="max-h-48 w-full object-contain"
            />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Original: {originalWidth} × {originalHeight} px
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="width" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Width (px)
              </label>
              <input
                id="width"
                type="number"
                min={1}
                value={width || ""}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label htmlFor="height" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Height (px)
              </label>
              <input
                id="height"
                type="number"
                min={1}
                value={height || ""}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="input-field mt-1"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLockAspect(!lockAspect)}
            className="btn-secondary text-sm"
            aria-pressed={lockAspect}
          >
            {lockAspect ? (
              <Lock className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Unlock className="h-4 w-4" aria-hidden="true" />
            )}
            {lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
          </button>

          <button type="button" onClick={download} className="btn-primary">
            <Download className="h-4 w-4" />
            Download resized image
          </button>
        </>
      )}
    </div>
  );
}
