"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import MergePdfOrderList from "@/components/pdf/MergePdfOrderList";
import { downloadBlob } from "@/lib/download";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { usePdfSharedLabels, usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import {
  getPdfPageCount,
  loadPdfDocument,
  releasePdfDocument,
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
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function newFileId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function MergePdf() {
  const t = usePdfToolLabels("mergePdf");
  const shared = usePdfSharedLabels();
  const common = useCommonLabels();
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const filesRef = useRef<PdfFile[]>([]);

  useUnsavedWork(files.length > 0);

  useEffect(() => {
    filesRef.current = files;
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

  const listFiles = useMemo(
    () =>
      files.map((f) => ({
        id: f.id,
        name: f.name,
        sizeLabel: formatBytes(f.size),
        pageCountLabel: shared.pageCount(f.pageCount),
        file: f.file,
      })),
    [files, shared]
  );

  const announce = useCallback((message: string) => {
    setLiveMessage(message);
  }, []);

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setFiles((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
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

      for (const file of pdfFiles) {
        try {
          const pageCount = await getPdfPageCount(file);
          await loadPdfDocument(file);
          items.push({
            id: newFileId(),
            file,
            name: file.name,
            size: file.size,
            pageCount,
          });
        } catch {
          // skip invalid
        }
      }

      if (items.length === 0) {
        setError(t.errInvalidFiles);
        return;
      }

      setFiles((prev) => [...prev, ...items]);
    },
    [t.errInvalidFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) releasePdfDocument(removed.file);
      return prev.filter((f) => f.id !== id);
    });
    setError(null);
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

      // List order is merge order: top → first, bottom → last.
      for (const pdfFile of files) {
        const fileBytes = await readPdfFileBytes(pdfFile.file);
        const source = await PDFDocument.load(bytesForPdfLoad(fileBytes));
        const indices = source.getPageIndices();
        const pages = await mergedPdf.copyPages(source, indices);
        for (const page of pages) mergedPdf.addPage(page);
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

  return (
    <div className="space-y-4">
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {files.length === 0 ? (
        <FileDropZone
          accept=".pdf,application/pdf"
          multiple
          label={t.dropHint}
          hint={t.multipleSupported}
          onFiles={(list) => void addFiles(list)}
        />
      ) : (
        <>
          <FileDropZone
            accept=".pdf,application/pdf"
            multiple
            compact
            className="!py-3 md:!py-6"
            label={t.addMoreFiles}
            hint={t.multipleSupported}
            onFiles={(list) => void addFiles(list)}
          />

          <MergePdfOrderList
            files={listFiles}
            listAriaLabel={t.filesListAria}
            removeLabel={shared.removeFile}
            moveUpLabel={t.moveFileUp}
            moveDownLabel={t.moveFileDown}
            dragHandleLabel={t.dragHandle}
            fileMovedAnnounce={t.fileMovedAnnounce}
            onReorder={reorderFiles}
            onRemove={removeFile}
            onAnnounce={announce}
            onFilesDrop={(list) => void addFiles(list)}
            dropActiveHint={common.dropFilesHere}
          />

          <button
            type="button"
            onClick={() => void mergePdfs()}
            disabled={merging || files.length < 2}
            className="btn-primary mb-6 flex h-12 w-full items-center justify-center gap-2 md:mb-0 md:h-auto md:w-auto"
          >
            {merging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.merging}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {t.mergeFiles(files.length, totalSize)}
              </>
            )}
          </button>
        </>
      )}

      {error && (
        <p
          className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--cat-pdf)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
