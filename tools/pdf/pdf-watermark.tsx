"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { renderWatermarkPreview } from "@/lib/pdf/preview-render";
import {
  getPdfPageCount,
  loadPdfDocument,
  releasePdfDocument,
} from "@/lib/pdf/thumbnails";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import { useUnsavedWork } from "@/lib/unsaved-work";

function loadPdfLib() {
  return import("pdf-lib");
}

export default function PdfWatermark() {
  const t = usePdfToolLabels("pdfWatermark");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
  const [tile, setTile] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const debouncedText = useDebouncedValue(text, 300);
  const debouncedOpacity = useDebouncedValue(opacity, 300);
  const debouncedFontSize = useDebouncedValue(fontSize, 300);
  const debouncedTile = useDebouncedValue(tile, 300);

  useUnsavedWork(file !== null);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    return () => {
      if (fileRef.current) releasePdfDocument(fileRef.current);
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewSrc(null);
      return;
    }
    let cancelled = false;
    void renderWatermarkPreview(file, previewPage - 1, {
      text: debouncedText,
      fontSize: debouncedFontSize,
      opacity: debouncedOpacity,
      tiled: debouncedTile,
    }).then((url) => {
      if (!cancelled) setPreviewSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [file, previewPage, debouncedText, debouncedFontSize, debouncedOpacity, debouncedTile]);

  const onFile = async (f: File) => {
    if (file) releasePdfDocument(file);
    setFile(f);
    setError(null);
    try {
      const count = await getPdfPageCount(f);
      await loadPdfDocument(f);
      setPageCount(count);
      setPreviewPage(1);
    } catch {
      setPageCount(0);
    }
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument, rgb, degrees } = await loadPdfLib();
      const pdfBytes = await readPdfFileBytes(file);
      const pdfDoc = await PDFDocument.load(bytesForPdfLoad(pdfBytes));
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = text.length * fontSize * 0.55;
        if (!tile) {
          page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size: fontSize,
            color: rgb(0.5, 0.5, 0.5),
            opacity,
            rotate: degrees(-35),
          });
        } else {
          const stepX = textWidth + fontSize;
          const stepY = fontSize * 2.5;
          for (let y = -stepY; y < height + stepY; y += stepY) {
            for (let x = -width; x < width * 2; x += stepX) {
              page.drawText(text, {
                x,
                y,
                size: fontSize,
                color: rgb(0.5, 0.5, 0.5),
                opacity,
                rotate: degrees(-35),
              });
            }
          }
        }
      }
      const out = await pdfDoc.save();
      const { downloadBlob } = await import("@/lib/audio-utils");
      downloadBlob(pdfBytesToBlob(out), `watermarked-${file.name}`);
    } catch {
      setError(t.errWatermarkFailed);
    } finally {
      setProcessing(false);
    }
  };

  const controls = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />

      <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary inline-flex items-center gap-2">
        <Upload className="h-4 w-4" />
        {file ? file.name : t.uploadPdf}
      </button>

      <label className="block text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{t.watermarkText}</span>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="input-field mt-1" />
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
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={!!file}
      controls={controls}
      preview={
        file ? (
          <PdfPreviewPane totalCount={pageCount} singleColumn>
            <div className="space-y-3">
              {pageCount > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    disabled={previewPage <= 1}
                    onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                  >
                    ‹
                  </button>
                  <span className="text-xs text-muted">
                    {previewPage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    disabled={previewPage >= pageCount}
                    onClick={() => setPreviewPage((p) => Math.min(pageCount, p + 1))}
                  >
                    ›
                  </button>
                </div>
              )}
              <div className="relative overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2">
                {!previewSrc && <div className="pdf-preview-shimmer aspect-[3/4] w-full rounded" aria-hidden="true" />}
                {previewSrc && (
                  <img src={previewSrc} alt="" className="mx-auto max-h-80 w-full object-contain" />
                )}
              </div>
            </div>
          </PdfPreviewPane>
        ) : null
      }
    />
  );
}
