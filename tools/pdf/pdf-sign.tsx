"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Trash2, Upload } from "lucide-react";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import SignaturePlacementPreview from "@/components/pdf/SignaturePlacementPreview";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { downloadBlob } from "@/lib/download";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { usePdfSharedLabels, usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  canvasHasInk,
  DEFAULT_PLACEMENT,
  exportPadAt2x,
  normalizeImageToPng,
  placementToPdfCoords,
  type SignaturePlacement,
} from "@/lib/pdf/signature-image";
import {
  getPdfPageCount,
  loadPdfDocument,
  releasePdfDocument,
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

const PAD_WIDTH = 400;
const PAD_HEIGHT = 150;

function syncPadCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width === w && canvas.height === h) return;

  const prev = document.createElement("canvas");
  prev.width = canvas.width;
  prev.height = canvas.height;
  const prevCtx = prev.getContext("2d");
  if (prevCtx && canvas.width > 0) prevCtx.drawImage(canvas, 0, 0);

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx && prev.width > 0) {
    ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, w, h);
  }
}

function padLogicalSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

type PageMode = "current" | "all" | "range";
type SigSource = "draw" | "upload";
type PenColor = "#000000" | "#1e3a8a" | "#dc2626";
type PenSize = 2 | 4 | 6;

const PEN_COLORS: PenColor[] = ["#000000", "#1e3a8a", "#dc2626"];
const PEN_SIZES: PenSize[] = [2, 4, 6];

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
  const shared = usePdfSharedLabels();
  const labels = useCommonLabels();

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<File | null>(null);
  const drawing = useRef(false);
  const strokePoints = useRef<{ x: number; y: number }[]>([]);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageMode, setPageMode] = useState<PageMode>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewPage, setPreviewPage] = useState(1);
  const [pageRange, setPageRange] = useState("1");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sigSource, setSigSource] = useState<SigSource>("draw");
  const [penColor, setPenColor] = useState<PenColor>("#000000");
  const [penSize, setPenSize] = useState<PenSize>(4);
  const [drawHasInk, setDrawHasInk] = useState(false);
  const [sigPreviewUrl, setSigPreviewUrl] = useState<string | null>(null);
  const [sigAspectRatio, setSigAspectRatio] = useState(PAD_WIDTH / PAD_HEIGHT);
  const [uploadedSig, setUploadedSig] = useState<{ blob: Blob; previewUrl: string } | null>(null);
  const [lastUploadFile, setLastUploadFile] = useState<File | null>(null);
  const [removeWhiteBg, setRemoveWhiteBg] = useState(false);
  const [placement, setPlacement] = useState<SignaturePlacement>(DEFAULT_PLACEMENT);
  const [pageSrc, setPageSrc] = useState<string | null>(null);

  useUnsavedWork(pdfFile !== null);

  const hasSignature = sigSource === "draw" ? drawHasInk : uploadedSig !== null;

  const targetPageCount =
    pageMode === "all"
      ? pageCount
      : pageMode === "current"
        ? 1
        : parsePageRange(pageRange, pageCount).length;

  useEffect(() => {
    fileRef.current = pdfFile;
  }, [pdfFile]);

  useEffect(() => {
    return () => {
      if (fileRef.current) releasePdfDocument(fileRef.current);
      if (uploadedSig?.previewUrl) URL.revokeObjectURL(uploadedSig.previewUrl);
    };
  }, [uploadedSig?.previewUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => syncPadCanvas(canvas);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (pageMode === "current") setPreviewPage(currentPage);
  }, [pageMode, currentPage]);

  useEffect(() => {
    if (lastUploadFile && sigSource === "upload") {
      void handleSigUpload(lastUploadFile, removeWhiteBg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeWhiteBg]);

  useEffect(() => {
    if (!pdfFile) {
      setPageSrc(null);
      return;
    }
    let cancelled = false;
    void renderPdfPageThumb(pdfFile, previewPage - 1, { scale: 0.55 }).then((url) => {
      if (!cancelled) setPageSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [pdfFile, previewPage]);

  const refreshDrawPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasHasInk(canvas)) {
      setDrawHasInk(false);
      setSigPreviewUrl(null);
      return;
    }
    setDrawHasInk(true);
    const { width, height } = padLogicalSize(canvas);
    setSigAspectRatio(width / height);
    try {
      const blob = await exportPadAt2x(canvas, width, height);
      const url = URL.createObjectURL(blob);
      setSigPreviewUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      setSigPreviewUrl(null);
    }
  }, []);

  const canvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const strokeLineWidth = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return penSize * (canvas.width / rect.width);
  };

  const drawSmoothSegment = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = strokeLineWidth(ctx.canvas);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    strokePoints.current = [canvasPoint(e)];
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pt = canvasPoint(e);
    const prev = strokePoints.current;
    if (prev.length > 0) {
      const segment = [prev[prev.length - 1], pt];
      drawSmoothSegment(ctx, segment);
    }
    strokePoints.current.push(pt);
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    strokePoints.current = [];
    canvasRef.current?.releasePointerCapture(e.pointerId);
    void refreshDrawPreview();
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawHasInk(false);
    setSigPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const loadPdf = async (file: File) => {
    if (pdfFile) releasePdfDocument(pdfFile);
    setPdfFile(file);
    setError(null);
    try {
      const count = await getPdfPageCount(file);
      await loadPdfDocument(file);
      setPageCount(count);
      setCurrentPage(1);
      setPreviewPage(1);
      setPageRange(`1${count > 1 ? `-${count}` : ""}`);
    } catch {
      setPageCount(0);
      setError(t.errReadFailed);
    }
  };

  const handleSigUpload = async (file: File, whiteBg = removeWhiteBg) => {
    setError(null);
    setLastUploadFile(file);
    try {
      const { blob, aspectRatio } = await normalizeImageToPng(file, {
        removeWhiteBackground: whiteBg,
      });
      const previewUrl = URL.createObjectURL(blob);
      setUploadedSig((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { blob, previewUrl };
      });
      setSigAspectRatio(aspectRatio);
      setSigPreviewUrl(previewUrl);
    } catch (err) {
      if (err instanceof Error && err.message === "IMAGE_TOO_LARGE") {
        setError(t.errImageTooLarge);
      } else {
        setError(t.errImageInvalid);
      }
    }
  };

  const removeUploadedSig = () => {
    setLastUploadFile(null);
    setUploadedSig((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setSigPreviewUrl(null);
  };

  const getTargetPageIndices = (total: number): number[] => {
    if (pageMode === "all") return Array.from({ length: total }, (_, i) => i);
    if (pageMode === "current") {
      return [Math.max(0, Math.min(total - 1, currentPage - 1))];
    }
    const pages = parsePageRange(pageRange, total);
    if (pages.length === 0) return [];
    return pages.map((p) => p - 1);
  };

  const getSignatureBlob = async (): Promise<Blob | null> => {
    if (sigSource === "upload") return uploadedSig?.blob ?? null;
    const canvas = canvasRef.current;
    if (!canvas || !drawHasInk) return null;
    const { width, height } = padLogicalSize(canvas);
    return exportPadAt2x(canvas, width, height);
  };

  const applySignature = async () => {
    if (!pdfFile) return;
    const sigBlob = await getSignatureBlob();
    if (!sigBlob) {
      setError(t.errNeedSignature);
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument } = await getPdfLib();
      const sigBytes = new Uint8Array(await sigBlob.arrayBuffer());
      const pdfBytes = await readPdfFileBytes(pdfFile);
      const pdfDoc = await PDFDocument.load(bytesForPdfLoad(pdfBytes));
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const pageIndices = getTargetPageIndices(pdfDoc.getPageCount());

      if (pageIndices.length === 0) {
        setError(t.errInvalidRange);
        return;
      }

      const embedAspect = sigImage.width / sigImage.height;

      for (const idx of pageIndices) {
        const page = pdfDoc.getPage(idx);
        const { width, height } = page.getSize();
        const coords = placementToPdfCoords(placement, width, height, embedAspect);
        page.drawImage(sigImage, coords);
      }

      const out = await pdfDoc.save();
      const baseName = pdfFile.name.replace(/\.pdf$/i, "");
      downloadBlob(pdfBytesToBlob(out), `${baseName}-signed.pdf`);
    } catch {
      setError(t.errSignFailed);
    } finally {
      setProcessing(false);
    }
  };

  const activeSigPreview = sigSource === "draw" ? (drawHasInk ? sigPreviewUrl : null) : sigPreviewUrl;

  if (!pdfFile) {
    return (
      <>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void loadPdf(f);
            e.target.value = "";
          }}
        />
        <div
          role="button"
          tabIndex={0}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void loadPdf(f);
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => pdfInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") pdfInputRef.current?.click();
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/30"
        >
          <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.uploadHint}</p>
        </div>
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </>
    );
  }

  const controls = (
    <>
      <input
        ref={pdfInputRef}
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
        onClick={() => pdfInputRef.current?.click()}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {pdfFile ? pdfFile.name : shared.uploadPdf}
      </button>

      {pageCount > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{shared.pageCount(pageCount)}</p>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.signatureSource}</p>
        <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-0.5">
          {(
            [
              { id: "draw" as SigSource, label: t.tabDraw },
              { id: "upload" as SigSource, label: t.tabUpload },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSigSource(id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                sigSource === id
                  ? "bg-[var(--cat-pdf)] text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {sigSource === "draw" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-muted">{t.penColor}</span>
              {PEN_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => setPenColor(color)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    penColor === color ? "scale-110 border-[var(--cat-pdf)]" : "border-[var(--line)]"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted">{t.penThickness}</span>
              {PEN_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPenSize(size)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                    penSize === size
                      ? "border-[var(--cat-pdf)] bg-[var(--cat-pdf)]/10 text-foreground"
                      : "border-[var(--line)] text-muted"
                  }`}
                >
                  {size === 2 ? t.penThin : size === 4 ? t.penMedium : t.penThick}
                </button>
              ))}
            </div>
            <canvas
              ref={canvasRef}
              className="block w-full cursor-crosshair rounded-lg border border-[var(--line)]"
              style={{
                maxWidth: PAD_WIDTH,
                aspectRatio: `${PAD_WIDTH} / ${PAD_HEIGHT}`,
                touchAction: "none",
                background:
                  "repeating-conic-gradient(var(--surface-2) 0% 25%, transparent 0% 50%) 50% / 16px 16px",
              }}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
            />
            <button type="button" onClick={clearPad} className="text-sm text-muted hover:text-foreground">
              {labels.clear}
            </button>
          </div>
        )}

        {sigSource === "upload" && (
          <div className="space-y-3">
            <input
              ref={sigInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleSigUpload(f);
                e.target.value = "";
              }}
            />
            {!uploadedSig ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => sigInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") sigInputRef.current?.click();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) void handleSigUpload(f);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--line)] bg-[var(--surface-2)] px-4 py-8 text-center"
              >
                <Upload className="h-6 w-6 text-muted" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-foreground">{t.uploadSignatureHint}</p>
                <p className="mt-1 text-xs text-muted">{t.uploadSignatureSupported}</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3">
                <img
                  src={uploadedSig.previewUrl}
                  alt=""
                  className="h-14 w-24 rounded border border-[var(--line)] bg-transparent object-contain"
                />
                <button
                  type="button"
                  onClick={removeUploadedSig}
                  className="btn-secondary inline-flex items-center gap-1 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.removeSignature}
                </button>
              </div>
            )}
            <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={removeWhiteBg}
                onChange={(e) => setRemoveWhiteBg(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium text-foreground">{t.removeWhiteBg}</span>
                <span className="mt-0.5 block text-xs">{t.removeWhiteBgHint}</span>
              </span>
            </label>
          </div>
        )}
      </div>

      {pageCount > 0 && (
        <div className="space-y-3 rounded-lg border border-[var(--line)] p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.placement}</p>
          <p className="text-xs text-muted">{t.dragToPosition}</p>
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
                    ? "bg-[var(--cat-pdf)] text-white"
                    : "border border-[var(--line)] text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {pageMode === "current" && (
            <label className="block text-sm">
              <span className="text-muted">{t.pageNumber}</span>
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
              <span className="text-muted">{t.pagesRangeHint}</span>
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

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => void applySignature()}
        disabled={!pdfFile || !hasSignature || processing}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t.signAndDownload}
      </button>
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={!!pdfFile}
      controls={controls}
      preview={
        pdfFile ? (
          <PdfPreviewPane totalCount={pageCount} singleColumn>
            <SignaturePlacementPreview
              pageSrc={pageSrc}
              signatureSrc={activeSigPreview}
              signatureAspectRatio={sigAspectRatio}
              placement={placement}
              onPlacementChange={setPlacement}
              pageCount={pageCount}
              previewPage={previewPage}
              onPreviewPageChange={setPreviewPage}
              appliesToBadge={
                pageMode !== "current" && targetPageCount > 0
                  ? t.appliesToPages(targetPageCount)
                  : undefined
              }
            />
          </PdfPreviewPane>
        ) : null
      }
    />
  );
}
