"use client";

import FileDropZone from "@/components/FileDropZone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import PdfPreviewPane, { type PreviewPage } from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { formatPageSelection, parsePageSelection } from "@/lib/pdf/page-selection";
import {
  getPdfPageCount,
  loadPdfDocument,
  releasePdfDocument,
  renderPdfPageThumb,
} from "@/lib/pdf/thumbnails";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import { useUnsavedWork } from "@/lib/unsaved-work";

function loadPdfLib() {
  return import("pdf-lib");
}

function loadJSZipModule() {
  return import("jszip");
}

let pdfLibPromise: ReturnType<typeof loadPdfLib> | undefined;
let jsZipModulePromise: ReturnType<typeof loadJSZipModule> | undefined;

function getPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = loadPdfLib();
  return pdfLibPromise;
}

function getJSZipModule() {
  if (!jsZipModulePromise) jsZipModulePromise = loadJSZipModule();
  return jsZipModulePromise;
}

type OutputMode = "single" | "separate";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExtractPages() {
  const t = usePdfToolLabels("extractPages");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("single");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const syncRangeFromSelection = useCallback((pages: Set<number>) => {
    setRangeInput(formatPageSelection(Array.from(pages)));
  }, []);

  const togglePage = (pageNum: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      syncRangeFromSelection(next);
      return next;
    });
    setError(null);
  };

  const onRangeChange = (value: string) => {
    setRangeInput(value);
    if (!value.trim()) {
      setSelected(new Set());
      setError(null);
      return;
    }
    if (pageCount === 0) return;
    const parsed = parsePageSelection(value, pageCount);
    if (parsed) {
      setSelected(parsed);
      setError(null);
    }
  };

  const selectAll = () => {
    const all = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    setSelected(all);
    syncRangeFromSelection(all);
    setError(null);
  };

  const clearSelection = () => {
    setSelected(new Set());
    setRangeInput("");
    setError(null);
  };

  const loadPdf = async (pdfFile: File) => {
    setError(null);
    if (file) releasePdfDocument(file);
    try {
      const count = await getPdfPageCount(pdfFile);
      await loadPdfDocument(pdfFile);
      setFile(pdfFile);
      setPageCount(count);
      setSelected(new Set());
      setRangeInput("");
    } catch {
      setFile(null);
      setPageCount(0);
      setError(t.errReadFailed);
    }
  };

  const previewPages = useMemo((): PreviewPage[] => {
    if (!file || pageCount === 0) return [];
    const fileLocal = file;
    return Array.from({ length: pageCount }, (_, i) => {
      const pageNum = i + 1;
      return {
        id: `extract-p${i}`,
        label: String(pageNum),
        selected: selected.has(pageNum),
        onClick: () => togglePage(pageNum),
        render: () => renderPdfPageThumb(fileLocal, i),
      };
    });
  }, [file, pageCount, selected]);

  const extract = async () => {
    if (!file || selected.size === 0) {
      setError(t.errNoSelection);
      return;
    }

    setExtracting(true);
    setError(null);
    try {
      const { PDFDocument } = await getPdfLib();
      const bytes = await readPdfFileBytes(file);
      const srcDoc = await PDFDocument.load(bytesForPdfLoad(bytes));
      const indices = Array.from(selected)
        .sort((a, b) => a - b)
        .map((p) => p - 1);
      const baseName = file.name.replace(/\.pdf$/i, "");

      if (outputMode === "single") {
        const outDoc = await PDFDocument.create();
        const copied = await outDoc.copyPages(srcDoc, indices);
        copied.forEach((page) => outDoc.addPage(page));
        const out = await outDoc.save();
        downloadBlob(pdfBytesToBlob(out), `${baseName}-extracted.pdf`);
      } else {
        const JSZip = (await getJSZipModule()).default;
        const zip = new JSZip();
        for (const idx of indices) {
          const outDoc = await PDFDocument.create();
          const [page] = await outDoc.copyPages(srcDoc, [idx]);
          outDoc.addPage(page);
          const pageBytes = await outDoc.save();
          zip.file(`page-${idx + 1}.pdf`, pageBytes);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, `${baseName}-pages.zip`);
      }
    } catch {
      setError(t.errExtractFailed);
    } finally {
      setExtracting(false);
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selected.size > 0 ? t.selectedCount(selected.size, pageCount) : t.noPagesSelected}
            </p>
          </div>
        </div>
      )}

      {pageCount > 0 && (
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t.pagesRangeHint}</span>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => onRangeChange(e.target.value)}
              placeholder={t.pagesRangePlaceholder}
              className="input-field mt-1"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={selectAll} className="btn-secondary text-xs">
              {t.selectAll}
            </button>
            <button type="button" onClick={clearSelection} className="btn-secondary text-xs">
              {t.clearSelection}
            </button>
          </div>
        </div>
      )}

      {pageCount > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.outputMode}</legend>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name="extract-output"
              checked={outputMode === "single"}
              onChange={() => setOutputMode("single")}
              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            {t.modeSingle}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name="extract-output"
              checked={outputMode === "separate"}
              onChange={() => setOutputMode("separate")}
              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            {t.modeSeparate}
          </label>
        </fieldset>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void extract()}
        disabled={!file || extracting || selected.size === 0}
        className="btn-primary inline-flex items-center gap-2"
      >
        {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {extracting ? t.extracting : t.extractDownload}
      </button>
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={!!file}
      controls={controls}
      preview={
        file ? (
          <PdfPreviewPane pages={previewPages} totalCount={pageCount} />
        ) : null
      }
    />
  );
}
