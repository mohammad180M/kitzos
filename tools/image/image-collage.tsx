"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";

type Layout = "2-cols" | "2-rows" | "3-cols" | "2x2";

interface CollageImage {
  id: string;
  url: string;
  img: HTMLImageElement;
  panX: number;
  panY: number;
  zoom: number;
}

const MAX_IMAGES = 4;
const COLLAGE_SIZE = 800;

function drawImageInCell(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cellX: number,
  cellY: number,
  cellW: number,
  cellH: number,
  panX: number,
  panY: number,
  zoom: number
) {
  const baseScale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight);
  const scale = baseScale * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const maxPanX = Math.max(0, (dw - cellW) / 2);
  const maxPanY = Math.max(0, (dh - cellH) / 2);
  const px = panX * maxPanX;
  const py = panY * maxPanY;
  const dx = cellX + (cellW - dw) / 2 + px;
  const dy = cellY + (cellH - dh) / 2 + py;

  ctx.save();
  ctx.beginPath();
  ctx.rect(cellX, cellY, cellW, cellH);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

export default function ImageCollage() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageCollage");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<CollageImage[]>([]);
  const cellLayoutRef = useRef<{ x: number; y: number; w: number; h: number }[]>([]);

  const [images, setImages] = useState<CollageImage[]>([]);
  const [layout, setLayout] = useState<Layout>("2-cols");
  const [gap, setGap] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const getCells = useCallback((): { cols: number; rows: number; count: number } => {
    const n = images.length;
    switch (layout) {
      case "2-cols":
        return { cols: 2, rows: Math.ceil(n / 2), count: n };
      case "2-rows":
        return { cols: Math.ceil(n / 2), rows: 2, count: n };
      case "3-cols":
        return { cols: 3, rows: Math.ceil(n / 3), count: n };
      case "2x2":
      default:
        return { cols: 2, rows: 2, count: Math.min(n, 4) };
    }
  }, [images.length, layout]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length < 2) return;

    const { cols, rows, count } = getCells();
    const cellGap = gap;
    const cellW = (COLLAGE_SIZE - cellGap * (cols + 1)) / cols;
    const cellH = (COLLAGE_SIZE - cellGap * (rows + 1)) / rows;

    canvas.width = COLLAGE_SIZE;
    canvas.height = COLLAGE_SIZE;
    canvas.style.width = "100%";
    canvas.style.maxWidth = `${COLLAGE_SIZE}px`;
    canvas.style.height = "auto";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, COLLAGE_SIZE, COLLAGE_SIZE);

    const cells: { x: number; y: number; w: number; h: number }[] = [];

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = cellGap + col * (cellW + cellGap);
      const y = cellGap + row * (cellH + cellGap);
      cells.push({ x, y, w: cellW, h: cellH });
      const item = images[i];
      drawImageInCell(ctx, item.img, x, y, cellW, cellH, item.panX, item.panY, item.zoom);

      if (i === selectedIndex) {
        ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
      }
    }

    cellLayoutRef.current = cells;
  }, [images, gap, getCells, selectedIndex]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    if (images.length >= 2) render();
  }, [images, layout, gap, render]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      setError(shared.invalidImage);
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(t.maxImages);
      return;
    }

    setError(null);
    const toAdd = list.slice(0, remaining);

    toAdd.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setImages((prev) => {
          if (prev.length >= MAX_IMAGES) {
            URL.revokeObjectURL(url);
            return prev;
          }
          return [
            ...prev,
            { id: crypto.randomUUID(), url, img, panX: 0, panY: 0, zoom: 1 },
          ];
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError(shared.loadFailed);
      };
      img.src = url;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      const next = prev.filter((i) => i.id !== id);
      setSelectedIndex((idx) => Math.min(idx, Math.max(0, next.length - 1)));
      return next;
    });
  };

  const replaceAllImages = (files: FileList | File[]) => {
    imagesRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    setImages([]);
    setSelectedIndex(0);
    addFiles(files);
  };

  const hitTestCell = (clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * COLLAGE_SIZE;
    const y = ((clientY - rect.top) / rect.height) * COLLAGE_SIZE;
    for (let i = 0; i < cellLayoutRef.current.length; i++) {
      const c = cellLayoutRef.current[i];
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) return i;
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const idx = hitTestCell(e.clientX, e.clientY);
    if (idx == null || idx >= images.length) return;
    setSelectedIndex(idx);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: images[idx].panX,
      panY: images[idx].panY,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragStart.current) return;
    const cell = cellLayoutRef.current[selectedIndex];
    if (!cell) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * COLLAGE_SIZE;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * COLLAGE_SIZE;
    const item = images[selectedIndex];
    if (!item) return;

    const baseScale = Math.min(cell.w / item.img.naturalWidth, cell.h / item.img.naturalHeight);
    const scale = baseScale * item.zoom;
    const dw = item.img.naturalWidth * scale;
    const dh = item.img.naturalHeight * scale;
    const maxPanX = Math.max(1, (dw - cell.w) / 2);
    const maxPanY = Math.max(1, (dh - cell.h) / 2);

    const panX = Math.max(-1, Math.min(1, dragStart.current.panX + dx / maxPanX));
    const panY = Math.max(-1, Math.min(1, dragStart.current.panY + dy / maxPanY));

    setImages((prev) =>
      prev.map((img, i) => (i === selectedIndex ? { ...img, panX, panY } : img))
    );
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    dragStart.current = null;
  };

  const updateZoom = (zoom: number) => {
    setImages((prev) =>
      prev.map((img, i) => (i === selectedIndex ? { ...img, zoom } : img))
    );
  };

  const exportPng = async () => {
    render();
    const canvas = canvasRef.current;
    if (!canvas || images.length < 2) return;
    try {
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob, "collage.png");
    } catch {
      setError(shared.canvasNotSupported);
    }
  };

  const layouts = ((): Layout[] => {
    const n = images.length;
    if (n <= 2) return ["2-cols", "2-rows"];
    if (n === 3) return ["3-cols", "2-cols", "2-rows"];
    return ["2x2", "2-cols", "2-rows", "3-cols"];
  })();

  const selected = images[selectedIndex];

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
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {images.length ? shared.addMore : shared.uploadImages}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              if (images.length === 0) addFiles(e.target.files);
              else addFiles(e.target.files);
            }
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <button
          type="button"
          className="btn-secondary text-sm"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.multiple = true;
            input.onchange = () => {
              if (input.files?.length) replaceAllImages(input.files);
            };
            input.click();
          }}
        >
          {shared.uploadImages}
        </button>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((item, idx) => (
            <div key={item.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={`${t.imageSlot} ${idx + 1}`}
                className={`h-20 w-20 rounded-lg border object-cover dark:border-gray-700 ${
                  idx === selectedIndex ? "border-primary-500 ring-2 ring-primary-400" : "border-gray-200"
                }`}
                onClick={() => setSelectedIndex(idx)}
              />
              <button
                type="button"
                onClick={() => removeImage(item.id)}
                className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white"
                aria-label={common.clear}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length >= 2 && (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.dragHint}</p>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.layout}</p>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
              {layouts.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLayout(l)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    layout === l
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {l === "2-cols"
                    ? t.layout2Cols
                    : l === "2-rows"
                      ? t.layout2Rows
                      : l === "3-cols"
                        ? t.layout3Cols
                        : t.layout2x2}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.gap}: {gap}px
            </span>
            <input
              type="range"
              min={0}
              max={32}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
          </label>

          {selected && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.selectedImage} {selectedIndex + 1} — {t.zoom}: {selected.zoom.toFixed(2)}×
              </span>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.05}
                value={selected.zoom}
                onChange={(e) => updateZoom(Number(e.target.value))}
                className="mt-2 w-full accent-primary-600"
              />
            </label>
          )}

          <canvas
            ref={canvasRef}
            className="mx-auto block touch-none cursor-grab rounded-lg border border-gray-200 active:cursor-grabbing dark:border-gray-700"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </>
      )}

      {images.length > 0 && images.length < 2 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.needMore}</p>
      )}

      <button
        type="button"
        onClick={() => void exportPng()}
        disabled={images.length < 2}
        className="btn-primary inline-flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {common.download}
      </button>
    </div>
  );
}
