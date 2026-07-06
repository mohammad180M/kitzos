"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import {
  decodeAudioFile,
  downloadBlob,
  encodeMp3,
  encodeWav,
  isAudioFile,
} from "@/lib/audio-utils";
import { useAudioToolLabels } from "@/lib/i18n/use-audio-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

type OutputFormat = "mp3" | "wav";

export default function AudioConverter() {
  const t = useAudioToolLabels("audioConverter");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<OutputFormat>("mp3");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(file !== null);

  const convert = async (f: File) => {
    if (!isAudioFile(f)) {
      setError(t.unsupportedFile);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const { buffer } = await decodeAudioFile(f);
      const blob =
        output === "mp3" ? await encodeMp3(buffer) : encodeWav(buffer);
      const base = f.name.replace(/\.[^.]+$/, "") ?? "audio";
      downloadBlob(blob, `${base}.${output}`);
      setFile(f);
    } catch {
      setError(t.errConvertFailed);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/webm,.webm,.mp3,.wav,.m4a,.ogg,.opus,.flac"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void convert(f);
          e.target.value = "";
        }}
      />

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.convertTo}</p>
        <div className="mt-2 inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
          {(["mp3", "wav"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setOutput(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium uppercase ${
                output === f ? "bg-primary-600 text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-10 text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-600"
      >
        {processing ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <Upload className="h-8 w-8" />
        )}
        <span>{t.uploadHint}</span>
      </button>

      {file && !processing && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.lastConverted(file.name)}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {t.privacyNote}
      </p>
    </div>
  );
}
