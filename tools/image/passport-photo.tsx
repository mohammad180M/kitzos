"use client";

import FileDropZone from "@/components/FileDropZone";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { FixedFrameCropper, renderCrop } from "@/components/image/FixedFrameCropper";
import { centeredCoverState, computeFrameSize, type CropState } from "@/lib/image/fixed-frame-crop";
import { downloadBlob } from "@/lib/download";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

type SizePreset = "us2x2" | "schengen" | "40x60" | "custom";
type SizeUnit = "mm" | "in";
type ExportMode = "single" | "sheet4x6" | "sheetA6";

const DEFAULT_DPI = 300;
const PREVIEW_MAX = { w: 280, h: 360 };
const SHEET_4X6 = { w: 1200, h: 1800 };
const SHEET_A6 = {
  w: Math.round((105 / 25.4) * DEFAULT_DPI),
  h: Math.round((148 / 25.4) * DEFAULT_DPI),
};

const PRESET_DIMS: Record<Exclude<SizePreset, "custom">, { w: number; h: number; unit: SizeUnit }> = {
  us2x2: { w: 2, h: 2, unit: "in" },
  schengen: { w: 35, h: 45, unit: "mm" },
  "40x60": { w: 40, h: 60, unit: "mm" },
};

function toPixels(w: number, h: number, unit: SizeUnit, dpi: number): { w: number; h: number } {
  const inchesW = unit === "in" ? w : w / 25.4;
  const inchesH = unit === "in" ? h : h / 25.4;
  return { w: Math.round(inchesW * dpi), h: Math.round(inchesH * dpi) };
}

function tileOnSheet(photo: HTMLCanvasElement, sheetW: number, sheetH: number): HTMLCanvasElement {
  const padding = 20;
  const photoW = photo.width;
  const photoH = photo.height;
  const cols = Math.max(1, Math.floor((sheetW + padding) / (photoW + padding)));
  const rows = Math.max(1, Math.floor((sheetH + padding) / (photoH + padding)));
  const gridW = cols * photoW + (cols - 1) * padding;
  const gridH = rows * photoH + (rows - 1) * padding;
  const offsetX = Math.round((sheetW - gridW) / 2);
  const offsetY = Math.round((sheetH - gridH) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheetW, sheetH);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * (photoW + padding);
      const y = offsetY + r * (photoH + padding);
      ctx.drawImage(photo, x, y);
    }
  }
  return canvas;
}

export default function PassportPhoto() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("passportPhoto");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState<SizePreset>("us2x2");
  const [customW, setCustomW] = useState(35);
  const [customH, setCustomH] = useState(45);
  const [customUnit, setCustomUnit] = useState<SizeUnit>("mm");
  const [dpi, setDpi] = useState(DEFAULT_DPI);
  const [exportMode, setExportMode] = useState<ExportMode>("single");
  const [cropState, setCropState] = useState<CropState>(centeredCoverState());
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(imageUrl !== null);

  const targetDims = useMemo(() => {
    if (preset === "custom") {
      return toPixels(customW, customH, customUnit, dpi);
    }
    const dims = PRESET_DIMS[preset];
    return toPixels(dims.w, dims.h, dims.unit, dpi);
  }, [preset, customW, customH, customUnit, dpi]);

  const frameAspect = targetDims.w / targetDims.h;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError(t.errInvalidImage);
      return;
    }
    setError(null);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
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
  }, [preset, customW, customH, customUnit, dpi]);

  const download = useCallback(() => {
    if (!imgEl) return;

    const { fw, fh } = computeFrameSize(PREVIEW_MAX.w, PREVIEW_MAX.h, frameAspect);

    const photo = renderCrop(
      imgEl,
      cropState,
      { aspect: frameAspect, shape: "rect" },
      { fw, fh },
      { w: targetDims.w, h: targetDims.h },
      { backgroundColor: "#ffffff" }
    );

    let output = photo;
    let filename = `passport-${targetDims.w}x${targetDims.h}.jpg`;

    if (exportMode === "sheet4x6") {
      output = tileOnSheet(photo, SHEET_4X6.w, SHEET_4X6.h);
      filename = "passport-sheet-4x6.jpg";
    } else if (exportMode === "sheetA6") {
      output = tileOnSheet(photo, SHEET_A6.w, SHEET_A6.h);
      filename = "passport-sheet-a6.jpg";
    }

    output.toBlob(
      (blob) => {
        if (!blob) return;
        downloadBlob(blob, filename);
      },
      "image/jpeg",
      0.92
    );
  }, [imgEl, cropState, frameAspect, targetDims, exportMode]);

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

      <p className="tool-notice tool-notice--warning tool-notice--image" role="status">
        {t.bgNote}
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.preset}</p>
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(
            [
              ["us2x2", t.presetUs2x2],
              ["schengen", t.presetSchengen],
              ["40x60", t.preset40x60],
              ["custom", t.presetCustom],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreset(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                preset === key
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {preset === "custom" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t.width}</span>
            <input
              type="number"
              min={1}
              value={customW}
              onChange={(e) => setCustomW(Number(e.target.value))}
              className="input-field mt-1"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t.height}</span>
            <input
              type="number"
              min={1}
              value={customH}
              onChange={(e) => setCustomH(Number(e.target.value))}
              className="input-field mt-1"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t.unit}</span>
            <select
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value as SizeUnit)}
              className="input-field mt-1"
            >
              <option value="mm">{t.unitMm}</option>
              <option value="in">{t.unitIn}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t.dpi}</span>
            <input
              type="number"
              min={72}
              max={600}
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              className="input-field mt-1"
            />
          </label>
        </div>
      )}

      {preset !== "custom" && (
        <label className="block max-w-xs text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t.dpi}</span>
          <input
            type="number"
            min={72}
            max={600}
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            className="input-field mt-1"
          />
        </label>
      )}

      <p className="text-sm text-muted">{t.outputDims(targetDims.w, targetDims.h)}</p>

      {imgEl && (
        <>
          <p className="text-sm text-muted">{t.dragHint}</p>
          <FixedFrameCropper
            image={imgEl}
            aspect={frameAspect}
            shape="rect"
            value={cropState}
            onChange={setCropState}
            borderColor="var(--cat-image)"
            zoomLabel={t.zoom}
            className="max-w-[280px]"
          />
        </>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.exportMode}</p>
        <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(
            [
              ["single", t.exportSingle],
              ["sheet4x6", t.exportSheet4x6],
              ["sheetA6", t.exportSheetA6],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setExportMode(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                exportMode === key
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={download} disabled={!imgEl} className="btn-primary">
        <Download className="h-4 w-4" />
        {t.download}
      </button>
    </div>
  );
}
