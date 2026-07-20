"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import {
  decodeAudioFile,
  downloadBlob,
  encodeMp3,
  encodeWav,
  isAudioFile,
} from "@/lib/audio-utils";
import { useAudioToolLabels } from "@/lib/i18n/use-audio-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";
import ToolModeToggle from "@/components/tools/ToolModeToggle";
import BatchUploader, { type ToolMode, type BatchOutput } from "@/components/tools/BatchUploader";

type OutputFormat = "mp3" | "wav";

export default function AudioConverter() {
  const t = useAudioToolLabels("audioConverter");
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<OutputFormat>("mp3");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ToolMode>("single");

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

  const processFile = useCallback(
    async (f: File): Promise<BatchOutput> => {
      if (!isAudioFile(f)) {
        throw new Error(t.unsupportedFile);
      }
      const { buffer } = await decodeAudioFile(f);
      const blob =
        output === "mp3" ? await encodeMp3(buffer) : encodeWav(buffer);
      const base = f.name.replace(/\.[^.]+$/, "") ?? "audio";
      return { blob, name: `${base}.${output}` };
    },
    [output, t.unsupportedFile]
  );

  const formatToggle = (
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
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ToolModeToggle mode={mode} onChange={setMode} />
      </div>

      {formatToggle}

      {mode === "single" ? (
        <>
          <FileDropZone
            accept="audio/*,video/webm,.webm,.mp3,.wav,.m4a,.ogg,.opus,.flac"
            label={t.uploadHint}
            disabled={processing}
            icon={processing ? <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" /> : undefined}
            onFiles={(files) => {
              const f = files[0];
              if (f) void convert(f);
            }}
          />

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
        </>
      ) : (
        <BatchUploader
          accept="audio/*,video/webm,.webm,.mp3,.wav,.m4a,.ogg,.opus,.flac"
          processFile={processFile}
        />
      )}
    </div>
  );
}
