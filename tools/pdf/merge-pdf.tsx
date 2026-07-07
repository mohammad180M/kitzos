"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  Download,
  FileText,
  GripVertical,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import PdfPreviewPane, { type PreviewPage } from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
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
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MergePdf() {
  const t = usePdfToolLabels("mergePdf");
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [previewPages, setPreviewPages] = useState<PreviewPage[]>([]);
  const [totalPreviewPages, setTotalPreviewPages] = useState(0);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<PdfFile[]>([]);

  useUnsavedWork(files.length > 0);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    if (files.length === 0) {
      setPreviewPages([]);
      setTotalPreviewPages(0);
      return;
    }

    let cancelled = false;

    void (async () => {
      const pages: PreviewPage[] = [];
      let total = 0;
      let order = 0;

      for (const pdfFile of files) {
        try {
          const doc = await loadPdfDocument(pdfFile.file);
          for (let i = 0; i < doc.numPages; i++) {
            order++;
            const pageNum = order;
            const fileRef = pdfFile.file;
            pages.push({
              id: `${pdfFile.id}-p${i}`,
              dividerBefore: i === 0 ? pdfFile.name : undefined,
              label: String(pageNum),
              render: () => renderPdfPageThumb(fileRef, i),
            });
          }
          total += doc.numPages;
        } catch {
          // skip invalid file in preview
        }
      }

      if (!cancelled) {
        setPreviewPages(pages);
        setTotalPreviewPages(total);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [files]);

  useEffect(() => {
    return () => {
      for (const f of filesRef.current) releasePdfDocument(f.file);
    };
  }, []);

  const totalSize = useMemo(
    () => formatBytes(files.reduce((sum, f) => sum + f.size, 0)),
    [files]
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const pdfFiles = Array.from(newFiles).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );

      if (pdfFiles.length === 0) {
        setError(t.errInvalidFiles);
        return;
      }

      const items: PdfFile[] = pdfFiles.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
      }));

      setFiles((prev) => [...prev, ...items]);
    },
    [t.errInvalidFiles]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) releasePdfDocument(removed.file);
      return prev.filter((f) => f.id !== id);
    });
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

    setFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    setDragIndex(null);
    setDragOverIndex(null);
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

      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
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
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2" aria-label={t.filesListAria}>
          {files.map((pdf, index) => (
            <li
              key={pdf.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDropReorder(e, index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 dark:bg-gray-800 ${
                dragOverIndex === index
                  ? "border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-950/40"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <FileText className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{pdf.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatBytes(pdf.size)}</p>
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
        onClick={mergePdfs}
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
          <PdfPreviewPane
            pages={previewPages}
            totalCount={totalPreviewPages}
            sizeBadge={totalSize}
          />
        ) : null
      }
    />
  );
}
