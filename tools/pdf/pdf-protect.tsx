"use client";

import { useRef, useState } from "react";
import { Download, Eye, EyeOff, Loader2, Lock, Upload } from "lucide-react";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfSharedLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { bytesForPdfLoad, pdfBytesToBlob, readPdfFileBytes } from "@/lib/pdf/bytes";
import { useUnsavedWork } from "@/lib/unsaved-work";

function loadPdfLib() {
  return import("pdf-lib");
}

export default function PdfProtect() {
  const t = usePdfToolLabels("pdfProtect");
  const shared = usePdfSharedLabels();
  const inputRef = useRef<HTMLInputElement>(null);
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
      const { PDFDocument } = await loadPdfLib();
      const fileBytes = await readPdfFileBytes(f);
      const doc = await PDFDocument.load(bytesForPdfLoad(fileBytes));
      setPageCount(doc.getPageCount());
    } catch {
      setPageCount(0);
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
      const createModule = (await import("@neslinesli93/qpdf-wasm")).default;
      const qpdf = await createModule({
        locateFile: () => "/qpdf.wasm",
      });

      const inputPath = "/in.pdf";
      const outputPath = "/out.pdf";
      const bytes = await readPdfFileBytes(file);
      const fs = qpdf.FS as typeof qpdf.FS & {
        writeFile: (path: string, data: Uint8Array) => void;
      };
      fs.writeFile(inputPath, bytes);

      const code = qpdf.callMain([
        inputPath,
        "--encrypt",
        password,
        password,
        "256",
        "--",
        outputPath,
      ]);

      if (code !== 0) throw new Error("qpdf failed");

      const out = qpdf.FS.readFile(outputPath);
      const { downloadBlob } = await import("@/lib/audio-utils");
      downloadBlob(pdfBytesToBlob(out), `protected-${file.name}`);
    } catch {
      setError(t.errProtectFailed);
    } finally {
      setProcessing(false);
    }
  };

  const controls = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
        }}
      />

      <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary inline-flex items-center gap-2">
        <Upload className="h-4 w-4" />
        {file ? file.name : t.uploadPdf}
      </button>

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

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

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
  );
}
