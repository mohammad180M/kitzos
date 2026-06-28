"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

const CANVAS_WIDTH = 600;

const FONT_OPTIONS = [
  { id: "impact", label: "Impact", css: "bold 36px Impact, Haettenschweiler, sans-serif" },
  { id: "arial", label: "Arial Black", css: "bold 36px 'Arial Black', Arial, sans-serif" },
  { id: "comic", label: "Comic Sans", css: "bold 36px 'Comic Sans MS', cursive, sans-serif" },
  { id: "noto-ar", label: "Noto Sans Arabic", css: "bold 36px 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" },
  { id: "georgia", label: "Georgia", css: "bold 36px Georgia, 'Times New Roman', serif" },
  { id: "courier", label: "Courier", css: "bold 32px 'Courier New', Courier, monospace" },
] as const;

export default function MemeGenerator() {
  const labels = useCommonLabels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [topText, setTopText] = useState("TOP TEXT");
  const [bottomText, setBottomText] = useState("BOTTOM TEXT");
  const [fontId, setFontId] = useState<(typeof FONT_OPTIONS)[number]["id"]>("impact");
  const [hasImage, setHasImage] = useState(false);

  const fontCss = FONT_OPTIONS.find((f) => f.id === fontId)?.css ?? FONT_OPTIONS[0].css;

  const render = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const h = (img.naturalHeight / img.naturalWidth) * CANVAS_WIDTH;
    const ctx = setupCanvas(canvas, CANVAS_WIDTH, h);
    ctx.drawImage(img, 0, 0, CANVAS_WIDTH, h);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.textAlign = "center";
    ctx.font = fontCss;

    const drawText = (text: string, y: number) => {
      const value = fontId === "noto-ar" ? text : text.toUpperCase();
      ctx.strokeText(value, CANVAS_WIDTH / 2, y);
      ctx.fillText(value, CANVAS_WIDTH / 2, y);
    };

    drawText(topText, 44);
    drawText(bottomText, h - 16);
  };

  useEffect(() => {
    if (hasImage) render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topText, bottomText, hasImage, fontId]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const loadImage = (file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setHasImage(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      objectUrlRef.current = null;
      setHasImage(false);
    };
    img.src = url;
  };

  const exportMeme = async () => {
    render();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, "meme.png");
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadImage(file);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Upload image
      </button>

      {hasImage && (
        <canvas
          ref={canvasRef}
          className="mx-auto max-w-full rounded-lg border dark:border-gray-700"
        />
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Font</p>
        <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFontId(f.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                fontId === f.id
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Top text
          <input
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            className="input-field mt-1"
            disabled={!hasImage}
          />
        </label>
        <label className="text-sm">
          Bottom text
          <input
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            className="input-field mt-1"
            disabled={!hasImage}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void exportMeme()}
        disabled={!hasImage}
        className="btn-primary inline-flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {labels.download}
      </button>
    </div>
  );
}
