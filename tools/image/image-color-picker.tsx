"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { Check, Copy, ZoomIn, ZoomOut } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { rgbToHex, rgbToHsl, type RgbColor } from "@/lib/image/color-format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

/** Layout fit size (CSS), not the pixel buffer. */
const MAX_LAYOUT = 900;
/** High-res canvas buffer so zoom stays sharp. */
const MAX_BUFFER = 2800;
const MAX_HISTORY = 12;
const ZOOM_MIN = 1;
const ZOOM_MAX = 16;
const ZOOM_STEP = 0.5;
const LOUPE_SIZE = 140;
const LOUPE_GRID = 13;

const EYEDROPPER_CURSOR =
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23fff" stroke="%23111" stroke-width="1.2" d="M14.5 3.5l6 6-2.2 2.2-6-6z"/><path fill="%23fff" stroke="%23111" stroke-width="1.2" d="M12.8 7.2L4.5 15.5a2 2 0 0 0 0 2.8l1.2 1.2a2 2 0 0 0 2.8 0l8.3-8.3"/><circle cx="5.2" cy="18.8" r="1.8" fill="%23ef4444" stroke="%23111" stroke-width="1"/></svg>`,
  )}") 4 20, crosshair`;

function formatRgb({ r, g, b }: RgbColor): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function formatHsl(color: RgbColor): string {
  const { h, s, l } = rgbToHsl(color);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function colorsEqual(a: RgbColor, b: RgbColor): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

function clientToPixel(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  clientX: number,
  clientY: number,
): { px: number; py: number } | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;
  const px = Math.floor(((clientX - rect.left) / rect.width) * img.naturalWidth);
  const py = Math.floor(((clientY - rect.top) / rect.height) * img.naturalHeight);
  if (px < 0 || py < 0 || px >= img.naturalWidth || py >= img.naturalHeight) return null;
  return { px, py };
}

type HoverState = {
  left: number;
  top: number;
  px: number;
  py: number;
  color: RgbColor;
};

type PanState = {
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
};

export default function ImageColorPicker() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageColorPicker");
  const { locale } = useLocale();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverRef = useRef<HoverState | null>(null);
  const panRef = useRef<PanState | null>(null);
  const zoomRef = useRef(1);
  /** Keep scroll anchored to cursor (or viewport center) across zoom changes. */
  const zoomAnchorRef = useRef<{
    oldZoom: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const { imgRef, hasImage, imageVersion, error, loadFile } = useImageLoader();

  const [picked, setPicked] = useState<RgbColor | null>(null);
  const [history, setHistory] = useState<RgbColor[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [layoutSize, setLayoutSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<HoverState | null>(null);
  const [panning, setPanning] = useState(false);

  zoomRef.current = zoom;

  useUnsavedWork(hasImage);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const samplePixel = useCallback((img: HTMLImageElement, px: number, py: number): RgbColor | null => {
    let c = sampleCanvasRef.current;
    if (!c) {
      c = document.createElement("canvas");
      c.width = 1;
      c.height = 1;
      sampleCanvasRef.current = c;
    }
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.drawImage(img, px, py, 1, 1, 0, 0, 1, 1);
    const { data } = ctx.getImageData(0, 0, 1, 1);
    return { r: data[0], g: data[1], b: data[2] };
  }, []);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    // CSS layout size (fits in viewport at 100% zoom).
    const layoutFit = Math.min(1, MAX_LAYOUT / Math.max(natW, natH));
    const layoutW = Math.max(1, Math.round(natW * layoutFit));
    const layoutH = Math.max(1, Math.round(natH * layoutFit));

    // High-res buffer: keep as much native detail as possible (capped for memory).
    const bufScale = Math.min(1, MAX_BUFFER / Math.max(natW, natH));
    const bufW = Math.max(1, Math.round(natW * bufScale));
    const bufH = Math.max(1, Math.round(natH * bufScale));

    canvas.width = bufW;
    canvas.height = bufH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, bufW, bufH);
    // High-quality downsample when buffer < natural; crisp when 1:1.
    ctx.imageSmoothingEnabled = bufScale < 1;
    if (ctx.imageSmoothingEnabled) ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, bufW, bufH);
    setLayoutSize({ w: layoutW, h: layoutH });
  }, [imgRef]);

  useEffect(() => {
    if (hasImage) renderPreview();
  }, [hasImage, imageVersion, renderPreview]);

  useEffect(() => {
    setZoom(1);
    setHover(null);
    hoverRef.current = null;
    panRef.current = null;
    setPanning(false);
  }, [imageVersion]);

  const drawLoupe = useCallback((img: HTMLImageElement, px: number, py: number, color: RgbColor) => {
    const loupe = loupeRef.current;
    if (!loupe) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = LOUPE_SIZE;
    loupe.width = Math.round(size * dpr);
    loupe.height = Math.round(size * dpr);
    loupe.style.width = `${size}px`;
    loupe.style.height = `${size}px`;

    const ctx = loupe.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const half = Math.floor(LOUPE_GRID / 2);
    const cell = size / LOUPE_GRID;

    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < LOUPE_GRID; y++) {
      for (let x = 0; x < LOUPE_GRID; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#e5e7eb" : "#cfd4dc";
        ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      }
    }

    ctx.drawImage(img, px - half, py - half, LOUPE_GRID, LOUPE_GRID, 0, 0, size, size);

    const cx = half * cell;
    const cy = half * cell;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.strokeRect(cx + 0.5, cy + 0.5, cell - 1, cell - 1);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(cx + 1.5, cy + 1.5, cell - 3, cell - 3);

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.strokeStyle = rgbToHex(color);
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  useLayoutEffect(() => {
    const h = hover;
    const img = imgRef.current;
    if (!h || !img) return;
    drawLoupe(img, h.px, h.py, h.color);
  }, [hover, drawLoupe, imgRef]);

  // After zoom CSS size updates, keep the same image point under the anchor.
  useLayoutEffect(() => {
    const anchor = zoomAnchorRef.current;
    const vp = viewportRef.current;
    if (!anchor || !vp) return;
    zoomAnchorRef.current = null;

    const { oldZoom, offsetX, offsetY } = anchor;
    if (oldZoom === zoom || oldZoom <= 0) return;

    const worldX = (vp.scrollLeft + offsetX) / oldZoom;
    const worldY = (vp.scrollTop + offsetY) / oldZoom;
    vp.scrollLeft = worldX * zoom - offsetX;
    vp.scrollTop = worldY * zoom - offsetY;
  }, [zoom]);

  const applyZoom = useCallback((nextZoom: number, offsetX?: number, offsetY?: number) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(nextZoom / ZOOM_STEP) * ZOOM_STEP));
    const oldZoom = zoomRef.current;
    if (clamped === oldZoom) return;

    const vp = viewportRef.current;
    let ox = offsetX;
    let oy = offsetY;
    if (vp && (ox === undefined || oy === undefined)) {
      ox = vp.clientWidth / 2;
      oy = vp.clientHeight / 2;
    }
    if (ox !== undefined && oy !== undefined) {
      zoomAnchorRef.current = { oldZoom, offsetX: ox, offsetY: oy };
    }
    setZoom(clamped);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY > 0 ? -1 : 1;
      const step = e.ctrlKey || e.metaKey ? ZOOM_STEP * 2 : ZOOM_STEP;
      const rect = el.getBoundingClientRect();
      applyZoom(zoomRef.current + direction * step, e.clientX - rect.left, e.clientY - rect.top);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [hasImage, applyZoom]);

  // Right-click drag to pan.
  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      const pan = panRef.current;
      const vp = viewportRef.current;
      if (!pan || !vp) return;
      vp.scrollLeft = pan.scrollLeft - (e.clientX - pan.startX);
      vp.scrollTop = pan.scrollTop - (e.clientY - pan.startY);
    };

    const onUp = () => {
      if (!panRef.current) return;
      panRef.current = null;
      setPanning(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const addToHistory = (color: RgbColor) => {
    setHistory((prev) => {
      const filtered = prev.filter((c) => !colorsEqual(c, color));
      return [color, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const updateHover = (e: MouseEvent<HTMLCanvasElement>) => {
    if (panRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img?.naturalWidth) {
      hoverRef.current = null;
      setHover(null);
      return;
    }

    const mapped = clientToPixel(canvas, img, e.clientX, e.clientY);
    if (!mapped) {
      hoverRef.current = null;
      setHover(null);
      return;
    }

    const color = samplePixel(img, mapped.px, mapped.py);
    if (!color) {
      hoverRef.current = null;
      setHover(null);
      return;
    }

    const offset = 22;
    let left = e.clientX + offset;
    let top = e.clientY + offset;
    if (left + LOUPE_SIZE + 16 > window.innerWidth) left = e.clientX - LOUPE_SIZE - offset;
    if (top + LOUPE_SIZE + 48 > window.innerHeight) top = e.clientY - LOUPE_SIZE - 40;
    left = Math.max(8, left);
    top = Math.max(8, top);

    const next: HoverState = { left, top, px: mapped.px, py: mapped.py, color };
    hoverRef.current = next;
    setHover(next);
  };

  const pickAt = (e: MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 || panRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img?.naturalWidth) return;
    const mapped = clientToPixel(canvas, img, e.clientX, e.clientY);
    if (!mapped) return;
    const color = samplePixel(img, mapped.px, mapped.py);
    if (!color) return;
    setPicked(color);
    addToHistory(color);
  };

  const startPan = (e: MouseEvent<HTMLDivElement | HTMLCanvasElement>) => {
    if (e.button !== 2) return;
    e.preventDefault();
    const vp = viewportRef.current;
    if (!vp) return;
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: vp.scrollLeft,
      scrollTop: vp.scrollTop,
    };
    setPanning(true);
    setHover(null);
    hoverRef.current = null;
  };

  const copy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignored
    }
  };

  const live = hover?.color ?? picked;
  const hexValue = live ? rgbToHex(live) : "—";
  const rgbValue = live ? formatRgb(live) : "—";
  const hslValue = live ? formatHsl(live) : "—";

  const colorRows = [
    { key: "hex", label: t.hex, value: hexValue },
    { key: "rgb", label: t.rgb, value: rgbValue },
    { key: "hsl", label: t.hsl, value: hslValue },
  ];

  const zoomPercent = Math.round(zoom * 100);
  const displayW = Math.max(1, Math.round(layoutSize.w * zoom));
  const displayH = Math.max(1, Math.round(layoutSize.h * zoom));

  return (
    <div className="space-y-4">
      <FileDropZone
        accept="image/*"
        label={t.uploadHint}
        onFiles={(files) => {
          const f = files[0];
          if (!f) return;
          setPicked(null);
          setHistory([]);
          setZoom(1);
          setHover(null);
          hoverRef.current = null;
          loadFile(f, messages);
        }}
      />

      {error && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {hasImage && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.pickHint}</p>

            <div className="mb-3 flex flex-wrap items-center gap-3">
              <label className="flex min-w-[12rem] flex-1 items-center gap-2 text-sm">
                <span className="shrink-0 font-medium text-gray-700 dark:text-gray-300">
                  {t.zoomLabel(zoomPercent)}
                </span>
                <input
                  type="range"
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={ZOOM_STEP}
                  value={zoom}
                  onChange={(e) => applyZoom(Number(e.target.value))}
                  className="w-full accent-primary-600"
                  aria-label={t.zoom}
                />
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyZoom(zoom - ZOOM_STEP)}
                  disabled={zoom <= ZOOM_MIN}
                  className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2 text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-40"
                  aria-label={t.zoom}
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyZoom(zoom + ZOOM_STEP)}
                  disabled={zoom >= ZOOM_MAX}
                  className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2 text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-40"
                  aria-label={t.zoom}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mb-2 text-xs text-[var(--muted)]">{t.zoomHint}</p>

            <div
              ref={viewportRef}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={startPan}
              className="relative mx-auto max-h-[min(75vh,720px)] max-w-full overflow-auto rounded-lg border border-gray-200 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#f3f4f6_0%_50%)] bg-[length:16px_16px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden dark:border-gray-700 dark:bg-[repeating-conic-gradient(#374151_0%_25%,#1f2937_0%_50%)] dark:bg-[length:16px_16px]"
              style={{
                cursor: panning ? "grabbing" : undefined,
                direction: "ltr",
                overscrollBehavior: "contain",
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={pickAt}
                onMouseDown={startPan}
                onMouseMove={updateHover}
                onMouseLeave={() => {
                  if (panRef.current) return;
                  hoverRef.current = null;
                  setHover(null);
                }}
                className="block max-w-none origin-top-left"
                style={{
                  width: `${displayW}px`,
                  height: `${displayH}px`,
                  cursor: panning ? "grabbing" : EYEDROPPER_CURSOR,
                  imageRendering: zoom >= 1.25 ? "pixelated" : "auto",
                }}
              />
            </div>

            <div
              className={`pointer-events-none fixed z-[100] transition-opacity duration-75 ${
                hover && !panning ? "opacity-100" : "opacity-0"
              }`}
              style={{ left: hover?.left ?? -9999, top: hover?.top ?? -9999 }}
              aria-hidden="true"
            >
              <div className="overflow-hidden rounded-full shadow-2xl ring-2 ring-black/50">
                <canvas ref={loupeRef} width={LOUPE_SIZE} height={LOUPE_SIZE} />
              </div>
              {hover && (
                <div className="mt-1.5 flex items-center justify-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 text-[11px] font-mono text-white shadow-lg">
                  <span
                    className="inline-block h-3 w-3 rounded-sm border border-white/70"
                    style={{ backgroundColor: rgbToHex(hover.color) }}
                  />
                  {rgbToHex(hover.color)}
                  <span className="text-white/55">
                    {hover.px}×{hover.py}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: live ? rgbToHex(live) : "transparent" }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 space-y-2">
              {colorRows.map((row) => (
                <div key={row.key} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {row.label}
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={row.value}
                    className="input-field ltr-input min-w-0 flex-1 font-mono text-sm"
                  />
                  <button
                    type="button"
                    disabled={!picked && !hover}
                    onClick={() => {
                      const color = hover?.color ?? picked;
                      if (!color) return;
                      if (row.key === "hex") copy(row.key, rgbToHex(color));
                      else if (row.key === "rgb") copy(row.key, formatRgb(color));
                      else copy(row.key, formatHsl(color));
                    }}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    aria-label={`${common.copy} ${row.label}`}
                  >
                    {copiedField === row.key ? (
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
              {hover && !picked && (
                <p className="text-xs text-[var(--muted)]">{t.hoverPreview}</p>
              )}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.history}</p>
              <div className="flex flex-wrap gap-2">
                {history.map((color, i) => {
                  const hex = rgbToHex(color);
                  const selected = picked !== null && colorsEqual(picked, color);
                  return (
                    <button
                      key={`${hex}-${i}`}
                      type="button"
                      onClick={() => setPicked(color)}
                      className={`h-9 w-9 rounded-lg border-2 transition-transform hover:scale-105 ${
                        selected
                          ? "border-primary-500 ring-2 ring-primary-300 dark:ring-primary-600"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={hex}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          href={`/${locale}/tools/color-picker`}
          className="text-primary-600 hover:underline dark:text-primary-400"
        >
          {t.colorToolsLink}
        </Link>
      </p>
    </div>
  );
}
