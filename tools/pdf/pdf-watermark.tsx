"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { downloadBlob } from "@/lib/audio-utils";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

interface WatermarkPage {
  getSize(): { width: number; height: number };
  drawText(
    text: string,
    options: {
      x: number;
      y: number;
      size: number;
      color: ReturnType<(typeof import("pdf-lib"))["rgb"]>;
      opacity: number;
      rotate: ReturnType<(typeof import("pdf-lib"))["degrees"]>;
    }
  ): void;
}

function loadPdfLib() {
  return import("pdf-lib");
}

let pdfLibPromise: ReturnType<typeof loadPdfLib> | undefined;

function getPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = loadPdfLib();
  return pdfLibPromise;
}

export default function PdfWatermark() {
  const t = usePdfToolLabels("pdfWatermark");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [tile, setTile] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(file !== null);

  const drawWatermark = (
    page: WatermarkPage,
    watermarkText: string,
    size: number,
    alpha: number,
    tiled: boolean,
    rgb: (typeof import("pdf-lib"))["rgb"],
    degrees: (typeof import("pdf-lib"))["degrees"]
  ) => {
    const { width, height } = page.getSize();
    const textWidth = watermarkText.length * size * 0.55;

    if (!tiled) {
      page.drawText(watermarkText, {
        x: width / 2 - textWidth / 2,
        y: height / 2,
        size,
        color: rgb(0.5, 0.5, 0.5),
        opacity: alpha,
        rotate: degrees(-35),
      });
      return;
    }

    const stepX = textWidth + size;
    const stepY = size * 2.5;
    for (let y = -stepY; y < height + stepY; y += stepY) {
      for (let x = -width; x < width * 2; x += stepX) {
        page.drawText(watermarkText, {
          x,
          y,
          size,
          color: rgb(0.5, 0.5, 0.5),
          opacity: alpha,
          rotate: degrees(-35),
        });
      }
    }
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument, rgb, degrees } = await getPdfLib();
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        drawWatermark(page, text, fontSize, opacity, tile, rgb, degrees);
      }
      const out = await pdfDoc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), `watermarked-${file.name}`);
    } catch {
      setError(t.errWatermarkFailed);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary inline-flex items-center gap-2">
        <Upload className="h-4 w-4" />
        {file ? file.name : t.uploadPdf}
      </button>

      <label className="block text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.watermarkText}</span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-field mt-1"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.sizeLabel(fontSize)}</span>
        <input
          type="range"
          min={16}
          max={120}
          step={2}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.opacityLabel(Math.round(opacity * 100))}</span>
        <input
          type="range"
          min={0.1}
          max={0.8}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.layout}</p>
        <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setTile(false)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              !tile ? "bg-primary-600 text-white" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t.single}
          </button>
          <button
            type="button"
            onClick={() => setTile(true)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tile ? "bg-primary-600 text-white" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {t.tiled}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => void apply()}
        disabled={!file || processing}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t.applyAndDownload}
      </button>
    </div>
  );
}
