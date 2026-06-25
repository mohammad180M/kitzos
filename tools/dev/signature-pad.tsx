"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/audio-utils";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

export default function SignaturePad() {
  const labels = useCommonLabels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) setupCanvas(canvas, 500, 200);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    canvasRef.current?.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    const { x, y } = getPos(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const exportPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas, "image/png");
    downloadBlob(blob, "signature.png");
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="w-full max-w-lg rounded-lg border border-gray-300 bg-transparent dark:border-gray-600"
        style={{ touchAction: "none", background: "repeating-conic-gradient(#f3f4f6 0% 25%, #fff 0% 50%) 50% / 16px 16px" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      />
      <div className="flex gap-2">
        <button type="button" onClick={clear} className="btn-secondary">{labels.clear}</button>
        <button type="button" onClick={() => void exportPng()} className="btn-primary inline-flex items-center gap-2">
          <Download className="h-4 w-4" /> {labels.download} PNG
        </button>
      </div>
    </div>
  );
}
