"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  loadPdfDocument,
  releasePdfDocument,
  renderPdfBytesPageThumb,
  renderPdfPageThumb,
} from "@/lib/pdf/thumbnails";
import { useUnsavedWork } from "@/lib/unsaved-work";

function loadPdfLib() {
  return import("pdf-lib");
}

let pdfLibPromise: ReturnType<typeof loadPdfLib> | undefined;

function getPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = loadPdfLib();
  return pdfLibPromise;
}

type CompressMode = "optimize" | "strong";
type Quality = "low" | "medium" | "high";

const DPI_MAP: Record<Quality, number> = { low: 96, medium: 144, high: 200 };

interface CompressResult {
  originalSize: number;
  newSize: number;
  bytes: Uint8Array;
  isLarger: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function compressOptimize(sourceBytes: Uint8Array): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const pdf = await PDFDocument.load(sourceBytes);
  return pdf.save({ useObjectStreams: true });
}

async function compressStrong(
  file: File,
  quality: Quality,
  onProgress: (pct: number) => void
): Promise<Uint8Array> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const { PDFDocument } = await getPdfLib();

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const outPdf = await PDFDocument.create();
  const scale = DPI_MAP[quality] / 72;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("JPEG failed."))), "image/jpeg", 0.7);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const image = await outPdf.embedJpg(jpegBytes);
    const pdfPage = outPdf.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });

    onProgress(Math.round((i / pdf.numPages) * 100));
    await yieldToMain();
  }

  return outPdf.save({ useObjectStreams: true });
}

export default function CompressPdf() {
  const t = usePdfToolLabels("compressPdf");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressMode>("optimize");
  const [quality, setQuality] = useState<Quality>("medium");
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const originalBytesRef = useRef<Uint8Array | null>(null);
  const fileRef = useRef<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [compressedPreviewSrc, setCompressedPreviewSrc] = useState<string | null>(null);

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
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setWorkerReady(true);
    });
  }, []);

  const loadPdf = async (pdfFile: File) => {
    setError(null);
    setResult(null);
    setProgress(0);
    try {
      const bytes = new Uint8Array(await pdfFile.arrayBuffer());
      const { PDFDocument } = await getPdfLib();
      await PDFDocument.load(bytes);
      originalBytesRef.current = bytes;
      setFile(pdfFile);
      await loadPdfDocument(pdfFile);
      const thumb = await renderPdfPageThumb(pdfFile, 0, { scale: 0.45 });
      setPreviewSrc(thumb);
      setCompressedPreviewSrc(null);
    } catch {
      setFile(null);
      originalBytesRef.current = null;
      setError(t.errReadFailed);
    }
  };

  const runCompress = async () => {
    if (!file || !originalBytesRef.current) return;

    setCompressing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const originalSize = originalBytesRef.current.length;
      let newBytes: Uint8Array;

      if (mode === "optimize") {
        setProgress(50);
        await yieldToMain();
        newBytes = await compressOptimize(originalBytesRef.current);
        setProgress(100);
      } else {
        newBytes = await compressStrong(file, quality, setProgress);
      }

      const newSize = newBytes.length;
      setResult({
        originalSize,
        newSize,
        bytes: newBytes,
        isLarger: newSize >= originalSize,
      });

      if (mode === "strong" && newSize < originalSize) {
        const thumb = await renderPdfBytesPageThumb(newBytes, 0, { scale: 0.45 });
        setCompressedPreviewSrc(thumb);
      } else {
        setCompressedPreviewSrc(null);
      }
    } catch {
      setError(t.errCompressFailed);
    } finally {
      setCompressing(false);
    }
  };

  const savedPct =
    result && result.newSize < result.originalSize
      ? Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100)
      : 0;

  const controls = (
    <>
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
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.uploadHint}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadPdf(f);
            e.target.value = "";
          }}
        />
      </div>

      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <FileText className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
          </div>
        </div>
      )}

      {file && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.modeLabel}</legend>
          <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name="compress-mode"
              checked={mode === "optimize"}
              onChange={() => setMode("optimize")}
              className="mt-1 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:text-primary-400"
            />
            <span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{t.modeOptimize}</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{t.modeOptimizeHint}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name="compress-mode"
              checked={mode === "strong"}
              onChange={() => setMode("strong")}
              className="mt-1 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:text-primary-400"
            />
            <span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{t.modeStrong}</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{t.modeStrongHint}</span>
            </span>
          </label>
        </fieldset>
      )}

      {file && mode === "strong" && (
        <>
          <p
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
            role="status"
          >
            {t.strongWarning}
          </p>
          <div>
            <label htmlFor="compress-quality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.qualityLabel}
            </label>
            <select
              id="compress-quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as Quality)}
              className="input-field mt-1"
            >
              <option value="low">{t.qualityLow}</option>
              <option value="medium">{t.qualityMedium}</option>
              <option value="high">{t.qualityHigh}</option>
            </select>
          </div>
        </>
      )}

      {compressing && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-primary-600 transition-all dark:bg-primary-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">{t.progress(progress)}</p>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="flex flex-wrap gap-2 lg:hidden">
          {!result.isLarger && (
            <button
              type="button"
              onClick={() => {
                const baseName = file?.name.replace(/\.pdf$/i, "") || "document";
                downloadBlob(
                  new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
                  `${baseName}-compressed.pdf`
                );
              }}
              className="btn-primary"
            >
              <Download className="h-4 w-4" />
              {t.downloadCompressed}
            </button>
          )}
          {result.isLarger && file && (
            <button type="button" onClick={() => downloadBlob(file, file.name)} className="btn-primary">
              <Download className="h-4 w-4" />
              {t.downloadOriginal}
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={runCompress}
        disabled={!file || compressing || !workerReady}
        className="btn-primary"
      >
        {compressing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.compressing}
          </>
        ) : (
          t.compress
        )}
      </button>
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={!!file}
      controls={controls}
      preview={
        file ? (
          <PdfPreviewPane totalCount={1} sizeBadge={formatBytes(file.size)} singleColumn>
            <div className="space-y-3">
              {previewSrc && (
                <div className="overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2">
                  <img src={previewSrc} alt="" className="mx-auto max-h-64 w-full object-contain" />
                </div>
              )}
              {compressedPreviewSrc && (
                <div className="overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2">
                  <p className="mb-1 text-center text-[11px] text-muted">{t.newSize}</p>
                  <img src={compressedPreviewSrc} alt="" className="mx-auto max-h-64 w-full object-contain" />
                </div>
              )}
              {result && (
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-muted">{t.originalSize}</dt>
                    <dd className="font-medium text-foreground">{formatBytes(result.originalSize)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">{t.newSize}</dt>
                    <dd className="font-medium text-foreground">{formatBytes(result.newSize)}</dd>
                  </div>
                  {!result.isLarger && (
                    <div className="col-span-2">
                      <dt className="text-muted">{t.saved}</dt>
                      <dd className="font-medium text-green-700 dark:text-green-400">{savedPct}%</dd>
                    </div>
                  )}
                </dl>
              )}
              {result?.isLarger && (
                <p className="text-sm text-amber-800 dark:text-amber-200">{t.largerWarning}</p>
              )}
              {result && (
                <div className="hidden flex-wrap gap-2 lg:flex">
                  {!result.isLarger && (
                    <button
                      type="button"
                      onClick={() => {
                        const baseName = file.name.replace(/\.pdf$/i, "") || "document";
                        downloadBlob(
                          new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
                          `${baseName}-compressed.pdf`
                        );
                      }}
                      className="btn-primary"
                    >
                      <Download className="h-4 w-4" />
                      {t.downloadCompressed}
                    </button>
                  )}
                  {result.isLarger && (
                    <button type="button" onClick={() => downloadBlob(file, file.name)} className="btn-primary">
                      <Download className="h-4 w-4" />
                      {t.downloadOriginal}
                    </button>
                  )}
                </div>
              )}
            </div>
          </PdfPreviewPane>
        ) : null
      }
    />
  );
}
