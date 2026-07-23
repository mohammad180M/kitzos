"use client";

import FileDropZone from "@/components/FileDropZone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Loader2, RotateCw } from "lucide-react";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";
import Rotate90Button, { nextQuarterTurn } from "@/components/tools/Rotate90Button";
import ProgressIndicator from "@/components/tools/ProgressIndicator";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  getPdfPageCount,
  loadPdfDocument,
  releasePdfDocument,
  renderPdfPageThumb,
} from "@/lib/pdf/thumbnails";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import { loadPdfLibDocument } from "@/lib/pdf/load-pdf-lib";
import { localizePdfError, rethrowLocalizedPdfError } from "@/lib/pdf/pdf-errors";
import { useUnsavedWork } from "@/lib/unsaved-work";

function loadPdfLib() {
  return import("pdf-lib");
}

let pdfLibPromise: ReturnType<typeof loadPdfLib> | undefined;

function getPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = loadPdfLib();
  return pdfLibPromise;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function rotatePdfBytes(
  sourceBytes: Uint8Array,
  extraRotation: Record<number, number> | number
): Promise<Uint8Array> {
  const { PDFDocument, degrees } = await getPdfLib();
  const sourcePdf = await loadPdfLibDocument(bytesForPdfLoad(sourceBytes));
  const outPdf = await PDFDocument.create();
  const indices = sourcePdf.getPageIndices();
  const pages = await outPdf.copyPages(sourcePdf, indices);

  pages.forEach((page, i) => {
    const pageNum = i + 1;
    const existing = page.getRotation().angle;
    const extra =
      typeof extraRotation === "number"
        ? extraRotation
        : (extraRotation[pageNum] ?? 0);
    page.setRotation(degrees((existing + extra) % 360));
    outPdf.addPage(page);
  });

  return outPdf.save();
}

export default function RotatePdf() {
  const t = usePdfToolLabels("rotatePdf");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [extraRotation, setExtraRotation] = useState<Record<number, number>>({});
  const [batchDegrees, setBatchDegrees] = useState(0);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>("single");
  const fileRef = useRef<File | null>(null);

  useUnsavedWork(file !== null);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    return () => {
      if (fileRef.current) releasePdfDocument(fileRef.current);
    };
  }, []);

  const pageNums = useMemo(
    () => Array.from({ length: pageCount }, (_, i) => i + 1),
    [pageCount]
  );

  const loadPdf = async (pdfFile: File) => {
    setLoading(true);
    setError(null);
    setExtraRotation({});
    if (file) releasePdfDocument(file);
    try {
      const count = await getPdfPageCount(pdfFile);
      await loadPdfDocument(pdfFile);
      setFile(pdfFile);
      setPageCount(count);
    } catch (err) {
      setFile(null);
      setPageCount(0);
      setError(localizePdfError(err, { errEncrypted: t.errEncrypted, fallback: t.errReadFailed }));
    } finally {
      setLoading(false);
    }
  };

  const rotatePage = (pageNum: number) => {
    setExtraRotation((prev) => ({
      ...prev,
      [pageNum]: ((prev[pageNum] ?? 0) + 90) % 360,
    }));
  };

  /** Set every page to an absolute extra rotation (including 0° = original). */
  const setAllPagesRotation = (deg: number) => {
    const normalized = ((deg % 360) + 360) % 360;
    const next: Record<number, number> = {};
    pageNums.forEach((pageNum) => {
      next[pageNum] = normalized;
    });
    setExtraRotation(next);
  };

  const uniformExtraDegrees = useMemo(() => {
    if (pageNums.length === 0) return 0;
    return extraRotation[pageNums[0]] ?? 0;
  }, [pageNums, extraRotation]);

  const bumpAllPagesRotation = () => {
    setAllPagesRotation(nextQuarterTurn(uniformExtraDegrees));
  };

  const applyRotation = async () => {
    if (!file) return;

    setApplying(true);
    setError(null);

    try {
      const sourceBytes = await readPdfFileBytes(file);
      const bytes = await rotatePdfBytes(sourceBytes, extraRotation);
      const baseName = file.name.replace(/\.pdf$/i, "") || "document";
      downloadBlob(pdfBytesToBlob(bytes), `${baseName}-rotated.pdf`);
    } catch (err) {
      setError(
        localizePdfError(err, {
          errEncrypted: t.errEncrypted,
          fallback: t.errRotateFailed,
        })
      );
    } finally {
      setApplying(false);
    }
  };

  const processFile = useCallback(
    async (pdfFile: File): Promise<BatchOutput> => {
      try {
        const sourceBytes = await readPdfFileBytes(pdfFile);
        const bytes = await rotatePdfBytes(sourceBytes, batchDegrees);
        const baseName = pdfFile.name.replace(/\.pdf$/i, "") || "document";
        return { blob: pdfBytesToBlob(bytes), name: `${baseName}-rotated.pdf` };
      } catch (err) {
        rethrowLocalizedPdfError(err, {
          errEncrypted: t.errEncrypted,
          fallback: t.errRotateFailed,
        });
      }
    },
    [batchDegrees, t.errEncrypted, t.errRotateFailed]
  );

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
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <FileText className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.pageCount(pageCount)}</p>
          </div>
        </div>
      )}

      {loading && (
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          …
        </p>
      )}

      {pageCount > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--text)]">{t.rotationAngle}</p>
          <Rotate90Button
            degrees={uniformExtraDegrees}
            onRotate={bumpAllPagesRotation}
            label={t.rotate90Step}
          />
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <ProgressIndicator active={applying} label={t.rotating} />

      <button
        type="button"
        onClick={applyRotation}
        disabled={!file || applying || pageCount === 0}
        className="btn-primary"
      >
        {applying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.rotating}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {t.downloadRotated}
          </>
        )}
      </button>
    </>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <ToolModeToggle mode={toolMode} onChange={setToolMode} />
      </div>

      {toolMode === "single" ? (
        <PdfWorkbenchLayout
          active={!!file && pageCount > 0}
          controls={controls}
          preview={
            file && pageCount > 0 ? (
              <PdfPreviewPane totalCount={pageCount}>
                <RotatePreviewGrid
                  file={file}
                  pageNums={pageNums}
                  extraRotation={extraRotation}
                  onRotate={rotatePage}
                  pageThumbLabel={t.pageThumb}
                  rotatePageLabel={t.rotatePage}
                />
              </PdfPreviewPane>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-sm font-medium text-[var(--text)]">{t.rotationAngle}</p>
            <Rotate90Button
              degrees={batchDegrees}
              onRotate={() => setBatchDegrees((d) => nextQuarterTurn(d))}
              label={t.rotate90Step}
            />
          </div>
          <BatchUploader
            accept=".pdf,application/pdf"
            processFile={processFile}
            thumbnailRotateDeg={batchDegrees}
          />
        </div>
      )}
    </>
  );
}

function RotatePreviewGrid({
  file,
  pageNums,
  extraRotation,
  onRotate,
  pageThumbLabel,
  rotatePageLabel,
}: {
  file: File;
  pageNums: number[];
  extraRotation: Record<number, number>;
  onRotate: (n: number) => void;
  pageThumbLabel: (n: number) => string;
  rotatePageLabel: (n: number) => string;
}) {
  const capped = pageNums.slice(0, 50);

  return (
    <div className="grid grid-cols-2 gap-2">
      {capped.map((pageNum) => (
        <RotateThumbCell
          key={pageNum}
          file={file}
          pageNum={pageNum}
          rotation={extraRotation[pageNum] ?? 0}
          onRotate={() => onRotate(pageNum)}
          label={pageThumbLabel(pageNum)}
          rotateLabel={rotatePageLabel(pageNum)}
        />
      ))}
    </div>
  );
}

function RotateThumbCell({
  file,
  pageNum,
  rotation,
  onRotate,
  label,
  rotateLabel,
}: {
  file: File;
  pageNum: number;
  rotation: number;
  onRotate: () => void;
  label: string;
  rotateLabel: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const genRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        const gen = ++genRef.current;
        void renderPdfPageThumb(file, pageNum - 1).then((url) => {
          if (gen === genRef.current) setSrc(url);
        });
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      genRef.current++;
    };
  }, [file, pageNum]);

  return (
    <div ref={ref} className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2">
      <p className="mb-1 text-center text-[11px] text-muted">{label}</p>
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded bg-[var(--surface)] p-1">
        {!src && <div className="pdf-preview-shimmer absolute inset-0 rounded" aria-hidden="true" />}
        {src && (
          <img
            src={src}
            alt=""
            className="max-h-full max-w-full object-contain transition-transform"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        )}
      </div>
      <button type="button" onClick={onRotate} className="btn-secondary mt-2 w-full text-xs" aria-label={rotateLabel}>
        <RotateCw className="h-3.5 w-3.5" />
        90°
      </button>
    </div>
  );
}
