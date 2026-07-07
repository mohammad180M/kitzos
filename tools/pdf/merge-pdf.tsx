"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { Download, GripVertical, Loader2, Trash2, Upload } from "lucide-react";
import MergePdfPageGrid from "@/components/pdf/MergePdfPageGrid";
import PdfPreviewPane, { PDF_PREVIEW_PAGE_CAP } from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { downloadBlob } from "@/lib/download";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePdfSharedLabels, usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  buildGroupedPageOrder,
  mergeFileColor,
  pageOrdersEqual,
  removeFileFromPageOrder,
  type PageRef,
} from "@/lib/pdf/merge-page-order";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
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

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  colorIndex: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MergePdf() {
  const t = usePdfToolLabels("mergePdf");
  const shared = usePdfSharedLabels();
  const { locale } = useLocale();
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [pageOrder, setPageOrder] = useState<PageRef[]>([]);
  const [showFileReorderNote, setShowFileReorderNote] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileDragIndex, setFileDragIndex] = useState<number | null>(null);
  const [fileDragOverIndex, setFileDragOverIndex] = useState<number | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<PdfFile[]>([]);
  const pageOrderRef = useRef<PageRef[]>([]);
  const colorCounterRef = useRef(0);

  useUnsavedWork(files.length > 0);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    pageOrderRef.current = pageOrder;
  }, [pageOrder]);

  useEffect(() => {
    return () => {
      for (const f of filesRef.current) releasePdfDocument(f.file);
    };
  }, []);

  const totalPreviewPages = pageOrder.length;

  const totalSize = useMemo(
    () => formatBytes(files.reduce((sum, f) => sum + f.size, 0)),
    [files]
  );

  const fileById = useMemo(() => new Map(files.map((f) => [f.id, f])), [files]);

  const defaultPageOrder = useMemo(
    () => buildGroupedPageOrder(files.map((f) => ({ id: f.id, pageCount: f.pageCount }))),
    [files]
  );

  const gridPages = useMemo(() => {
    const capped = pageOrder.slice(0, PDF_PREVIEW_PAGE_CAP);
    return capped.map((ref, orderIndex) => {
      const pdfFile = fileById.get(ref.fileId);
      const fileRef = pdfFile?.file;
      return {
        ref,
        orderIndex,
        displayNumber: orderIndex + 1,
        colorIndex: pdfFile?.colorIndex ?? 0,
        render: () => {
          if (!fileRef) return Promise.resolve("");
          return renderPdfPageThumb(fileRef, ref.pageIndex);
        },
      };
    });
  }, [pageOrder, fileById]);

  const announce = useCallback((message: string) => {
    setLiveMessage(message);
  }, []);

  const handlePageReorder = useCallback((next: PageRef[]) => {
    setPageOrder(next);
    setShowFileReorderNote(false);
  }, []);

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      setError(null);
      const pdfFiles = Array.from(newFiles).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );

      if (pdfFiles.length === 0) {
        setError(t.errInvalidFiles);
        return;
      }

      const items: PdfFile[] = [];
      const newRefs: PageRef[] = [];

      for (const file of pdfFiles) {
        try {
          const pageCount = await getPdfPageCount(file);
          await loadPdfDocument(file);
          const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
          const colorIndex = colorCounterRef.current++;
          items.push({
            id,
            file,
            name: file.name,
            size: file.size,
            pageCount,
            colorIndex,
          });
          for (let i = 0; i < pageCount; i++) {
            newRefs.push({ fileId: id, pageIndex: i });
          }
        } catch {
          // skip invalid
        }
      }

      if (items.length === 0) {
        setError(t.errInvalidFiles);
        return;
      }

      setFiles((prev) => [...prev, ...items]);
      setPageOrder((prev) => [...prev, ...newRefs]);
    },
    [t.errInvalidFiles]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) void addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) releasePdfDocument(removed.file);
      return prev.filter((f) => f.id !== id);
    });
    setPageOrder((prev) => removeFileFromPageOrder(prev, id));
    setShowFileReorderNote(false);
    setError(null);
  };

  const handleFileDragStart = (index: number) => setFileDragIndex(index);

  const handleFileDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setFileDragOverIndex(index);
  };

  const handleFileDropReorder = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileDragIndex === null || fileDragIndex === dropIndex) {
      setFileDragIndex(null);
      setFileDragOverIndex(null);
      return;
    }

    const hadCustom = !pageOrdersEqual(pageOrderRef.current, defaultPageOrder);

    setFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fileDragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });

    setPageOrder(
      buildGroupedPageOrder(
        (() => {
          const updated = [...files];
          const [moved] = updated.splice(fileDragIndex, 1);
          updated.splice(dropIndex, 0, moved);
          return updated.map((f) => ({ id: f.id, pageCount: f.pageCount }));
        })()
      )
    );

    if (hadCustom) setShowFileReorderNote(true);
    setFileDragIndex(null);
    setFileDragOverIndex(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError(t.errNeedTwo);
      return;
    }

    setMerging(true);
    setError(null);

    try {
      const { PDFDocument } = await getPdfLib();
      const mergedPdf = await PDFDocument.create();
      const loaded = new Map<string, Awaited<ReturnType<typeof PDFDocument.load>>>();

      if (pageOrder.length === 0) {
        setError(t.errMergeFailed);
        return;
      }

      for (const { fileId, pageIndex } of pageOrder) {
        const pdfFile = fileById.get(fileId);
        if (!pdfFile) continue;

        let source = loaded.get(fileId);
        if (!source) {
          const fileBytes = await readPdfFileBytes(pdfFile.file);
          source = await PDFDocument.load(bytesForPdfLoad(fileBytes));
          loaded.set(fileId, source);
        }

        if (pageIndex < 0 || pageIndex >= source.getPageCount()) continue;

        const [page] = await mergedPdf.copyPages(source, [pageIndex]);
        mergedPdf.addPage(page);
      }

      if (mergedPdf.getPageCount() === 0) {
        setError(t.errMergeFailed);
        return;
      }

      const mergedBytes = await mergedPdf.save();
      downloadBlob(pdfBytesToBlob(mergedBytes), "merged.pdf");
    } catch {
      setError(t.errMergeFailed);
    } finally {
      setMerging(false);
    }
  };

  const controls = (
    <>
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/30"
      >
        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.dropHint}</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t.multipleSupported}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2" aria-label={t.filesListAria}>
          {files.map((pdf, index) => (
            <li
              key={pdf.id}
              draggable
              onDragStart={() => handleFileDragStart(index)}
              onDragOver={(e) => handleFileDragOver(e, index)}
              onDrop={(e) => handleFileDropReorder(e, index)}
              onDragEnd={() => {
                setFileDragIndex(null);
                setFileDragOverIndex(null);
              }}
              className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 dark:bg-gray-800 ${
                fileDragOverIndex === index
                  ? "border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-950/40"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <GripVertical
                className="h-4 w-4 shrink-0 cursor-grab text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: mergeFileColor(pdf.colorIndex) }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{pdf.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatBytes(pdf.size)} · {shared.pageCount(pdf.pageCount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(pdf.id)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:text-gray-500 dark:hover:bg-gray-700"
                aria-label={t.removeFile(pdf.name)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => void mergePdfs()}
        disabled={merging || files.length < 2}
        className="btn-primary w-full sm:w-auto"
      >
        {merging ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.merging}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {t.mergePdf}
          </>
        )}
      </button>
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={files.length > 0}
      controls={controls}
      preview={
        files.length > 0 ? (
          <PdfPreviewPane totalCount={totalPreviewPages} sizeBadge={totalSize}>
            <div aria-live="polite" className="sr-only">
              {liveMessage}
            </div>
            {showFileReorderNote && (
              <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">{t.pagesReorderedByFiles}</p>
            )}
            <MergePdfPageGrid
              pages={gridPages}
              rtl={locale === "ar"}
              onReorder={handlePageReorder}
              onAnnounce={announce}
              pageMovedLabel={t.pageMovedAnnounce}
            />
          </PdfPreviewPane>
        ) : null
      }
    />
  );
}
