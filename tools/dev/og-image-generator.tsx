"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus } from "lucide-react";
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

const DEFAULT_LAYERS: TextLayer[] = [
  { id: "title", x: 60, y: H / 2 - 40, fontSize: 64, bold: true },
  { id: "subtitle", x: 60, y: H / 2 + 40, fontSize: 32, bold: false },
];

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

function fontFamily(text: string): string {
  return hasArabic(text) ? '"Noto Sans Arabic", system-ui, sans-serif' : "system-ui, -apple-system, sans-serif";
}

export default function OgImageGenerator() {
  const labels = useCommonLabels();
  const t = useDevToolsExtraLabels("ogImageGenerator");
  const containerRef = useRef<HTMLDivElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: LayerId; offsetX: number; offsetY: number } | null>(null);

  const [title, setTitle] = useState("Your Page Title");
  const [subtitle, setSubtitle] = useState("kitzos.com");
  const [bg, setBg] = useState("#2563eb");
  const [fg, setFg] = useState("#ffffff");
  const [bgImage, setBgImage] = useState<string | null>(null);
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
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
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
  }, [bg, bgImage, fg, layers, title, subtitle]);

  const exportPng = async () => {
    const canvas = await renderToCanvas();
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, "og-image.png");
  };

  return (
    <div className="space-y-4" dir="ltr">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border dark:border-gray-700"
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
            backgroundPosition: "center",
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
        <label className="text-sm">
          {t.title}
          <input
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field mt-1"
          />
        </label>
        <label className="text-sm">
          {t.subtitle}
          <input
            dir="auto"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="input-field mt-1"
          />
        </label>
        <label className="text-sm">
          {t.backgroundColor}
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="mt-1 h-10 w-full cursor-pointer rounded border dark:border-gray-600"
          />
        </label>
        <label className="text-sm">
          {t.textColor}
          <input
            type="color"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className="mt-1 h-10 w-full cursor-pointer rounded border dark:border-gray-600"
          />
        </label>
      </div>

      <input
        ref={bgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadBgImage(f);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => bgInputRef.current?.click()}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ImagePlus className="h-4 w-4" />
          {t.uploadBackground}
        </button>
        {bgImage && (
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(bgImage);
              setBgImage(null);
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
