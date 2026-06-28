"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Upload } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import { useImageLoader } from "@/lib/hooks/use-image-loader";
import { getToolSlugFromPath, toolImageSessionKey } from "@/lib/hooks/use-tool-draft";
import { imageToAsciiArt } from "@/lib/image-to-ascii";
import { usePathname } from "next/navigation";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";

export default function ImageToAscii() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("imageToAscii");
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname);

  const { imgRef, inputRef, hasImage, imageVersion, error, handleInputChange } = useImageLoader(
    toolSlug ? toolImageSessionKey(toolSlug) : undefined
  );

  const [ascii, setAscii] = useState("");
  const [charWidth, setCharWidth] = useState(100);
  const [invert, setInvert] = useState(false);
  const [copied, setCopied] = useState(false);

  const messages = { invalid: shared.invalidImage, loadFailed: shared.loadFailed };

  useEffect(() => {
    const img = imgRef.current;
    if (!hasImage || !img?.naturalWidth) {
      setAscii("");
      return;
    }
    setAscii(imageToAsciiArt(img, charWidth, invert));
  }, [hasImage, imageVersion, charWidth, invert, imgRef]);

  const copyAscii = async () => {
    if (!ascii) return;
    try {
      await navigator.clipboard.writeText(ascii);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadTxt = () => {
    if (!ascii) return;
    const blob = new Blob([ascii], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, "ascii-art.txt");
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
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/30"
      >
        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{shared.uploadImage}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleInputChange(e, messages)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {hasImage && (
        <>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.width}: {charWidth}
            </span>
            <input
              type="range"
              min={40}
              max={180}
              value={charWidth}
              onChange={(e) => setCharWidth(Number(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={invert}
              onChange={(e) => setInvert(e.target.checked)}
              className="accent-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t.invert}</span>
          </label>

          {ascii && (
            <pre
              className="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-[6px] leading-none text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:text-[8px]"
              dir="ltr"
              aria-label={t.chars}
            >
              {ascii}
            </pre>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void copyAscii()} className="btn-secondary inline-flex items-center gap-2">
              <Copy className="h-4 w-4" />
              {copied ? t.copied : t.copy}
            </button>
            <button type="button" onClick={downloadTxt} className="btn-primary inline-flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t.downloadTxt}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
