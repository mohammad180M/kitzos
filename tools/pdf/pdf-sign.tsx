"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Download, Loader2, Upload } from "lucide-react";
import { setupCanvas } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";

const PAD_WIDTH = 400;
const PAD_HEIGHT = 150;

type PageMode = "current" | "all" | "range";

function parsePageRange(range: string, totalPages: number): number[] {
  const pages = new Set<number>();
  for (const part of range.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (isNaN(start) || isNaN(end)) continue;
      for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) pages.add(i);
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) pages.add(n);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export default function PdfSign() {
  const t = usePdfToolLabels("pdfSign");
  const labels = useCommonLabels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageMode, setPageMode] = useState<PageMode>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageRange, setPageRange] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = PAD_WIDTH / rect.width;
    const scaleY = PAD_HEIGHT / rect.height;
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = PAD_WIDTH / rect.width;
    const scaleY = PAD_HEIGHT / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) setupCanvas(canvas, PAD_WIDTH, PAD_HEIGHT);
  }, []);

  const loadPdf = async (file: File) => {
    setPdfFile(file);
    setError(null);
    try {
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const count = pdfDoc.getPageCount();
      setPageCount(count);
      setCurrentPage(1);
      setPageRange(`1${count > 1 ? `-${count}` : ""}`);
    } catch {
      setPageCount(0);
      setError(t.errReadFailed);
    }
  };

  const getTargetPageIndices = (total: number): number[] => {
    if (pageMode === "all") {
      return Array.from({ length: total }, (_, i) => i);
    }
    if (pageMode === "current") {
      const idx = Math.max(0, Math.min(total - 1, currentPage - 1));
      return [idx];
    }
    const pages = parsePageRange(pageRange, total);
    if (pages.length === 0) return [];
    return pages.map((p) => p - 1);
  };

  const applySignature = async () => {
    if (!pdfFile || !canvasRef.current) return;
    setProcessing(true);
    setError(null);
    try {
      const sigBlob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((b) => (b ? resolve(b) : reject()), "image/png");
      });
      const sigBytes = new Uint8Array(await sigBlob.arrayBuffer());
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const pageIndices = getTargetPageIndices(pdfDoc.getPageCount());

      if (pageIndices.length === 0) {
        setError(t.errInvalidRange);
        return;
      }

      const sigW = 150;
      const sigH = (sigImage.height / sigImage.width) * sigW;

      for (const idx of pageIndices) {
        const page = pdfDoc.getPage(idx);
        const { width } = page.getSize();
        page.drawImage(sigImage, {
          x: width - sigW - 50,
          y: 50,
          width: sigW,
          height: sigH,
        });
      }

      const out = await pdfDoc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), `signed-${pdfFile.name}`);
    } catch {
      setError(t.errSignFailed);
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
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void loadPdf(f);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {pdfFile ? pdfFile.name : t.uploadPdf}
      </button>

      {pageCount > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.pageCount(pageCount)}
        </p>
      )}

      {pageCount > 0 && (
        <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.applySignatureTo}</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "current" as PageMode, label: t.currentPage },
                { id: "all" as PageMode, label: t.allPages },
                { id: "range" as PageMode, label: t.pageRange },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPageMode(id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pageMode === id
                    ? "bg-primary-600 text-white"
                    : "border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {pageMode === "current" && (
            <label className="block text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.pageNumber}</span>
              <input
                type="number"
                min={1}
                max={pageCount}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="input-field mt-1"
              />
            </label>
          )}

          {pageMode === "range" && (
            <label className="block text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t.pagesRangeHint}</span>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder={t.pagesRangePlaceholder}
                className="input-field mt-1"
              />
            </label>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.drawSignature}</p>
        <canvas
          ref={canvasRef}
          className="w-full max-w-md cursor-crosshair rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
          style={{ touchAction: "none" }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        <button type="button" onClick={clearPad} className="mt-2 text-sm text-gray-500 hover:text-gray-700">
          {labels.clear}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => void applySignature()}
        disabled={!pdfFile || processing}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t.signAndDownload}
      </button>
    </div>
  );
}
