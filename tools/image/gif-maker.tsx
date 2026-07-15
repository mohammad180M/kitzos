"use client";

import FileDropZone from "@/components/FileDropZone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Loader2, Pause, Play, Trash2 } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import { encodeGifFromCanvases } from "@/lib/image/gif-encode";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

interface GifFrame {
  id: string;
  url: string;
  img: HTMLImageElement;
}

const MAX_FRAMES = 50;
const MIN_DELAY = 50;
const MAX_DELAY = 2000;

function scaleToMax(naturalW: number, naturalH: number, maxDim: number): { w: number; h: number } {
  const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH));
  return {
    w: Math.max(1, Math.round(naturalW * scale)),
    h: Math.max(1, Math.round(naturalH * scale)),
  };
}

function frameToCanvas(img: HTMLImageElement, maxDim: number): HTMLCanvasElement {
  const { w, h } = scaleToMax(img.naturalWidth, img.naturalHeight, maxDim);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  }
  return canvas;
}

function normalizeCanvases(canvases: HTMLCanvasElement[]): HTMLCanvasElement[] {
  if (!canvases.length) return [];
  const maxW = Math.max(...canvases.map((c) => c.width));
  const maxH = Math.max(...canvases.map((c) => c.height));
  return canvases.map((c) => {
    if (c.width === maxW && c.height === maxH) return c;
    const nc = document.createElement("canvas");
    nc.width = maxW;
    nc.height = maxH;
    const ctx = nc.getContext("2d");
    if (!ctx) return c;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, maxW, maxH);
    ctx.drawImage(c, (maxW - c.width) / 2, (maxH - c.height) / 2);
    return nc;
  });
}

export default function GifMaker() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("gifMaker");

  const [frames, setFrames] = useState<GifFrame[]>([]);
  const [delayMs, setDelayMs] = useState(200);
  const [loop, setLoop] = useState(true);
  const [maxDim, setMaxDim] = useState<480 | 720>(480);
  const [encoding, setEncoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const framesRef = useRef<GifFrame[]>([]);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useUnsavedWork(frames.length > 0);

  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  useEffect(() => {
    return () => {
      framesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [gifUrl]);

  const previewCanvases = useMemo(
    () => normalizeCanvases(frames.map((f) => frameToCanvas(f.img, maxDim))),
    [frames, maxDim]
  );

  const clearEncoded = useCallback(() => {
    setGifBlob(null);
    setGifUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const invalidatePreview = useCallback(() => {
    clearEncoded();
    setPlaying(false);
  }, [clearEncoded]);

  useEffect(() => {
    if (previewIndex >= frames.length) {
      setPreviewIndex(Math.max(0, frames.length - 1));
    }
  }, [frames.length, previewIndex]);

  useEffect(() => {
    if (gifUrl) return;
    const canvas = previewCanvasRef.current;
    const source = previewCanvases[previewIndex];
    if (!canvas || !source) return;
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0);
  }, [previewCanvases, previewIndex, gifUrl]);

  useEffect(() => {
    if (!playing || gifUrl || previewCanvases.length < 2) return;
    const timer = window.setTimeout(() => {
      setPreviewIndex((idx) => {
        const next = idx + 1;
        if (next >= previewCanvases.length) {
          return loop ? 0 : idx;
        }
        return next;
      });
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [playing, previewIndex, delayMs, loop, previewCanvases.length, gifUrl]);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) {
        setError(shared.invalidImage);
        return;
      }

      const remaining = MAX_FRAMES - frames.length;
      if (remaining <= 0) {
        setError(t.maxFrames);
        return;
      }

      setError(null);
      invalidatePreview();
      const toAdd = list.slice(0, remaining);

      toAdd.forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          setFrames((prev) => {
            if (prev.length >= MAX_FRAMES) {
              URL.revokeObjectURL(url);
              return prev;
            }
            return [...prev, { id: crypto.randomUUID(), url, img }];
          });
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          setError(shared.loadFailed);
        };
        img.src = url;
      });
    },
    [frames.length, invalidatePreview, shared.invalidImage, shared.loadFailed, t.maxFrames]
  );

  const removeFrame = (id: string) => {
    setFrames((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((f) => f.id !== id);
    });
    invalidatePreview();
  };

  const moveFrame = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= frames.length) return;
    setFrames((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
    setPreviewIndex((idx) => {
      if (idx === index) return next;
      if (idx === next) return index;
      return idx;
    });
    invalidatePreview();
  };

  const encode = async () => {
    if (frames.length < 2) {
      setError(t.needFrames);
      return;
    }

    setError(null);
    setEncoding(true);
    setProgress(0);
    setPlaying(false);
    clearEncoded();

    try {
      await new Promise((r) => setTimeout(r, 0));
      const bytes = await encodeGifFromCanvases(previewCanvases, delayMs, loop, setProgress);
      const blob = new Blob([Uint8Array.from(bytes)], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      setGifBlob(blob);
      setGifUrl(url);
    } catch {
      setError(shared.loadFailed);
    } finally {
      setEncoding(false);
    }
  };

  const frameCount = frames.length;
  const showPlayer = frameCount > 0;

  return (
    <div className="space-y-4">
      <FileDropZone
        accept="image/*"
        multiple
        label={frames.length ? t.addMore : t.uploadHint}
        onFiles={(files) => {
          if (files.length) addFiles(files);
        }}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {showPlayer && (
        <div className="space-y-3 rounded-xl border border-line bg-surface-2 p-4">
          <div className="flex min-h-[120px] items-center justify-center rounded-lg bg-white dark:bg-gray-900">
            {gifUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gifUrl} alt="" className="max-h-72 max-w-full rounded object-contain" />
            ) : (
              <canvas ref={previewCanvasRef} className="max-h-72 max-w-full rounded" />
            )}
          </div>

          {gifBlob && (
            <p className="text-center text-sm text-secondary">
              {t.encodedSize(Math.max(1, Math.round(gifBlob.size / 1024)))}
            </p>
          )}

          {!gifUrl && frameCount >= 2 && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="btn-secondary text-sm"
                aria-label={playing ? t.previewPause : t.previewPlay}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? t.previewPause : t.previewPlay}
              </button>
              <div className="min-w-[12rem] flex-1">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, frameCount - 1)}
                  value={previewIndex}
                  onChange={(e) => {
                    setPreviewIndex(Number(e.target.value));
                    setPlaying(false);
                  }}
                  className="w-full accent-primary-600"
                  aria-label={t.previewFrame(previewIndex + 1, frameCount)}
                />
                <p className="mt-1 text-center text-xs text-muted">
                  {t.previewFrame(previewIndex + 1, frameCount)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {frames.length > 0 && (
        <ul className="space-y-2">
          {frames.map((frame, index) => (
            <li
              key={frame.id}
              className={`flex items-center gap-3 rounded-lg border bg-white p-2 dark:bg-gray-800 ${
                !gifUrl && index === previewIndex
                  ? "border-primary-500 ring-2 ring-primary-400 dark:border-primary-400"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame.url} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.frameLabel(index + 1)}
              </span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => moveFrame(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label={t.moveUp}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFrame(index, 1)}
                  disabled={index === frames.length - 1}
                  className="rounded p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label={t.moveDown}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFrame(frame.id)}
                  className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  aria-label={t.remove}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="block max-w-md text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {t.frameDelay}: {delayMs} ms
        </span>
        <input
          type="range"
          min={MIN_DELAY}
          max={MAX_DELAY}
          step={10}
          value={delayMs}
          onChange={(e) => {
            setDelayMs(Number(e.target.value));
            invalidatePreview();
          }}
          className="mt-1 w-full"
        />
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={loop}
          onChange={(e) => {
            setLoop(e.target.checked);
            invalidatePreview();
          }}
          className="rounded border-gray-300"
        />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {loop ? t.loopOn : t.loopOff}
        </span>
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.maxDimension}</p>
        <div className="inline-flex gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {([480, 720] as const).map((dim) => (
            <button
              key={dim}
              type="button"
              onClick={() => {
                setMaxDim(dim);
                invalidatePreview();
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                maxDim === dim
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {dim}px
            </button>
          ))}
        </div>
      </div>

      {encoding && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-primary-600 transition-all dark:bg-primary-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted">{t.progress(progress)}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={encode}
          disabled={frames.length < 2 || encoding}
          className="btn-primary"
        >
          {encoding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.encoding}
            </>
          ) : (
            t.encode
          )}
        </button>

        {gifBlob && (
          <button
            type="button"
            onClick={() => downloadBlob(gifBlob, "animation.gif")}
            className="btn-primary"
          >
            <Download className="h-4 w-4" />
            {t.download}
          </button>
        )}
      </div>
    </div>
  );
}
