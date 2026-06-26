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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setFileName(`cropped.${file.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() ?? "png"}`);
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nat = { w: img.naturalWidth, h: img.naturalHeight };
    setNaturalSize(nat);
    const maxW = Math.min(600, containerRef.current?.clientWidth ?? 600);
    const scale = Math.min(1, maxW / nat.w);
    const disp = { w: Math.round(nat.w * scale), h: Math.round(nat.h * scale) };
    setDisplaySize(disp);
    setCrop({ x: 10, y: 10, w: 80, h: 80 });
  };

  const clampCrop = useCallback((rect: CropRect): CropRect => {
    let { x, y, w, h } = rect;
    w = Math.max(10, Math.min(100, w));
    h = Math.max(10, Math.min(100, h));
    x = Math.max(0, Math.min(100 - w, x));
    y = Math.max(0, Math.min(100 - h, y));
    return { x, y, w, h };
  }, []);

  const applyAspect = (rect: CropRect, preset: AspectPreset): CropRect => {
    if (preset === "free") return rect;
    const ratio = ASPECT_VALUES[preset];
    const displayRatio = (rect.w / 100) * displaySize.w / ((rect.h / 100) * displaySize.h);
    let { w, h } = rect;
    if (displayRatio > ratio) {
      w = (h / 100) * displaySize.h * ratio / displaySize.w * 100;
    } else {
      h = (w / 100) * displaySize.w / ratio / displaySize.h * 100;
    }
    return clampCrop({ ...rect, w, h });
  };

  useEffect(() => {
    if (aspect !== "free") {
      setCrop((prev) => applyAspect(prev, aspect));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect, displaySize.w, displaySize.h]);

  const onPointerDown = (e: PointerEvent, mode: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(mode);
    dragStart.current = { mx: e.clientX, my: e.clientY, crop: { ...crop } };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging || !displaySize.w) return;
    const dx = ((e.clientX - dragStart.current.mx) / displaySize.w) * 100;
    const dy = ((e.clientY - dragStart.current.my) / displaySize.h) * 100;
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
    if (!imageUrl || !naturalSize.w) return;

    const img = new Image();
    img.onload = () => {
      const sx = Math.round((crop.x / 100) * naturalSize.w);
      const sy = Math.round((crop.y / 100) * naturalSize.h);
      const sw = Math.round((crop.w / 100) * naturalSize.w);
      const sh = Math.round((crop.h / 100) * naturalSize.h);

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
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
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 p-0.5">
              {(["free", "1:1", "4:3", "16:9"] as AspectPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAspect(preset)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ aspect === preset ? "bg-primary-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" }`}
                >
                  {preset === "free" ? "Free" : preset}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative mx-auto overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
            style={{ width: displaySize.w || "100%", height: displaySize.h || 200 }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              loading="lazy"
              decoding="async"
              width={800}
              height={600}
              className="block h-full w-full select-none"
              draggable={false}
            />
            <div
              className="absolute border-2 border-primary-500 bg-primary-500/10 cursor-move"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
              }}
              onPointerDown={(e) => onPointerDown(e, "move")}
            >
              <div
                className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize rounded-sm border-2 border-white bg-primary-600"
                onPointerDown={(e) => onPointerDown(e, "resize")}
              />
            </div>
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
