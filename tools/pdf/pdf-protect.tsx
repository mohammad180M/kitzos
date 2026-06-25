"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { downloadBlob } from "@/lib/audio-utils";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

export default function PdfProtect() {
  const labels = useCommonLabels();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const protect = async () => {
    if (!file || !password) {
      setError("Upload a PDF and enter a password.");
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
      const bytes = new Uint8Array(await file.arrayBuffer());
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

      if (code !== 0) {
        throw new Error("qpdf failed");
      }

      const out = qpdf.FS.readFile(outputPath);
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), `protected-${file.name}`);
    } catch {
      setError("Could not protect PDF. Try a different file or password.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary inline-flex items-center gap-2">
        <Upload className="h-4 w-4" />
        {file ? file.name : "Upload PDF"}
      </button>

      <label className="block text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field mt-1"
          autoComplete="new-password"
        />
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => void protect()}
        disabled={!file || !password || processing}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Protect & {labels.download}
      </button>

      <p className="text-xs text-gray-400">
        Uses qpdf (WASM) locally in your browser — standard PDF password encryption, nothing uploaded.
      </p>
    </div>
  );
}
