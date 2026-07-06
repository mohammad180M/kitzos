"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

function loadJSZipModule() {
  return import("jszip");
}

let jsZipModulePromise: ReturnType<typeof loadJSZipModule> | undefined;

function getJSZipModule() {
  if (!jsZipModulePromise) jsZipModulePromise = loadJSZipModule();
  return jsZipModulePromise;
}

type PdfJsLib = typeof import("pdfjs-dist");

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function renderPageToJpeg(
  pdfjs: PdfJsLib,
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

export default function PdfToJpg() {
  const t = usePdfToolLabels("pdfToJpg");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useUnsavedWork(file !== null);

  useEffect(() => {
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setWorkerReady(true);
    });
  }, []);

  const loadPdf = async (pdfFile: File) => {
    if (!workerReady) return;
    setError(null);
    try {
      const pdfjs = await import("pdfjs-dist");
      const data = await pdfFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data }).promise;
      setFile(pdfFile);
      setPageCount(pdf.numPages);
    } catch {
      setFile(null);
      setPageCount(0);
      setError(t.errReadFailed);
    }
  };

  const convert = async (singlePage?: number) => {
    if (!file || !workerReady) return;

    setConverting(true);
    setError(null);

    try {
      const pdfjs = await import("pdfjs-dist");
      const data = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data }).promise;
      const baseName = file.name.replace(/\.pdf$/i, "") || "document";

      if (singlePage !== undefined) {
        const blob = await renderPageToJpeg(pdfjs, pdf, singlePage);
        downloadBlob(blob, `${baseName}-page-${singlePage}.jpg`);
      } else {
        const JSZip = (await getJSZipModule()).default;
        const zip = new JSZip();
        for (let i = 1; i <= pdf.numPages; i++) {
          const blob = await renderPageToJpeg(pdfjs, pdf, i);
          zip.file(`page-${i}.jpg`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, `${baseName}-pages.zip`);
      }
    } catch {
      setError(t.errConvertFailed);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-4">
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
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.pageCount(pageCount)}</p>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {file && pageCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {pageCount === 1 ? (
            <button
              type="button"
              onClick={() => convert(1)}
              disabled={converting}
              className="btn-primary"
            >
              {converting ? (
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
            <>
              <button
                type="button"
                onClick={() => convert(1)}
                disabled={converting}
                className="btn-secondary"
              >
                <Download className="h-4 w-4" />
                {t.pageOneJpg}
              </button>
              <button
                type="button"
                onClick={() => convert()}
                disabled={converting}
                className="btn-primary"
              >
                {converting ? (
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
