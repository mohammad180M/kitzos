"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Download, Loader2, Upload } from "lucide-react";
import { setupCanvas } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

const PAD_WIDTH = 400;
const PAD_HEIGHT = 150;

export default function PdfSign() {
  const labels = useCommonLabels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) setupCanvas(canvas, PAD_WIDTH, PAD_HEIGHT);
  }, []);

  const applySignature = async () => {
    if (!pdfFile || !canvasRef.current) return;
    setProcessing(true);
    setError(null);
    try {
      const sigBlob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((b) => (b ? resolve(b) : reject()), "image/png");
      });
      const sigBytes = new Uint8Array(await sigBlob.arrayBuffer());
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const page = pdfDoc.getPage(0);
      const { width } = page.getSize();
      const sigW = 150;
      const sigH = (sigImage.height / sigImage.width) * sigW;
      page.drawImage(sigImage, {
        x: width - sigW - 50,
        y: 50,
        width: sigW,
        height: sigH,
      });
      const out = await pdfDoc.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), `signed-${pdfFile.name}`);
    } catch {
      setError("Could not sign PDF. Check the file and try again.");
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
        onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {pdfFile ? pdfFile.name : "Upload PDF"}
      </button>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Draw signature</p>
        <canvas
          ref={canvasRef}
          className="w-full max-w-md cursor-crosshair rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
          style={{ touchAction: "none" }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        <button type="button" onClick={clearPad} className="mt-2 text-sm text-gray-500 hover:text-gray-700">
          {labels.clear}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={() => void applySignature()}
        disabled={!pdfFile || processing}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Sign & {labels.download}
      </button>
    </div>
  );
}
