"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type SyntheticEvent } from "react";
import { Download, Upload } from "lucide-react";

type AspectPreset = "free" | "1:1" | "4:3" | "16:9";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const ASPECT_VALUES: Record<Exclude<AspectPreset, "free">, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
};

export default function CropImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("cropped.png");
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 100, h: 100 });
  const [aspect, setAspect] = useState<AspectPreset>("free");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<"move" | "resize" | null>(null);
  const dragStart = useRef({ mx: 0, my: 0, crop: crop });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageVersionRef = useRef(0);

  const measureDisplay = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    const rect = img.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return;
    setDisplaySize({ w, h });
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError(null);
    imageVersionRef.current += 1;
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(`cropped.${file.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() ?? "png"}`);
    setNaturalSize({ w: 0, h: 0 });
    setDisplaySize({ w: 0, h: 0 });
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const version = imageVersionRef.current;
    requestAnimationFrame(() => {
      if (version !== imageVersionRef.current) return;
      const rect = img.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setDisplaySize({ w, h });
      setCrop({ x: w * 0.1, y: h * 0.1, w: w * 0.8, h: h * 0.8 });
    });
  };

  useEffect(() => {
    if (!imageUrl) return;
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => measureDisplay());
    ro.observe(container);
    return () => ro.disconnect();
  }, [imageUrl, measureDisplay]);

  const clampCrop = useCallback(
    (rect: CropRect): CropRect => {
      const minSize = Math.min(displaySize.w, displaySize.h) * 0.05;
      let { x, y, w, h } = rect;
      w = Math.max(minSize, Math.min(displaySize.w, w));
      h = Math.max(minSize, Math.min(displaySize.h, h));
      x = Math.max(0, Math.min(displaySize.w - w, x));
      y = Math.max(0, Math.min(displaySize.h - h, y));
      return { x, y, w, h };
    },
    [displaySize.w, displaySize.h]
  );

  const applyAspect = useCallback(
    (rect: CropRect, preset: AspectPreset): CropRect => {
      if (preset === "free" || !displaySize.w || !displaySize.h) return rect;
      const ratio = ASPECT_VALUES[preset];
      const displayRatio = rect.w / rect.h;
      let { w, h } = rect;
      if (displayRatio > ratio) {
        w = h * ratio;
      } else {
        h = w / ratio;
      }
      return clampCrop({ ...rect, w, h });
    },
    [clampCrop, displaySize.w, displaySize.h]
  );

  useEffect(() => {
    if (aspect !== "free" && displaySize.w > 0) {
      setCrop((prev) => applyAspect(prev, aspect));
    }
  }, [aspect, displaySize.w, displaySize.h, applyAspect]);

  const onPointerDown = (e: PointerEvent, mode: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(mode);
    dragStart.current = { mx: e.clientX, my: e.clientY, crop: { ...crop } };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging || !displaySize.w) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    const base = dragStart.current.crop;

    if (dragging === "move") {
      setCrop(clampCrop({ ...base, x: base.x + dx, y: base.y + dy }));
    } else {
      let next = clampCrop({ ...base, w: base.w + dx, h: base.h + dy });
      if (aspect !== "free") next = applyAspect(next, aspect);
      setCrop(next);
    }
  };

  const onPointerUp = () => setDragging(null);

  const downloadCrop = () => {
    if (!imageUrl || !naturalSize.w || !displaySize.w) return;

    const scaleX = naturalSize.w / displaySize.w;
    const scaleY = naturalSize.h / displaySize.h;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const sx = Math.round(crop.x * scaleX);
    const sy = Math.round(crop.y * scaleY);
    const sw = Math.max(1, Math.round(crop.w * scaleX));
    const sh = Math.max(1, Math.round(crop.h * scaleY));

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = dpr > 1;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = imageUrl;
  };

  const cropPercent = displaySize.w
    ? {
        left: `${(crop.x / displaySize.w) * 100}%`,
        top: `${(crop.y / displaySize.h) * 100}%`,
        width: `${(crop.w / displaySize.w) * 100}%`,
        height: `${(crop.h / displaySize.h) * 100}%`,
      }
    : {};

  const cropDims =
    displaySize.w && naturalSize.w
      ? `${Math.round(crop.w * (naturalSize.w / displaySize.w))} × ${Math.round(crop.h * (naturalSize.h / displaySize.h))} px`
      : null;

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
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Upload an image to crop</p>
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

      {imageUrl && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Aspect ratio</p>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
              {(["free", "1:1", "4:3", "16:9"] as AspectPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAspect(preset)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    aspect === preset
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {preset === "free" ? "Free" : preset}
                </button>
              ))}
            </div>
          </div>

          {cropDims && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selection: {cropDims}
            </p>
          )}

          <div
            ref={containerRef}
            className="relative mx-auto inline-block max-w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              loading="lazy"
              decoding="async"
              className="block max-h-[min(70vh,600px)] max-w-full select-none"
              draggable={false}
            />
            {displaySize.w > 0 && (
              <div
                className="absolute border-2 border-primary-500 bg-primary-500/10 cursor-move"
                style={cropPercent}
                onPointerDown={(e) => onPointerDown(e, "move")}
              >
                <div
                  className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-sm border-2 border-white bg-primary-600"
                  onPointerDown={(e) => onPointerDown(e, "resize")}
                />
              </div>
            )}
          </div>

          <button type="button" onClick={downloadCrop} className="btn-primary">
            <Download className="h-4 w-4" />
            Download cropped image
          </button>
        </>
      )}
    </div>
  );
}
