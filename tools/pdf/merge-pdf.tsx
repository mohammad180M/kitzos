"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Download,
  FileText,
  GripVertical,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";

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
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setError(null);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

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
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], {
        type: "application/pdf",
      });
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

  return (
    <div className="space-y-4">
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
              <GripVertical
                className="h-4 w-4 shrink-0 cursor-grab text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
              <FileText
                className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {pdf.name}
                </p>
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
    </div>
  );
}
