"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Loader2, RotateCw, Upload } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { loadImageFromFile, prepareOcrCanvas } from "@/lib/ocr-preprocess";
import { useUnsavedWork } from "@/lib/unsaved-work";

type OcrLang = "eng" | "ara" | "eng+ara";

function langToTesseract(lang: OcrLang): string {
  return lang;
}

export default function ImageToText() {
  const labels = useCommonLabels();
  const { locale, t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrLang, setOcrLang] = useState<OcrLang>(locale === "ar" ? "ara" : "eng");
  const [enhanceImage, setEnhanceImage] = useState(true);
  const [rotation, setRotation] = useState(0);

  useUnsavedWork(preview !== null);

  const ocr = t.imageToText;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const runOcr = useCallback(async (fileOverride?: File) => {
    const file = fileOverride ?? fileRef.current;
    if (!file) return;

    setLoading(true);
    setError(null);
    setText("");
    setProgress(0);
    setProgressLabel(ocr.progress);

    try {
      const image = await loadImageFromFile(file);
      const canvas = prepareOcrCanvas(image, rotation, enhanceImage);

      const { createWorker, PSM } = await import("tesseract.js");
      const tessLang = langToTesseract(ocrLang);
      const worker = await createWorker(tessLang, undefined, {
        logger: (message) => {
          if (typeof message.progress === "number") {
            setProgress(Math.round(message.progress * 100));
          }
          if (message.status) {
            setProgressLabel(message.status);
          }
        },
      });

      await worker.setParameters({
        tessedit_pageseg_mode: ocrLang === "ara" ? PSM.SINGLE_BLOCK : PSM.AUTO,
        preserve_interword_spaces: "1",
      });

      const {
        data: { text: result },
      } = await worker.recognize(canvas);
      await worker.terminate();
      setText(result.trim());
    } catch {
      setError(ocr.error);
    } finally {
      setLoading(false);
      setProgressLabel("");
    }
  }, [ocrLang, enhanceImage, rotation, ocr.error, ocr.progress]);

  const onFileSelected = (file: File) => {
    fileRef.current = file;
    setRotation(0);

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreview(url);
  };

  const onUpload = (file: File) => {
    onFileSelected(file);
    void runOcr(file);
  };

  const rotateImage = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{ocr.ocrLanguage}</p>
          <select
            value={ocrLang}
            onChange={(e) => setOcrLang(e.target.value as OcrLang)}
            className="input-field mt-1 w-full"
            disabled={loading}
          >
            <option value="eng">{ocr.langEng}</option>
            <option value="ara">{ocr.langAra}</option>
            <option value="eng+ara">{ocr.langBoth}</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border border-gray-200 px-3 py-2.5 text-sm dark:border-gray-700">
          <input
            type="checkbox"
            checked={enhanceImage}
            onChange={(e) => setEnhanceImage(e.target.checked)}
            disabled={loading}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-gray-700 dark:text-gray-300">{ocr.enhance}</span>
        </label>
      </div>

      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{ocr.tip}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-8 text-gray-500 hover:border-primary-400 dark:border-gray-600"
      >
        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
        <span>{ocr.upload}</span>
      </button>

      {preview && (
        <div className="flex flex-wrap items-start gap-3">
          <img
            src={preview}
            alt={ocr.previewAlt}
            loading="lazy"
            decoding="async"
            width={800}
            height={480}
            style={{ transform: `rotate(${rotation}deg)` }}
            className="max-h-48 max-w-full rounded-lg border border-gray-200 object-contain transition-transform dark:border-gray-700"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={rotateImage}
              disabled={loading}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4" />
              {ocr.rotate}
            </button>
            <button
              type="button"
              onClick={() => void runOcr()}
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {ocr.extract}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-2" role="status" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-primary-500 transition-[width] duration-200"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {progressLabel || ocr.progress}
            {progress > 0 ? ` (${progress}%)` : ""}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {text && (
        <div className="space-y-2">
          <textarea
            readOnly
            value={text}
            rows={10}
            className="input-field ltr-input font-mono text-sm"
            aria-label={ocr.extractedText}
            dir="auto"
          />
          <button type="button" onClick={() => void copy()} className="btn-secondary inline-flex items-center gap-2">
            <Copy className="h-4 w-4" />
            {copied ? labels.copied : labels.copy}
          </button>
        </div>
      )}
    </div>
  );
}
