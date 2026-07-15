"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import PdfPreviewPane, { type PreviewPage } from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  loadPdfDocument,
  releasePdfDocument,
  renderPdfPageThumb,
} from "@/lib/pdf/thumbnails";

function loadJSZipModule() {
  return import("jszip");
}

let jsZipModulePromise: ReturnType<typeof loadJSZipModule> | undefined;

function getJSZipModule() {
  if (!jsZipModulePromise) jsZipModulePromise = loadJSZipModule();
  return jsZipModulePromise;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function renderPageToJpeg(
  pdf: import("pdfjs-dist").PDFDocumentProxy,
  pageNum: number,
  scale = 2
): Promise<Blob> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("JPEG export failed."))),
      "image/jpeg",
      0.92
    );
  });
}

interface PdfToImagesDirectionProps {
  onDirtyChange: (dirty: boolean) => void;
}

export default function PdfToImagesDirection({ onDirtyChange }: PdfToImagesDirectionProps) {
  const t = usePdfToolLabels("pdfToJpg");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [zipping, setZipping] = useState(false);
  const [pageBusy, setPageBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  /** High-res JPEG blobs keyed by 1-based page number — reused across downloads. */
  const pageBlobCache = useRef(new Map<number, Blob>());

  useEffect(() => {
    onDirtyChange(file !== null);
  }, [file, onDirtyChange]);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    return () => {
      if (fileRef.current) releasePdfDocument(fileRef.current);
    };
  }, []);

  const clearPageCache = () => {
    pageBlobCache.current.clear();
  };

  const getPageBlob = useCallback(async (pageNum: number) => {
    const cached = pageBlobCache.current.get(pageNum);
    if (cached) return cached;
    if (!fileRef.current) throw new Error("No file");
    const pdf = await loadPdfDocument(fileRef.current);
    const blob = await renderPageToJpeg(pdf, pageNum);
    pageBlobCache.current.set(pageNum, blob);
    return blob;
  }, []);

  const downloadPage = useCallback(
    async (pageNum: number) => {
      if (!fileRef.current) return;
      setPageBusy(pageNum);
      setError(null);
      try {
        const blob = await getPageBlob(pageNum);
        const baseName = fileRef.current.name.replace(/\.pdf$/i, "") || "document";
        downloadBlob(blob, `${baseName}-page-${pageNum}.jpg`);
      } catch {
        setError(t.errConvertFailed);
      } finally {
        setPageBusy(null);
      }
    },
    [getPageBlob, t.errConvertFailed]
  );

  const previewPages = useMemo((): PreviewPage[] => {
    if (!file || pageCount === 0) return [];
    const f = file;
    return Array.from({ length: pageCount }, (_, i) => {
      const pageNum = i + 1;
      return {
        id: `jpg-p${i}`,
        label: String(pageNum),
        highlighted: true,
        render: () => renderPdfPageThumb(f, i, { scale: 0.4 }),
        action: {
          label: t.downloadThisPage,
          busy: pageBusy === pageNum,
          onClick: () => {
            void downloadPage(pageNum);
          },
        },
      };
    });
  }, [downloadPage, file, pageBusy, pageCount, t.downloadThisPage]);

  const loadPdf = async (pdfFile: File) => {
    setError(null);
    if (file) releasePdfDocument(file);
    clearPageCache();
    try {
      const doc = await loadPdfDocument(pdfFile);
      setFile(pdfFile);
      setPageCount(doc.numPages);
    } catch {
      setFile(null);
      setPageCount(0);
      setError(t.errReadFailed);
    }
  };

  const downloadAllZip = async () => {
    if (!file) return;
    setZipping(true);
    setError(null);
    try {
      const JSZip = (await getJSZipModule()).default;
      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, "") || "document";
      for (let i = 1; i <= pageCount; i++) {
        const blob = await getPageBlob(i);
        zip.file(`${baseName}-page-${i}.jpg`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${baseName}-pages.zip`);
    } catch {
      setError(t.errConvertFailed);
    } finally {
      setZipping(false);
    }
  };

  const busy = zipping || pageBusy !== null;

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
            <p className="text-xs text-[var(--muted)]">{t.pageCount(pageCount)}</p>
          </div>
        </div>
      )}

      {error && (
        <p
          className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--cat-pdf)]"
          role="alert"
        >
          {error}
        </p>
      )}

      {file && pageCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {pageCount === 1 ? (
            <button
              type="button"
              onClick={() => void downloadPage(1)}
              disabled={busy}
              className="btn-primary"
            >
              {pageBusy === 1 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.converting}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {t.downloadJpg}
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void downloadAllZip()}
              disabled={busy}
              className="btn-primary"
            >
              {zipping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.converting}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {t.allPagesZip}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={!!file && pageCount > 0}
      controls={controls}
      preview={
        file && pageCount > 0 ? (
          <PdfPreviewPane pages={previewPages} totalCount={pageCount} />
        ) : null
      }
    />
  );
}
