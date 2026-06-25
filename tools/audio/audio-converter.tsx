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
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

type OutputFormat = "mp3" | "wav";

export default function AudioConverter() {
  const labels = useCommonLabels();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<OutputFormat>("mp3");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async (f: File) => {
    if (!isAudioFile(f)) {
      setError("Unsupported file. Use MP3, WAV, M4A, OGG, or WebM.");
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
      setError("Conversion failed. Try another file or WAV output.");
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
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Convert to</p>
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
        <span>Upload audio (WAV, MP3, M4A, OGG…)</span>
      </button>

      {file && !processing && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last converted: {file.name}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Decodes in your browser via Web Audio API. MP3 encoding uses lamejs locally — nothing is uploaded.
      </p>
    </div>
  );
}
