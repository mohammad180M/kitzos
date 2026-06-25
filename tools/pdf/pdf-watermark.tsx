"use client";

import { useRef, useState } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { Download, Loader2, Upload } from "lucide-react";
import { downloadBlob } from "@/lib/audio-utils";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

export default function PdfWatermark() {
  const labels = useCommonLabels();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width / 2 - text.length * 6,
          y: height / 2,
          size: 48,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: degrees(-35),
        });
      }
      const out = await pdfDoc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), `watermarked-${file.name}`);
    } catch {
      setError("Could not watermark PDF.");
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
        <span className="font-medium text-gray-700 dark:text-gray-300">Watermark text</span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-field mt-1"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">Opacity ({Math.round(opacity * 100)}%)</span>
        <input
          type="range"
          min={0.1}
          max={0.8}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="mt-1 w-full"
        />
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => void apply()}
        disabled={!file || processing}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Apply & {labels.download}
      </button>
    </div>
  );
}
