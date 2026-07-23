"use client";

import FileDropZone from "@/components/FileDropZone";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Download, FileText, GripVertical, Loader2, Undo2, X } from "lucide-react";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import ProgressIndicator from "@/components/tools/ProgressIndicator";
import { useBatchLabels } from "@/lib/i18n/use-batch-labels";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  getPdfPageCount,
  loadPdfDocument,
  releasePdfDocument,
  renderPdfPageThumb,
} from "@/lib/pdf/thumbnails";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import { loadPdfLibDocument } from "@/lib/pdf/load-pdf-lib";
import { useUnsavedWork } from "@/lib/unsaved-work";

function loadPdfLib() {
  return import("pdf-lib");
}

let pdfLibPromise: ReturnType<typeof loadPdfLib> | undefined;

function getPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = loadPdfLib();
  return pdfLibPromise;
}

interface PageItem {
  id: string;
  sourceIndex: number;
  pageNum: number;
  deleted: boolean;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrganizePdf() {
  const t = usePdfToolLabels("organizePdf");
  const batchLabels = useBatchLabels();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
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

  const activeCount = pages.filter((p) => !p.deleted).length;

  const loadPdf = async (pdfFile: File) => {
    setLoading(true);
    setError(null);
    if (file) releasePdfDocument(file);
    try {
      const count = await getPdfPageCount(pdfFile);
      await loadPdfDocument(pdfFile);
      setFile(pdfFile);
      setPages(
        Array.from({ length: count }, (_, i) => ({
          id: `page-${i}`,
          sourceIndex: i,
          pageNum: i + 1,
          deleted: false,
        }))
      );
    } catch {
      setFile(null);
      setPages([]);
      setError(t.errReadFailed);
    } finally {
      setLoading(false);
    }
  };

  const toggleDelete = (id: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, deleted: !p.deleted } : p)));
    setError(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropReorder = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setPages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const exportPdf = async () => {
    if (!file) return;
    const kept = pages.filter((p) => !p.deleted);
    if (kept.length === 0) {
      setError(t.errNoPages);
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const { PDFDocument } = await getPdfLib();
      const sourceBytes = await readPdfFileBytes(file);
      const sourcePdf = await loadPdfLibDocument(bytesForPdfLoad(sourceBytes));
      const outPdf = await PDFDocument.create();
      const indices = kept.map((p) => p.sourceIndex);
      const copied = await outPdf.copyPages(sourcePdf, indices);
      copied.forEach((page) => outPdf.addPage(page));

      const bytes = await outPdf.save();
      const baseName = file.name.replace(/\.pdf$/i, "") || "document";
      downloadBlob(pdfBytesToBlob(bytes), `${baseName}-organized.pdf`);
    } catch {
      setError(t.errOrganizeFailed);
    } finally {
      setExporting(false);
    }
  };

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
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.pageCount(pages.length)}</p>
          </div>
        </div>
      )}

      {loading && (
        <ProgressIndicator label={batchLabels.processing} />
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <ProgressIndicator active={exporting} label={t.organizing} />

      <button
        type="button"
        onClick={exportPdf}
        disabled={!file || exporting || activeCount === 0}
        className="btn-primary"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.organizing}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {t.downloadOrganized}
          </>
        )}
      </button>
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={!!file && pages.length > 0}
      controls={controls}
      preview={
        file && pages.length > 0 ? (
          <PdfPreviewPane totalCount={pages.length}>
            <div className="grid grid-cols-2 gap-2" aria-label={t.pagesGridAria}>
              {pages.slice(0, 50).map((page, index) => (
                <OrganizeThumbCell
                  key={page.id}
                  file={file}
                  page={page}
                  index={index}
                  dragOver={dragOverIndex === index}
                  onDragStart={() => !page.deleted && handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDropReorder(e, index)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onToggleDelete={() => toggleDelete(page.id)}
                  undoLabel={t.undoLabel}
                  deleteLabel={t.deletePage(page.pageNum)}
                  undoAria={t.undoDelete(page.pageNum)}
                />
              ))}
            </div>
          </PdfPreviewPane>
        ) : null
      }
    />
  );
}

function OrganizeThumbCell({
  file,
  page,
  index,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onToggleDelete,
  undoLabel,
  deleteLabel,
  undoAria,
}: {
  file: File;
  page: PageItem;
  index: number;
  dragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
  onToggleDelete: () => void;
  undoLabel: string;
  deleteLabel: string;
  undoAria: string;
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
        void renderPdfPageThumb(file, page.sourceIndex).then((url) => {
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
  }, [file, page.sourceIndex]);

  return (
    <div
      ref={ref}
      draggable={!page.deleted}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative rounded-md border p-2 ${
        page.deleted
          ? "border-red-300 bg-red-50/50 opacity-60 dark:border-red-800 dark:bg-red-950/20"
          : dragOver
            ? "border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-950/40"
            : "border-[var(--line)] bg-[var(--surface-2)]"
      }`}
    >
      {!page.deleted && (
        <GripVertical className="absolute left-1 top-1 z-10 h-4 w-4 cursor-grab text-muted" aria-hidden="true" />
      )}
      <p className="mb-1 text-center text-[11px] text-muted">{page.pageNum}</p>
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded bg-[var(--surface)]">
        {!src && <div className="pdf-preview-shimmer absolute inset-0" aria-hidden="true" />}
        {src && <img src={src} alt="" className="max-h-full max-w-full object-contain" />}
        {page.deleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <X className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="mt-2">
        {page.deleted ? (
          <button type="button" onClick={onToggleDelete} className="btn-secondary w-full text-xs" aria-label={undoAria}>
            <Undo2 className="h-3.5 w-3.5" />
            {undoLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleDelete}
            className="btn-secondary w-full text-xs text-red-600 dark:text-red-400"
            aria-label={deleteLabel}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
