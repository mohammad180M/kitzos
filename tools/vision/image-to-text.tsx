"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Loader2, Upload } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ImageToText() {
  const labels = useCommonLabels();
  const { locale } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrLang, setOcrLang] = useState<"eng" | "ara" | "eng+ara">(
    locale === "ar" ? "eng+ara" : "eng"
  );

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const runOcr = async (file: File) => {
    setLoading(true);
    setError(null);
    setText("");

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreview(url);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(ocrLang);
      const {
        data: { text: result },
      } = await worker.recognize(file);
      await worker.terminate();
      setText(result.trim());
    } catch {
      setError("OCR failed. Try a clearer image or another language.");
    } finally {
      setLoading(false);
    }
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
          if (f) void runOcr(f);
        }}
      />

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">OCR language</p>
        <select
          value={ocrLang}
          onChange={(e) => setOcrLang(e.target.value as typeof ocrLang)}
          className="input-field mt-1 max-w-xs"
        >
          <option value="eng">English</option>
          <option value="ara">Arabic</option>
          <option value="eng+ara">English + Arabic</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-8 text-gray-500 hover:border-primary-400 dark:border-gray-600"
      >
        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
        <span>Upload image to extract text</span>
      </button>

      {preview && (
        <img
          src={preview}
          alt="Uploaded for OCR"
          className="max-h-48 rounded-lg border border-gray-200 object-contain dark:border-gray-700"
        />
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
            className="input-field font-mono text-sm"
            aria-label="Extracted text"
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
