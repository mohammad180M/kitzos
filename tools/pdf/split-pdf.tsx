"use client";

import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Download, FileText, Loader2, Upload } from "lucide-react";

type SplitMode = "each" | "ranges";

function parsePageRanges(
  input: string,
  pageCount: number
): { start: number; end: number }[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const groups: { start: number; end: number }[] = [];

  for (const part of trimmed.split(",")) {
    const segment = part.trim();
    if (!segment) continue;

    if (segment.includes("-")) {
      const [startStr, endStr] = segment.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start || start > pageCount) {
        throw new Error(`Invalid range: ${segment}`);
      }
      groups.push({ start: start - 1, end: Math.min(end, pageCount) - 1 });
    } else {
      const page = parseInt(segment, 10);
      if (isNaN(page) || page < 1 || page > pageCount) {
        throw new Error(`Invalid page: ${segment}`);
      }
      groups.push({ start: page - 1, end: page - 1 });
    }
  }

  return groups;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<SplitMode>("each");
  const [ranges, setRanges] = useState("1");
  const [splitting, setSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadPdf = async (pdfFile: File) => {
    setError(null);
    try {
      const bytes = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setFile(pdfFile);
      setPageCount(pdf.getPageCount());
      setRanges(`1-${pdf.getPageCount()}`);
    } catch {
      setFile(null);
      setPageCount(0);
      setError("Could not read PDF. Make sure the file is a valid, unencrypted PDF.");
    }
  };

  const splitPdf = async () => {
    if (!file || pageCount === 0) return;

    setSplitting(true);
    setError(null);

    try {
      const sourceBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourceBytes);

      let groups: { start: number; end: number }[];

      if (mode === "each") {
        groups = Array.from({ length: pageCount }, (_, i) => ({ start: i, end: i }));
      } else {
        groups = parsePageRanges(ranges, pageCount);
        if (groups.length === 0) {
          throw new Error("Enter at least one page or range (e.g. 1-3, 5).");
        }
      }

      const outputs: { name: string; bytes: Uint8Array }[] = [];

      for (let i = 0; i < groups.length; i++) {
        const { start, end } = groups[i];
        const newPdf = await PDFDocument.create();
        const indices = Array.from({ length: end - start + 1 }, (_, j) => start + j);
        const pages = await newPdf.copyPages(sourcePdf, indices);
        pages.forEach((page) => newPdf.addPage(page));
        const bytes = await newPdf.save();

        const name =
          mode === "each"
            ? `page-${start + 1}.pdf`
            : groups.length === 1
              ? "split.pdf"
              : `part-${i + 1}-pages-${start + 1}-${end + 1}.pdf`;

        outputs.push({ name, bytes });
      }

      if (outputs.length === 1) {
        downloadBlob(
          new Blob([new Uint8Array(outputs[0].bytes)], { type: "application/pdf" }),
          outputs[0].name
        );
      } else {
        const zip = new JSZip();
        outputs.forEach(({ name, bytes }) => zip.file(name, bytes));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const baseName = file.name.replace(/\.pdf$/i, "") || "document";
        downloadBlob(zipBlob, `${baseName}-split.zip`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
    } finally {
      setSplitting(false);
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
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/30"
      >
        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload a PDF to split
        </p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">{pageCount} page{pageCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {file && pageCount > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Split mode</legend>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name="split-mode"
              checked={mode === "each"}
              onChange={() => setMode("each")}
              className="h-4 w-4 border-gray-300 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
            />
            Split into individual pages (zip)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="radio"
              name="split-mode"
              checked={mode === "ranges"}
              onChange={() => setMode("ranges")}
              className="h-4 w-4 border-gray-300 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
            />
            Custom page ranges
          </label>
        </fieldset>
      )}

      {file && mode === "ranges" && (
        <div>
          <label htmlFor="page-ranges" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Page ranges
          </label>
          <input
            id="page-ranges"
            type="text"
            value={ranges}
            onChange={(e) => setRanges(e.target.value)}
            placeholder="e.g. 1-3, 5, 7-10"
            className="input-field mt-1"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Use commas to separate ranges. Each range becomes a separate PDF file.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={splitPdf}
        disabled={!file || splitting || pageCount === 0}
        className="btn-primary"
      >
        {splitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Splitting…
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Split &amp; Download
          </>
        )}
      </button>
    </div>
  );
}
