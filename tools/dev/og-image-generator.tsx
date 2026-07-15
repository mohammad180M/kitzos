"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

const W = 1200;
const H = 630;

type LayerId = "title" | "subtitle";

interface TextLayer {
  id: LayerId;
  x: number;
  y: number;
  fontSize: number;
  bold: boolean;
}

/** 0–100% focal point for CSS/canvas cover (50/50 = center). */
interface BgPosition {
  x: number;
  y: number;
}

const DEFAULT_LAYERS: TextLayer[] = [
  { id: "title", x: 60, y: H / 2 - 40, fontSize: 64, bold: true },
  { id: "subtitle", x: 60, y: H / 2 + 40, fontSize: 32, bold: false },
];

const POSITION_PRESETS: Array<{ id: string; x: number; y: number }> = [
  { id: "tl", x: 0, y: 0 },
  { id: "tc", x: 50, y: 0 },
  { id: "tr", x: 100, y: 0 },
  { id: "ml", x: 0, y: 50 },
  { id: "mc", x: 50, y: 50 },
  { id: "mr", x: 100, y: 50 },
  { id: "bl", x: 0, y: 100 },
  { id: "bc", x: 50, y: 100 },
  { id: "br", x: 100, y: 100 },
];

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

function fontFamily(text: string): string {
  return hasArabic(text) ? '"Noto Sans Arabic", system-ui, sans-serif' : "system-ui, -apple-system, sans-serif";
}

/** Cover-fit drawImage with focal point matching CSS background-position %. */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dW: number,
  dH: number,
  posXPct: number,
  posYPct: number
) {
  const scale = Math.max(dW / img.naturalWidth, dH / img.naturalHeight);
  const sw = img.naturalWidth * scale;
  const sh = img.naturalHeight * scale;
  const x = (dW - sw) * (posXPct / 100);
  const y = (dH - sh) * (posYPct / 100);
  ctx.drawImage(img, x, y, sw, sh);
}

export default function OgImageGenerator() {
  const labels = useCommonLabels();
  const t = useDevToolsExtraLabels("ogImageGenerator");
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: LayerId; offsetX: number; offsetY: number } | null>(null);

  const [title, setTitle] = useState("Your Page Title");
  const [subtitle, setSubtitle] = useState("kitzos.com");
  const [bg, setBg] = useState("#2563eb");
  const [fg, setFg] = useState("#ffffff");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgPos, setBgPos] = useState<BgPosition>({ x: 50, y: 50 });
  const [layers, setLayers] = useState<TextLayer[]>(DEFAULT_LAYERS);
  const [fontsReady, setFontsReady] = useState(false);

  useUnsavedWork(bgImage !== null || title !== "Your Page Title" || subtitle !== "kitzos.com");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap";
    document.head.appendChild(link);
    void document.fonts.load('bold 64px "Noto Sans Arabic"').then(() => setFontsReady(true));
    return () => {
      link.remove();
    };
  }, []);

  const getLayer = (id: LayerId) => layers.find((l) => l.id === id)!;

  const textFor = (id: LayerId) => (id === "title" ? title : subtitle);

  const onPointerDown = (id: LayerId, e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const layer = getLayer(id);
    dragRef.current = {
      id,
      offsetX: e.clientX - rect.left - layer.x / scaleX,
      offsetY: e.clientY - rect.top - layer.y / scaleY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;
    const rect = container.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = Math.max(0, Math.min(W, (e.clientX - rect.left - drag.offsetX) * scaleX));
    const y = Math.max(0, Math.min(H, (e.clientY - rect.top - drag.offsetY) * scaleY));
    setLayers((prev) => prev.map((l) => (l.id === drag.id ? { ...l, x, y } : l)));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const loadBgImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setBgImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setBgPos({ x: 50, y: 50 });
  };

  const renderToCanvas = useCallback(async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const ctx = setupCanvas(canvas, W, H);

    if (bgImage) {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = bgImage;
      });
      drawImageCover(ctx, img, W, H, bgPos.x, bgPos.y);
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }

    for (const layer of layers) {
      const text = textFor(layer.id);
      if (!text.trim()) continue;
      const arabic = hasArabic(text);
      ctx.fillStyle = fg;
      ctx.font = `${layer.bold ? "bold" : "normal"} ${layer.fontSize}px ${fontFamily(text)}`;
      ctx.direction = arabic ? "rtl" : "ltr";
      ctx.textAlign = arabic ? "right" : "left";
      ctx.textBaseline = "middle";
      ctx.fillText(text.slice(0, 80), layer.x, layer.y);
    }

    return canvas;
    // textFor reads title/subtitle from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg, bgImage, bgPos.x, bgPos.y, fg, layers, title, subtitle]);

  const exportPng = async () => {
    const canvas = await renderToCanvas();
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, "og-image.png");
  };

  return (
    <div className="space-y-4" dir="ltr">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-[var(--line)]"
        style={{ aspectRatio: `${W}/${H}` }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: bg,
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
        {layers.map((layer) => {
          const text = textFor(layer.id);
          const arabic = hasArabic(text);
          return (
            <div
              key={layer.id}
              role="presentation"
              onPointerDown={(e) => onPointerDown(layer.id, e)}
              className="absolute cursor-move select-none touch-none px-1"
              style={{
                left: `${(layer.x / W) * 100}%`,
                top: `${(layer.y / H) * 100}%`,
                transform: arabic ? "translate(-100%, -50%)" : "translate(0, -50%)",
                color: fg,
                fontFamily: fontFamily(text),
                fontSize: `clamp(14px, ${(layer.fontSize / W) * 100}vw, ${layer.fontSize * 0.55}px)`,
                fontWeight: layer.bold ? 700 : 400,
                direction: arabic ? "rtl" : "ltr",
                textAlign: arabic ? "right" : "left",
                maxWidth: "90%",
                lineHeight: 1.2,
                opacity: fontsReady ? 1 : 0.9,
              }}
            >
              {text || (layer.id === "title" ? t.titleFallback : t.subtitleFallback)}
            </div>
          );
        })}
        <p className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/40 px-2 py-0.5 text-xs text-white">
          {t.dragHint}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-[var(--text)]">
          {t.title}
          <input
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mt-1"
          />
        </label>
        <label className="text-sm text-[var(--text)]">
          {t.subtitle}
          <input
            dir="auto"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="input-field mt-1"
          />
        </label>
        <label className="text-sm text-[var(--text)]">
          {t.backgroundColor}
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="mt-1 h-10 w-full cursor-pointer rounded border border-[var(--line)]"
          />
        </label>
        <label className="text-sm text-[var(--text)]">
          {t.textColor}
          <input
            type="color"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className="mt-1 h-10 w-full cursor-pointer rounded border border-[var(--line)]"
          />
        </label>
      </div>

      <FileDropZone
        accept="image/*"
        label={t.uploadBackground}
        compact
        onFiles={(files) => {
          const f = files[0];
          if (f) loadBgImage(f);
        }}
      />

      {bgImage && (
        <div className="space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
          <p className="text-sm font-medium text-[var(--text)]">{t.backgroundPosition}</p>
          <p className="text-xs text-[var(--muted)]">{t.backgroundPositionHint}</p>

          <div
            className="inline-grid grid-cols-3 gap-1"
            role="group"
            aria-label={t.backgroundPosition}
          >
            {POSITION_PRESETS.map((p) => {
              const active = bgPos.x === p.x && bgPos.y === p.y;
              return (
                <button
                  key={p.id}
                  type="button"
                  title={`${p.x}%, ${p.y}%`}
                  onClick={() => setBgPos({ x: p.x, y: p.y })}
                  className={`h-8 w-8 rounded border text-[10px] font-medium transition-colors ${
                    active
                      ? "border-[var(--cat-dev)] bg-[var(--cat-dev)] text-white"
                      : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  ·
                </button>
              );
            })}
          </div>

          <label className="block text-sm text-[var(--text)]">
            {t.positionX(Math.round(bgPos.x))}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={bgPos.x}
              onChange={(e) => setBgPos((p) => ({ ...p, x: Number(e.target.value) }))}
              className="mt-1 w-full accent-[var(--cat-dev)]"
            />
          </label>
          <label className="block text-sm text-[var(--text)]">
            {t.positionY(Math.round(bgPos.y))}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={bgPos.y}
              onChange={(e) => setBgPos((p) => ({ ...p, y: Number(e.target.value) }))}
              className="mt-1 w-full accent-[var(--cat-dev)]"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {bgImage && (
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(bgImage);
              setBgImage(null);
              setBgPos({ x: 50, y: 50 });
            }}
            className="btn-secondary text-sm"
          >
            {t.removeBackground}
          </button>
        )}
        <button
          type="button"
          onClick={() => void exportPng()}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {labels.download} PNG
        </button>
      </div>
    </div>
  );
}
