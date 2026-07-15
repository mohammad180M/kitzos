"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import {
  decodeAudioFile,
  downloadBlob,
  encodeMp3,
  encodeWav,
  isAudioFile,
  sliceBuffer,
} from "@/lib/audio-utils";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useAudioToolLabels } from "@/lib/i18n/use-audio-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

export default function Mp3Cutter() {
  const labels = useCommonLabels();
  const t = useAudioToolLabels("mp3Cutter");
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(file !== null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const loadFile = useCallback(async (f: File) => {
    setError(null);
    if (!isAudioFile(f)) {
      setError(t.unsupportedFile);
      return;
    }
    try {
      const { buffer } = await decodeAudioFile(f);
      bufferRef.current = buffer;
      setFile(f);
      setDuration(buffer.duration);
      setStart(0);
      setEnd(buffer.duration);
    } catch {
      setError(t.decodeFailed);
      bufferRef.current = null;
      setFile(null);
    }
  }, [t.unsupportedFile, t.decodeFailed]);

  const handleCut = async () => {
    const buffer = bufferRef.current;
    if (!buffer || start >= end) {
      setError(t.errInvalidRange);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const sliced = sliceBuffer(buffer, start, end);
      const blob =
        format === "mp3" ? await encodeMp3(sliced) : encodeWav(sliced);
      const base = file?.name.replace(/\.[^.]+$/, "") ?? "audio";
      downloadBlob(blob, `${base}-cut.${format}`);
    } catch {
      setError(t.errExportFailed);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      bufferRef.current = null;
    };
  }, []);

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
    return `${m}:${s.padStart(4, "0")}`;
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDropZone
          accept="audio/*,video/webm,.webm,.mp3,.wav,.m4a,.ogg,.opus,.flac"
          label={t.uploadHint}
          onFiles={(files) => {
            const f = files[0];
            if (f) void loadFile(f);
          }}
        />
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{file.name}</strong> — {fmt(duration)} {t.totalLabel}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">{t.startSec}</span>
              <input
                type="number"
                min={0}
                max={duration}
                step={0.1}
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="input-field mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">{t.endSec}</span>
              <input
                type="number"
                min={0}
                max={duration}
                step={0.1}
                value={end}
                onChange={(e) => setEnd(Number(e.target.value))}
                className="input-field mt-1"
              />
            </label>
          </div>

          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="w-full"
            aria-label={t.startTimeAria}
          />
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={end}
            onChange={(e) => setEnd(Number(e.target.value))}
            className="w-full"
            aria-label={t.endTimeAria}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.exportFormat}</p>
            <div className="mt-2 inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
              {(["mp3", "wav"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium uppercase ${
                    format === f
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {file && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleCut()}
            disabled={processing}
            className="btn-primary inline-flex items-center gap-2"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {labels.download}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              bufferRef.current = null;
            }}
            className="btn-secondary"
          >
            {labels.clear}
          </button>
        </div>
      )}
    </div>
  );
}
