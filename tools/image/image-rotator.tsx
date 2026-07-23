"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { setupCanvas, canvasToBlob } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/download";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { getToolSlugFromPath, toolImageSessionKey } from "@/lib/hooks/use-tool-draft";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";
import Rotate90Button, { nextQuarterTurn } from "@/components/tools/Rotate90Button";

const MAX_PREVIEW = 600;

export default function ImageRotator() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageRotator");
  const pathname = usePathname();
  const { locale } = useLocale();
  const toolSlug = getToolSlugFromPath(pathname);
  const [mode, setMode] = useState<ToolMode>("single");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imgRef, hasImage, imageVersion, error, loadFile } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [rotation, setRotation] = useState(0);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const rad = (rotation * Math.PI) / 180;
    const swap = rotation === 90 || rotation === 270;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const outW = swap ? natH : natW;
    const outH = swap ? natW : natH;

    const scale = Math.min(1, MAX_PREVIEW / Math.max(outW, outH));
    const dispW = Math.round(outW * scale);
    const dispH = Math.round(outH * scale);

    const ctx = setupCanvas(canvas, dispW, dispH);
    ctx.clearRect(0, 0, dispW, dispH);
    ctx.save();
    ctx.translate(dispW / 2, dispH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, (-natW * scale) / 2, (-natH * scale) / 2, natW * scale, natH * scale);
    ctx.restore();
  }, [rotation, imgRef]);

  useEffect(() => {
    if (hasImage) render();
  }, [hasImage, imageVersion, render]);

  useEffect(() => {
    setRotation(0);
  }, [imageVersion]);

  const exportPng = async () => {
    const img = imgRef.current;
    if (!img) return;

    const rad = (rotation * Math.PI) / 180;
    const swap = rotation === 90 || rotation === 270;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const outW = swap ? natH : natW;
    const outH = swap ? natW : natH;

    const off = document.createElement("canvas");
    const ctx = setupCanvas(off, outW, outH);
    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
    ctx.restore();

    try {
      const blob = await canvasToBlob(off);
      downloadBlob(blob, "rotated.png");
    } catch {
      // canvas unsupported
    }
  };

  const bumpRotation = () => setRotation((r) => nextQuarterTurn(r));

  const processFile = useCallback(
    async (file: File): Promise<BatchOutput> => {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const im = new Image();
        im.onload = () => {
          URL.revokeObjectURL(url);
          resolve(im);
        };
        im.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error(shared.loadFailed));
        };
        im.src = url;
      });

      const rad = (rotation * Math.PI) / 180;
      const swap = rotation === 90 || rotation === 270;
      const outW = swap ? img.naturalHeight : img.naturalWidth;
      const outH = swap ? img.naturalWidth : img.naturalHeight;

      const off = document.createElement("canvas");
      const ctx = setupCanvas(off, outW, outH);
      ctx.save();
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate(rad);
      ctx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight
      );
      ctx.restore();

      const blob = await canvasToBlob(off);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      return { blob, name: `${baseName}-rotated.png` };
    },
    [rotation, shared.loadFailed]
  );

  const rotationControl = (
    <Rotate90Button degrees={rotation} onRotate={bumpRotation} label={t.rotate90Step} />
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ToolModeToggle mode={mode} onChange={setMode} />
      </div>

      {mode === "single" ? (
        <>
          <FileDropZone
            accept="image/*"
            label={shared.uploadImage}
            onFiles={(files) => {
              const f = files[0];
              if (f) loadFile(f, messages);
            }}
          />

          {error && (
            <p
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}

          {hasImage && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {shared.preview}
                </p>
                <canvas
                  ref={canvasRef}
                  className="mx-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>

              {rotationControl}

              <button
                type="button"
                onClick={() => void exportPng()}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {common.download}
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
            <p className="text-sm font-medium text-[var(--text)]">{t.rotation}</p>
            {rotationControl}
          </div>

          <BatchUploader
            accept="image/*"
            processFile={processFile}
            thumbnailRotateDeg={rotation}
          />
        </>
      )}

      <p className="text-sm text-secondary">
        <Link
          href={`/${locale}/tools/flip-image/`}
          className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
        >
          {t.needFlipLink}
        </Link>
      </p>
    </div>
  );
}
