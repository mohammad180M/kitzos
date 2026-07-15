"use client";

import FileDropZone from "@/components/FileDropZone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import {
  FixedFrameCropper,
  renderCrop,
} from "@/components/image/FixedFrameCropper";
import {
  centeredCoverState,
  computeFrameSize,
  cropStateToSourceRect,
  type CropState,
} from "@/lib/image/fixed-frame-crop";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

type ShapeMode = "rectangle" | "circle" | "rounded-square";
type AspectPreset = "free" | "1:1" | "4:3" | "16:9" | "3:4" | "9:16";

const ASPECT_VALUES: Record<Exclude<AspectPreset, "free">, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4,
  "9:16": 9 / 16,
};

const PREVIEW_MAX = { w: 560, h: 520 };

function shapeToCropShape(mode: ShapeMode): "rect" | "circle" | "rounded" {
  if (mode === "circle") return "circle";
  if (mode === "rounded-square") return "rounded";
  return "rect";
}

export default function CropImage() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("cropImage");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("cropped.png");
  const [sourceMime, setSourceMime] = useState("image/png");
  const [shapeMode, setShapeMode] = useState<ShapeMode>("rectangle");
  const [aspect, setAspect] = useState<AspectPreset>("free");
  const [cornerRadiusPercent, setCornerRadiusPercent] = useState(24);
  const [cropState, setCropState] = useState<CropState>(centeredCoverState());
  const [error, setError] = useState<string | null>(null);
  const sourceBaseRef = useRef("cropped");

  const isShapeCrop = shapeMode !== "rectangle";

  useUnsavedWork(imageUrl !== null);

  const frameAspect = useMemo(() => {
    if (shapeMode === "circle") return 1;
    if (aspect === "free") return null;
    return ASPECT_VALUES[aspect];
  }, [shapeMode, aspect]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(shared.invalidImage);
      return;
    }
    setError(null);
    setSourceMime(file.type || "image/png");
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    const ext = file.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() ?? "png";
    const base = file.name.replace(/\.[^.]+$/, "") || "cropped";
    sourceBaseRef.current = base;
    setFileName(shapeMode === "rectangle" ? `cropped.${ext}` : `${base}.png`);
    setCropState(centeredCoverState());
    setImgEl(null);
  };

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => setImgEl(img);
    img.onerror = () => setError(shared.loadFailed);
    img.src = imageUrl;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, shared.loadFailed]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    setCropState(centeredCoverState());
    if (shapeMode === "rectangle") {
      const ext = sourceMime === "image/jpeg" ? "jpg" : sourceMime.split("/")[1] ?? "png";
      setFileName(`cropped.${ext}`);
    } else {
      setFileName(`${sourceBaseRef.current}.png`);
    }
  }, [shapeMode, aspect, sourceMime]);

  const outputDimsLabel = useMemo(() => {
    if (!imgEl) return null;
    const aspectNum = frameAspect ?? 1;
    const { fw, fh } = computeFrameSize(PREVIEW_MAX.w, PREVIEW_MAX.h, aspectNum);
    const { sw, sh } = cropStateToSourceRect(
      cropState,
      imgEl.naturalWidth,
      imgEl.naturalHeight,
      fw,
      fh
    );
    return `${Math.round(sw)} × ${Math.round(sh)} px`;
  }, [imgEl, frameAspect, cropState]);

  const downloadCrop = useCallback(() => {
    if (!imgEl) return;
    const aspectNum = frameAspect ?? 1;
    const { fw, fh } = computeFrameSize(PREVIEW_MAX.w, PREVIEW_MAX.h, aspectNum);
    const { sw, sh } = cropStateToSourceRect(
      cropState,
      imgEl.naturalWidth,
      imgEl.naturalHeight,
      fw,
      fh
    );
    const outputW = Math.max(1, Math.round(sw));
    const outputH = Math.max(1, Math.round(sh));

    const canvas = renderCrop(
      imgEl,
      cropState,
      {
        aspect: aspectNum,
        shape: shapeToCropShape(shapeMode),
        radiusPct: cornerRadiusPercent,
      },
      { fw, fh },
      { w: outputW, h: outputH },
      { transparentOutsideShape: isShapeCrop }
    );

    const mime = isShapeCrop ? "image/png" : sourceMime === "image/jpeg" ? "image/jpeg" : "image/png";
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }, mime);
  }, [imgEl, frameAspect, cropState, shapeMode, cornerRadiusPercent, isShapeCrop, sourceMime, fileName]);

  return (
    <div className="space-y-4">
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

      {imgEl && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.shapeMode}</p>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
              {(
                [
                  ["rectangle", t.shapeRectangle],
                  ["circle", t.shapeCircle],
                  ["rounded-square", t.shapeRoundedSquare],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setShapeMode(mode)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    shapeMode === mode
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {shapeMode === "rectangle" && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.aspectRatio}</p>
              <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
                {(["free", "1:1", "4:3", "16:9", "3:4", "9:16"] as AspectPreset[]).map((preset) => (
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
                    {preset === "free" ? t.aspectFree : preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {shapeMode === "rounded-square" && (
            <div>
              <label htmlFor="corner-radius" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.cornerRadius(cornerRadiusPercent)}
              </label>
              <input
                id="corner-radius"
                type="range"
                min={0}
                max={48}
                value={cornerRadiusPercent}
                onChange={(e) => setCornerRadiusPercent(Number(e.target.value))}
                className="mt-2 w-full accent-primary-600"
              />
            </div>
          )}

          <p className="text-sm text-muted">{t.dragHint}</p>

          {outputDimsLabel && (
            <p className="text-sm text-muted">
              {t.selectionPrefix} {outputDimsLabel}
            </p>
          )}

          <FixedFrameCropper
            image={imgEl}
            aspect={frameAspect}
            shape={shapeToCropShape(shapeMode)}
            radiusPct={cornerRadiusPercent}
            value={cropState}
            onChange={setCropState}
            checkerboard={isShapeCrop}
            borderColor="var(--cat-image)"
            zoomLabel={t.zoom}
          />

          <button type="button" onClick={downloadCrop} className="btn-primary">
            <Download className="h-4 w-4" />
            {isShapeCrop ? t.downloadPng : t.downloadCropped}
          </button>
        </>
      )}
    </div>
  );
}
