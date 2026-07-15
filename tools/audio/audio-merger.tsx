"use client";

import { useState } from "react";
import { Download, GripVertical, Loader2, Trash2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import {
  concatBuffers,
  decodeAudioFile,
  downloadBlob,
  encodeMp3,
  encodeWav,
  isAudioFile,
} from "@/lib/audio-utils";
import { useAudioToolLabels } from "@/lib/i18n/use-audio-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

interface AudioItem {
  id: string;
  name: string;
  file: File;
}

export default function AudioMerger() {
  const t = useAudioToolLabels("audioMerger");
  const [items, setItems] = useState<AudioItem[]>([]);
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useUnsavedWork(items.length > 0);

  const addFiles = (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(isAudioFile);
    if (audioFiles.length === 0) {
      setError(t.errNeedAudio);
      return;
    }
    setError(null);
    setItems((prev) => [
      ...prev,
      ...audioFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        file,
      })),
    ]);
  };

  const merge = async () => {
    if (items.length < 2) {
      setError(t.errNeedTwo);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const buffers = [];
      for (const item of items) {
        const { buffer } = await decodeAudioFile(item.file);
        buffers.push(buffer);
      }
      const merged = concatBuffers(buffers);
      const blob =
        format === "mp3" ? await encodeMp3(merged) : encodeWav(merged);
      downloadBlob(blob, `merged-audio.${format}`);
    } catch {
      setError(t.errMergeFailed);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropZone
        accept="audio/*,video/webm,.webm,.mp3,.wav,.m4a,.ogg,.opus,.flac"
        multiple
        label={t.addFiles}
        onFiles={(files) => {
          addFiles(files);
        }}
      />

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <GripVertical className="h-4 w-4 text-gray-400" aria-hidden />
              <span className="flex-1 truncate text-sm">{index + 1}. {item.name}</span>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                className="text-gray-400 hover:text-red-500"
                aria-label={t.remove}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.outputFormat}</p>
        <div className="mt-2 inline-flex rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
          {(["mp3", "wav"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium uppercase ${
                format === f ? "bg-primary-600 text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void merge()}
        disabled={processing || items.length < 2}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {t.mergeDownload}
      </button>
    </div>
  );
}
