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
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

const MAX_PREVIEW = 600;

export default function FlipImage() {
  const common = useCommonLabels();
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("flipImage");
  const { locale } = useLocale();
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const { imgRef, hasImage, imageVersion, error, loadFile } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  useUnsavedWork(hasImage);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scale = Math.min(1, MAX_PREVIEW / Math.max(natW, natH));
    const dispW = Math.round(natW * scale);
    const dispH = Math.round(natH * scale);

    const ctx = setupCanvas(canvas, dispW, dispH);
    ctx.clearRect(0, 0, dispW, dispH);
    ctx.save();
    ctx.translate(dispW / 2, dispH / 2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, (-natW * scale) / 2, (-natH * scale) / 2, natW * scale, natH * scale);
    ctx.restore();
  }, [flipH, flipV, imgRef]);

  useEffect(() => {
    if (hasImage) render();
  }, [hasImage, imageVersion, render]);

  const toggleBoth = () => {
    const next = !(flipH && flipV);
    setFlipH(next);
    setFlipV(next);
  };

  const exportImage = async () => {
    const img = imgRef.current;
    if (!img) return;

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const off = document.createElement("canvas");
    const ctx = setupCanvas(off, natW, natH);
    ctx.save();
    ctx.translate(natW / 2, natH / 2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -natW / 2, -natH / 2, natW, natH);
    ctx.restore();

    const mime = sourceFile?.type === "image/jpeg" ? "image/jpeg" : "image/png";
    const ext = mime === "image/jpeg" ? "jpg" : "png";

    try {
      const blob = await canvasToBlob(off, mime);
      downloadBlob(blob, `flipped.${ext}`);
    } catch {
      // canvas unsupported
    }
  };

  return (
    <div className="space-y-4">
      <FileDropZone
        accept="image/*"
        label={shared.uploadImage}
        onFiles={(files) => {
          const f = files[0];
          if (!f) return;
          setSourceFile(f);
          setFlipH(false);
          setFlipV(false);
          loadFile(f, messages);
        }}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {hasImage && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.preview}</p>
            <canvas ref={canvasRef} className="mx-auto max-w-full rounded-lg border border-gray-200 dark:border-gray-700" />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFlipH((v) => !v)}
              className={`btn-secondary text-sm ${flipH ? "ring-2 ring-primary-500" : ""}`}
            >
              {t.flipH}
            </button>
            <button
              type="button"
              onClick={() => setFlipV((v) => !v)}
              className={`btn-secondary text-sm ${flipV ? "ring-2 ring-primary-500" : ""}`}
            >
              {t.flipV}
            </button>
            <button
              type="button"
              onClick={toggleBoth}
              className={`btn-secondary text-sm ${flipH && flipV ? "ring-2 ring-primary-500" : ""}`}
            >
              {t.flipBoth}
            </button>
          </div>

          <button type="button" onClick={() => void exportImage()} className="btn-primary inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            {common.download}
          </button>
        </>
      )}

      <p className="text-sm text-secondary">
        <Link
          href={`/${locale}/tools/image-rotator/`}
          className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
        >
          {t.needRotateLink}
        </Link>
      </p>
    </div>
  );
}
