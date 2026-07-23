"use client";

import { useCallback, useState } from "react";
import { Download, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";
import ProgressIndicator from "@/components/tools/ProgressIndicator";
import { useBatchLabels } from "@/lib/i18n/use-batch-labels";
import { usePdfSharedLabels, usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import { loadPdfLibDocument } from "@/lib/pdf/load-pdf-lib";
import { localizePdfError, rethrowLocalizedPdfError } from "@/lib/pdf/pdf-errors";
import { encryptPdfBytesInWorker } from "@/lib/pdf/qpdf-protect-client";
import { downloadBlob } from "@/lib/download";
import { useUnsavedWork } from "@/lib/unsaved-work";

/**
 * Read bytes on the main thread (async I/O), then encrypt entirely in the
 * qpdf Web Worker — including the already-encrypted check. Never run
 * pdf-lib or qpdf.callMain on the UI thread during protect.
 */
async function encryptPdfWithPassword(file: File, password: string): Promise<Blob> {
  const bytes = await readPdfFileBytes(file);
  // Yield so React can paint "processing" before WASM starts on the worker.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const encrypted = await encryptPdfBytesInWorker(bytes, password);
  return pdfBytesToBlob(encrypted);
}

export default function PdfProtect() {
  const t = usePdfToolLabels("pdfProtect");
  const shared = usePdfSharedLabels();
  const batchLabels = useBatchLabels();
  const [toolMode, setToolMode] = useState<ToolMode>("single");
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(file !== null);

  const onFile = async (f: File) => {
    setFile(f);
    setError(null);
    try {
      const fileBytes = await readPdfFileBytes(f);
      const doc = await loadPdfLibDocument(bytesForPdfLoad(fileBytes));
      setPageCount(doc.getPageCount());
    } catch (err) {
      setPageCount(0);
      setFile(null);
      setError(
        localizePdfError(err, {
          errEncrypted: t.errEncrypted,
          fallback: t.errProtectFailed,
        })
      );
    }
  };

  const protect = async () => {
    if (!file || !password) {
      setError(t.errNeedPassword);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob = await encryptPdfWithPassword(file, password);
      downloadBlob(blob, `protected-${file.name}`);
    } catch (err) {
      setError(
        localizePdfError(err, {
          errEncrypted: t.errEncrypted,
          fallback: t.errProtectFailed,
        })
      );
    } finally {
      setProcessing(false);
    }
  };

  // Must stay above any toolMode-based JSX return — hooks order must be stable.
  const processFile = useCallback(
    async (pdfFile: File): Promise<BatchOutput> => {
      if (!password) {
        throw new Error(t.errNeedPassword);
      }
      try {
        const blob = await encryptPdfWithPassword(pdfFile, password);
        return { blob, name: `protected-${pdfFile.name}` };
      } catch (err) {
        rethrowLocalizedPdfError(err, {
          errEncrypted: t.errEncrypted,
          fallback: t.errProtectFailed,
        });
      }
    },
    [password, t.errNeedPassword, t.errEncrypted, t.errProtectFailed]
  );

  const passwordField = (
    <label className="block text-sm">
      <span className="font-medium text-gray-700 dark:text-gray-300">{t.password}</span>
      <div className="relative mt-1">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field pe-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={showPassword ? t.hidePassword : t.showPassword}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );

  const controls = (
    <>
      <FileDropZone
        accept="application/pdf"
        label={file ? file.name : t.uploadPdf}
        onFiles={(files) => {
          const f = files[0];
          if (f) void onFile(f);
        }}
      />

      {passwordField}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <ProgressIndicator active={processing} label={batchLabels.processing} />

      <button
        type="button"
        onClick={() => void protect()}
        disabled={!file || !password || processing}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t.protectAndDownload}
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
          active={!!file}
          controls={controls}
          preview={
            file ? (
              <PdfPreviewPane totalCount={pageCount}>
                <div className="flex flex-col items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-6 text-center">
                  <Lock className="h-10 w-10 text-[var(--cat-pdf)]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="mt-1 text-xs text-muted">{shared.pageCount(pageCount)}</p>
                  </div>
                  <p className="text-sm text-muted">{shared.encryptedNote}</p>
                </div>
              </PdfPreviewPane>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            {passwordField}
            {!password && (
              <p className="text-xs text-[var(--muted)]" role="status">
                {t.errNeedPassword}
              </p>
            )}
          </div>
          <BatchUploader accept=".pdf,application/pdf" processFile={processFile} />
        </div>
      )}
    </>
  );
}
