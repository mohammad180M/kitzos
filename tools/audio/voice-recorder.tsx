"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Mic, Square } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import { decodeAudioFile, encodeMp3, encodeWav } from "@/lib/audio-utils";

type ExportFormat = "webm" | "mp3" | "wav";

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [exporting, setExporting] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    };
  }, [playbackUrl]);

  const start = async () => {
    setError(null);
    setBlob(null);
    if (playbackUrl) {
      URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setBlob(audioBlob);
        setPlaybackUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((t) => t.stop());
      };

      recorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access denied or unavailable.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const download = async (format: ExportFormat) => {
    if (!blob) return;
    setExporting(true);
    setError(null);

    try {
      if (format === "webm") {
        downloadBlob(blob, `recording-${Date.now()}.webm`);
        return;
      }

      const file = new File([blob], "recording.webm", { type: blob.type || "audio/webm" });
      const { buffer } = await decodeAudioFile(file);
      const out =
        format === "mp3" ? await encodeMp3(buffer) : encodeWav(buffer);
      downloadBlob(out, `recording-${Date.now()}.${format}`);
    } catch {
      setError(`Could not export as ${format.toUpperCase()}. Try WebM instead.`);
    } finally {
      setExporting(false);
    }
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-4 text-center" dir="ltr">
      <p className="text-4xl font-mono tabular-nums text-gray-900 dark:text-gray-100">
        {fmt(seconds)}
      </p>

      <div className="flex justify-center gap-3">
        {!recording ? (
          <button
            type="button"
            onClick={() => void start()}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Mic className="h-5 w-5" />
            Start recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop
          </button>
        )}
      </div>

      {playbackUrl && blob && (
        <div className="space-y-3">
          <audio controls src={playbackUrl} className="mx-auto w-full max-w-md" />
          <div className="flex flex-wrap justify-center gap-2">
            {(["webm", "mp3", "wav"] as const).map((format) => (
              <button
                key={format}
                type="button"
                disabled={exporting}
                onClick={() => void download(format)}
                className="btn-secondary inline-flex items-center gap-2 uppercase"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {format}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Recording stays on your device. Export as WebM, MP3, or WAV — nothing is uploaded.
      </p>
    </div>
  );
}
