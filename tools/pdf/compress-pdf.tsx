"use client";

import FileDropZone from "@/components/FileDropZone";
import { useEffect, useRef, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  loadPdfDocument,
  releasePdfDocument,
  renderPdfBytesPageThumb,
  renderPdfPageThumb,
} from "@/lib/pdf/thumbnails";
import { bytesForPdfLoad, clonePdfBytes, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
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

/** DPI + JPEG quality per tier (diagnostic-tuned). */
const QUALITY_TIERS: Record<Quality, { dpi: number; jpegQuality: number }> = {
  low: { dpi: 96, jpegQuality: 0.5 },
  medium: { dpi: 130, jpegQuality: 0.6 },
  high: { dpi: 165, jpegQuality: 0.72 },
};

/** Measured PDF wrapper overhead ≈ 0.64% → 1.01 multiplier on projected JPEG sum. */
const PREFLIGHT_OVERHEAD = 1.01;

interface CompressResult {
  originalSize: number;
  newSize: number;
  bytes: Uint8Array;
  isLarger: boolean;
}

interface PreflightGrow {
  projected: number;
  originalSize: number;
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

function samplePageIndices(pageCount: number): number[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const raw = [
    1,
    Math.round(pageCount * 0.25),
    Math.round(pageCount * 0.5),
    Math.round(pageCount * 0.75),
    pageCount,
  ];
  const uniq = Array.from(
    new Set(raw.map((n) => Math.min(pageCount, Math.max(1, n))))
  );
  return uniq.sort((a, b) => a - b);
}

function applyGrayscale(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    // Rec. 601 luminance — forces chroma to zero before JPEG encode.
    const y = (data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114) | 0;
    data[i] = y;
    data[i + 1] = y;
    data[i + 2] = y;
  }
  ctx.putImageData(image, 0, 0);
}

async function canvasToJpeg(
  canvas: HTMLCanvasElement,
  jpegQuality: number
): Promise<Uint8Array> {
  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("JPEG failed."))),
      "image/jpeg",
      jpegQuality
    );
  });
  return new Uint8Array(await jpegBlob.arrayBuffer());
}

async function renderPageJpeg(
  // pdfjs PDFPageProxy — keep loose to avoid fighting RenderParameters typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  dpi: number,
  jpegQuality: number,
  grayscale: boolean
): Promise<{ jpegBytes: Uint8Array; wPt: number; hPt: number }> {
  const base = page.getViewport({ scale: 1 });
  const scale = dpi / 72;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  if (grayscale) applyGrayscale(canvas, ctx);
  const jpegBytes = await canvasToJpeg(canvas, jpegQuality);
  return { jpegBytes, wPt: base.width, hPt: base.height };
}

async function compressOptimize(sourceBytes: Uint8Array): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const pdf = await PDFDocument.load(bytesForPdfLoad(sourceBytes));
  return pdf.save({ useObjectStreams: true });
}

async function loadPdfjsDocument(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const data = await file.arrayBuffer();
  return pdfjs.getDocument({ data }).promise;
}

async function preflightStrong(
  file: File,
  quality: Quality,
  grayscale: boolean
): Promise<{ projected: number; pageCount: number; sampleBytes: number }> {
  const tier = QUALITY_TIERS[quality];
  const pdf = await loadPdfjsDocument(file);
  const indices = samplePageIndices(pdf.numPages);
  let sum = 0;
  for (const i of indices) {
    const page = await pdf.getPage(i);
    const { jpegBytes } = await renderPageJpeg(
      page,
      tier.dpi,
      tier.jpegQuality,
      grayscale
    );
    sum += jpegBytes.length;
    await yieldToMain();
  }
  const projected = (sum / indices.length) * pdf.numPages * PREFLIGHT_OVERHEAD;
  return { projected, pageCount: pdf.numPages, sampleBytes: sum };
}

async function compressStrong(
  file: File,
  quality: Quality,
  grayscale: boolean,
  onProgress: (pct: number) => void
): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const tier = QUALITY_TIERS[quality];
  const pdf = await loadPdfjsDocument(file);
  const outPdf = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const { jpegBytes, wPt, hPt } = await renderPageJpeg(
      page,
      tier.dpi,
      tier.jpegQuality,
      grayscale
    );
    const image = await outPdf.embedJpg(jpegBytes);
    const pdfPage = outPdf.addPage([wPt, hPt]);
    pdfPage.drawImage(image, { x: 0, y: 0, width: wPt, height: hPt });

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
  const [grayscale, setGrayscale] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimateLabel, setEstimateLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [preflightGrow, setPreflightGrow] = useState<PreflightGrow | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
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

  const clearRunState = () => {
    setResult(null);
    setPreflightGrow(null);
    setEstimateLabel(null);
    setProgress(0);
    setError(null);
  };

  const loadPdf = async (pdfFile: File) => {
    clearRunState();
    try {
      const bytes = await readPdfFileBytes(pdfFile);
      const { PDFDocument } = await getPdfLib();
      await PDFDocument.load(bytesForPdfLoad(bytes));
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

  const finishStrongResult = async (
    newBytes: Uint8Array,
    originalSize: number
  ) => {
    // Keep a private copy — pdf.js thumbnail load can detach the save() buffer.
    const safeBytes = clonePdfBytes(newBytes);
    const newSize = safeBytes.length;
    setResult({
      originalSize,
      newSize,
      bytes: safeBytes,
      isLarger: newSize >= originalSize,
    });
    if (newSize < originalSize) {
      const thumb = await renderPdfBytesPageThumb(clonePdfBytes(safeBytes), 0, { scale: 0.45 });
      setCompressedPreviewSrc(thumb);
    } else {
      setCompressedPreviewSrc(null);
    }
  };

  const runCompress = async (opts?: { force?: boolean; quality?: Quality; grayscale?: boolean }) => {
    if (!file || !originalBytesRef.current) return;

    const q = opts?.quality ?? quality;
    const gray = opts?.grayscale ?? grayscale;
    const originalSize = originalBytesRef.current.length;

    setCompressing(true);
    setError(null);
    setResult(null);
    setPreflightGrow(null);
    setProgress(0);
    setEstimateLabel(null);
    setCompressedPreviewSrc(null);

    try {
      if (mode === "optimize") {
        setProgress(50);
        await yieldToMain();
        const newBytes = clonePdfBytes(await compressOptimize(originalBytesRef.current));
        setProgress(100);
        const newSize = newBytes.length;
        setResult({
          originalSize,
          newSize,
          bytes: newBytes,
          isLarger: newSize >= originalSize,
        });
        setCompressedPreviewSrc(null);
        return;
      }

      setEstimateLabel(t.preflightEstimating);
      const pre = await preflightStrong(file, q, gray);
      const projected = Math.round(pre.projected);
      setEstimateLabel(t.estimatedSize(formatBytes(projected)));

      if (projected >= originalSize && !opts?.force) {
        setPreflightGrow({ projected, originalSize });
        setCompressing(false);
        return;
      }

      const newBytes = await compressStrong(file, q, gray, setProgress);
      await finishStrongResult(newBytes, originalSize);
    } catch {
      setError(t.errCompressFailed);
    } finally {
      setCompressing(false);
    }
  };

  const applyLowestAndRecheck = () => {
    setQuality("low");
    setGrayscale(true);
    void runCompress({ quality: "low", grayscale: true });
  };

  const savedPct =
    result && result.newSize < result.originalSize
      ? Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100)
      : 0;

  const tier = QUALITY_TIERS[quality];

  const controls = (
    <>
      <FileDropZone
        accept=".pdf,application/pdf"
        label={t.uploadHint}
        onFiles={(files) => {
          const f = files[0];
          if (f) void loadPdf(f);
        }}
      />

      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-[var(--cat-pdf)]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text)]">{file.name}</p>
            <p className="text-xs text-[var(--muted)]">{formatBytes(file.size)}</p>
          </div>
        </div>
      )}

      {file && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-[var(--text)]">{t.modeLabel}</legend>
          <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
            <input
              type="radio"
              name="compress-mode"
              checked={mode === "optimize"}
              onChange={() => {
                setMode("optimize");
                clearRunState();
              }}
              className="mt-1 h-4 w-4 border-[var(--line)] text-[var(--cat-pdf)] focus:ring-[var(--cat-pdf)]"
            />
            <span>
              <span className="font-medium text-[var(--text)]">{t.modeOptimize}</span>
              <span className="mt-0.5 block text-xs text-[var(--muted)]">{t.modeOptimizeHint}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
            <input
              type="radio"
              name="compress-mode"
              checked={mode === "strong"}
              onChange={() => {
                setMode("strong");
                clearRunState();
              }}
              className="mt-1 h-4 w-4 border-[var(--line)] text-[var(--cat-pdf)] focus:ring-[var(--cat-pdf)]"
            />
            <span>
              <span className="font-medium text-[var(--text)]">{t.modeStrong}</span>
              <span className="mt-0.5 block text-xs text-[var(--muted)]">{t.modeStrongHint}</span>
            </span>
          </label>
        </fieldset>
      )}

      {file && mode === "strong" && (
        <>
          <p className="tool-notice tool-notice--warning tool-notice--pdf" role="status">
            {t.strongWarning}
          </p>
          <div>
            <label htmlFor="compress-quality" className="text-sm font-medium text-[var(--text)]">
              {t.qualityLabel}
            </label>
            <select
              id="compress-quality"
              value={quality}
              onChange={(e) => {
                setQuality(e.target.value as Quality);
                setPreflightGrow(null);
                setEstimateLabel(null);
              }}
              className="input-field mt-1"
            >
              <option value="low">{t.qualityLow}</option>
              <option value="medium">{t.qualityMedium}</option>
              <option value="high">{t.qualityHigh}</option>
            </select>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {t.qualityDpiDetail(tier.dpi)}
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm text-[var(--text)]">
            <input
              type="checkbox"
              checked={grayscale}
              onChange={(e) => {
                setGrayscale(e.target.checked);
                setPreflightGrow(null);
                setEstimateLabel(null);
              }}
              className="mt-0.5 h-4 w-4 rounded border-[var(--line)] text-[var(--cat-pdf)] focus:ring-[var(--cat-pdf)]"
            />
            <span>{t.grayscaleLabel}</span>
          </label>
        </>
      )}

      {compressing && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full bg-[var(--cat-pdf)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-[var(--muted)]">{t.progress(progress)}</p>
          {estimateLabel && (
            <p className="text-center text-xs text-[var(--muted)]">{estimateLabel}</p>
          )}
        </div>
      )}

      {!compressing && estimateLabel && !preflightGrow && mode === "strong" && (
        <p className="text-xs text-[var(--muted)]" role="status">
          {estimateLabel}
        </p>
      )}

      {preflightGrow && (
        <div
          className="space-y-3 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100"
          role="status"
        >
          <p>
            {t.preflightWouldGrow(
              formatBytes(preflightGrow.projected),
              formatBytes(preflightGrow.originalSize)
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={applyLowestAndRecheck} className="btn-primary text-sm">
              {t.preflightSwitchLowest}
            </button>
            <button
              type="button"
              onClick={() => void runCompress({ force: true })}
              className="btn-secondary text-sm"
            >
              {t.preflightProceedAnyway}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
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
                downloadBlob(pdfBytesToBlob(result.bytes), `${baseName}-compressed.pdf`);
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
        onClick={() => void runCompress()}
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewSrc} alt="" className="mx-auto max-h-64 w-full object-contain" />
                </div>
              )}
              {compressedPreviewSrc && (
                <div className="overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2">
                  <p className="mb-1 text-center text-[11px] text-muted">{t.newSize}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={compressedPreviewSrc}
                    alt=""
                    className="mx-auto max-h-64 w-full object-contain"
                  />
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
                          pdfBytesToBlob(result.bytes),
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
                    <button
                      type="button"
                      onClick={() => downloadBlob(file, file.name)}
                      className="btn-primary"
                    >
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
