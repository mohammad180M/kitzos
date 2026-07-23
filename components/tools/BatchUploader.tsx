"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  FolderOpen,
  File as FileIcon,
  CheckCircle2,
  XCircle,
  X,
  Download,
  Trash2,
  Play,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useBatchLabels } from "@/lib/i18n/use-batch-labels";
import { downloadBlob } from "@/lib/download";
import ProgressIndicator from "@/components/tools/ProgressIndicator";

export type ToolMode = "single" | "batch";

export interface BatchOutput {
  blob: Blob;
  name: string;
}

export interface BatchFile {
  id: string;
  file: File;
  status: "queued" | "processing" | "done" | "error";
  progress: number;
  error?: string;
  outputs?: BatchOutput[];
  /** Object URL (images) or data URL (PDF page preview). */
  thumbnailUrl?: string;
  /** True while a PDF first-page preview is generating. */
  thumbnailLoading?: boolean;
  /** Live output-size preview (bytes); independent of Process All. */
  estimatedBytes?: number;
  /** True while a new estimate is pending (keep prior bytes greyed out). */
  estimateStale?: boolean;
}

export interface BatchUploaderProps {
  accept: string;
  /**
   * Per-file independent processing (default). Each file becomes its own
   * output(s); results can be downloaded individually or as a ZIP.
   */
  processFile?: (
    file: File,
    onProgress?: (pct: number) => void
  ) => Promise<BatchOutput | BatchOutput[]>;
  /**
   * Combine all uploaded files into one output (e.g. many images → one PDF).
   * When set, Process All runs once over every file in order — no ZIP of
   * per-file results.
   */
  processCombined?: (
    files: File[],
    onProgress?: (pct: number) => void
  ) => Promise<BatchOutput>;
  onClear?: () => void;
  /**
   * Optional CSS preview rotation for thumbnails (e.g. rotate-pdf batch angle).
   * Visual only — does not re-render or re-process files.
   */
  thumbnailRotateDeg?: number;
  /**
   * Optional target frame for thumbnail CSS aspect preview (e.g. image-resizer
   * width×height). Visual only — container aspect updates live; no re-encode.
   */
  thumbnailAspect?: { width: number; height: number } | null;
  /**
   * Optional CSS flip preview for thumbnails (e.g. flip-image batch).
   * Visual only — scaleX/scaleY; does not re-process files.
   */
  thumbnailFlip?: { horizontal?: boolean; vertical?: boolean } | null;
  /** Fired whenever the batch file list changes (add / remove / clear). */
  onFilesChange?: (files: File[]) => void;
  /**
   * Optional live output-size estimator (e.g. compress-image quality preview).
   * Must be cheap and side-effect free — never writes batch outputs.
   * Returns the expected final output size in bytes for the current settings.
   */
  estimateOutputSize?: (file: File) => Promise<number>;
  /**
   * When this key changes (e.g. quality slider), re-run estimates after debounce.
   * Ignored unless `estimateOutputSize` is set.
   */
  estimateKey?: string | number;
  /**
   * Optional: clicking a file row selects it (e.g. image-resizer live preview).
   * Pass `null, null` when the selection is cleared (remove / clear all).
   * Remove / download buttons still stop propagation.
   */
  onSelectFile?: (file: File | null, id: string | null) => void;
  /** Highlights the selected row when `onSelectFile` is used. */
  selectedFileId?: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAccepted(file: File, acceptString: string): boolean {
  if (!acceptString || acceptString === "*") return true;
  const rules = acceptString.split(",").map((r) => r.trim().toLowerCase());
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  for (const rule of rules) {
    if (rule.startsWith(".")) {
      if (name.endsWith(rule)) return true;
    } else if (rule.endsWith("/*")) {
      const prefix = rule.slice(0, -2);
      if (mime.startsWith(prefix)) return true;
    } else {
      if (mime === rule) return true;
    }
  }
  return false;
}

function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function revokeThumbUrl(url?: string) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

const PDF_THUMB_CONCURRENCY = 2;
const PDF_THUMB_SCALE = 0.28;
const ESTIMATE_DEBOUNCE_MS = 250;

/** Yield so UI / thumbnails stay responsive while estimating many files. */
function yieldForEstimate(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve(), { timeout: 120 });
    } else {
      setTimeout(resolve, 16);
    }
  });
}

function SizeEstimateLine({
  original,
  estimated,
  stale,
  calculatingLabel,
}: {
  original: number;
  estimated?: number;
  stale?: boolean;
  calculatingLabel: string;
}) {
  if (estimated == null) {
    return (
      <p className="text-[10px] text-[var(--muted)]" aria-live="polite">
        {stale ? calculatingLabel : formatBytes(original)}
      </p>
    );
  }

  const pct =
    original > 0 ? Math.round(((estimated - original) / original) * 100) : 0;
  const pctLabel = pct > 0 ? `(+${pct}%)` : `(${pct}%)`;
  const pctClass = stale
    ? "text-[var(--muted)]"
    : pct < 0
      ? "text-emerald-600 dark:text-emerald-400"
      : pct > 0
        ? "text-red-600 dark:text-red-400"
        : "text-[var(--muted)]";

  return (
    <p
      className={`text-[10px] tabular-nums transition-opacity ${
        stale ? "opacity-50" : ""
      }`}
      aria-live="polite"
    >
      <span className="text-[var(--muted)]">
        {formatBytes(original)} → {formatBytes(estimated)}
        {"  "}
      </span>
      <span className={pctClass}>{pctLabel}</span>
    </p>
  );
}

/** Long/short sides for portrait thumb slot; swap on 90°/270° CSS preview. */
const THUMB_LONG = 40;
const THUMB_SHORT = 30;
/** Max edge when sizing thumbs to a custom target aspect (image-resizer). */
const THUMB_ASPECT_MAX = 48;

function normalizeDegrees(deg: number): number {
  return ((Math.round(deg) % 360) + 360) % 360;
}

function frameSizeForAspect(
  targetW: number,
  targetH: number
): { width: number; height: number } {
  const ar = targetW / targetH;
  if (ar >= 1) {
    return {
      width: THUMB_ASPECT_MAX,
      height: Math.max(14, Math.round(THUMB_ASPECT_MAX / ar)),
    };
  }
  return {
    width: Math.max(14, Math.round(THUMB_ASPECT_MAX * ar)),
    height: THUMB_ASPECT_MAX,
  };
}

function BatchThumbPreview({
  loading,
  url,
  rotateDeg = 0,
  aspectFrame,
  flip,
}: {
  loading: boolean;
  url?: string;
  rotateDeg?: number;
  aspectFrame?: { width: number; height: number } | null;
  flip?: { horizontal?: boolean; vertical?: boolean } | null;
}) {
  const useAspect =
    aspectFrame != null && aspectFrame.width > 0 && aspectFrame.height > 0;

  const deg = normalizeDegrees(rotateDeg);
  const quarter = !useAspect && (deg === 90 || deg === 270);
  const flipH = Boolean(flip?.horizontal);
  const flipV = Boolean(flip?.vertical);
  const flipTransform =
    flipH || flipV
      ? `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
      : "";

  let frameW = THUMB_SHORT;
  let frameH = THUMB_LONG;
  if (useAspect) {
    const sized = frameSizeForAspect(aspectFrame.width, aspectFrame.height);
    frameW = sized.width;
    frameH = sized.height;
  } else if (quarter) {
    frameW = THUMB_LONG;
    frameH = THUMB_SHORT;
  }

  const dimLabel = useAspect
    ? `${Math.round(aspectFrame.width)} × ${Math.round(aspectFrame.height)}px`
    : null;

  const imgTransform = useAspect
    ? flipTransform || undefined
    : [
        quarter || deg
          ? `rotate(${deg}deg)`
          : "",
        flipTransform,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <div
        className="overflow-hidden rounded border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center transition-[width,height] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: frameW, height: frameH }}
      >
        {loading ? (
          <div
            className="h-full w-full animate-pulse bg-[var(--line)] motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className={
              useAspect
                ? "h-full w-full object-cover transition-transform duration-200 ease-out motion-reduce:transition-none"
                : "object-contain transition-transform duration-200 ease-out motion-reduce:transition-none"
            }
            style={
              useAspect
                ? imgTransform
                  ? { transform: imgTransform }
                  : undefined
                : quarter
                  ? {
                      width: THUMB_SHORT,
                      height: THUMB_LONG,
                      transform: imgTransform,
                    }
                  : {
                      width: "100%",
                      height: "100%",
                      transform: imgTransform,
                    }
            }
          />
        ) : (
          <FileIcon className="h-5 w-5 text-[var(--muted)]" />
        )}
      </div>
      {dimLabel && (
        <span className="max-w-[4.5rem] truncate text-center text-[9px] tabular-nums text-[var(--muted)] leading-tight">
          {dimLabel}
        </span>
      )}
    </div>
  );
}

export default function BatchUploader({
  accept,
  processFile,
  processCombined,
  onClear,
  thumbnailRotateDeg = 0,
  thumbnailAspect = null,
  thumbnailFlip = null,
  onFilesChange,
  estimateOutputSize,
  estimateKey,
  onSelectFile,
  selectedFileId = null,
}: BatchUploaderProps) {
  const labels = useBatchLabels();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [folderSupported, setFolderSupported] = useState(false);
  const [combinedOutput, setCombinedOutput] = useState<BatchOutput | null>(null);
  const dragDepth = useRef(0);
  const combineMode = Boolean(processCombined);
  const filesRef = useRef(files);
  filesRef.current = files;
  const thumbInFlight = useRef(new Set<string>());
  const thumbActiveCount = useRef(0);
  const thumbWaitQueue = useRef<Array<() => void>>([]);
  const estimateGenRef = useRef(0);
  const estimateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const estimateFnRef = useRef(estimateOutputSize);
  estimateFnRef.current = estimateOutputSize;

  const acquireThumbSlot = useCallback((): Promise<void> => {
    if (thumbActiveCount.current < PDF_THUMB_CONCURRENCY) {
      thumbActiveCount.current += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      thumbWaitQueue.current.push(() => {
        thumbActiveCount.current += 1;
        resolve();
      });
    });
  }, []);

  const releaseThumbSlot = useCallback(() => {
    thumbActiveCount.current = Math.max(0, thumbActiveCount.current - 1);
    const next = thumbWaitQueue.current.shift();
    if (next) next();
  }, []);

  const startPdfThumbnail = useCallback(
    (id: string, file: File) => {
      if (thumbInFlight.current.has(id)) return;
      thumbInFlight.current.add(id);

      void (async () => {
        await acquireThumbSlot();
        try {
          // Lazy-load pdf.js helpers only when a PDF preview is needed.
          // Use ephemeral render so we never destroy the shared doc cache
          // that live tool previews (e.g. watermark) rely on.
          const { renderPdfPageThumbEphemeral } = await import("@/lib/pdf/thumbnails");
          const url = await renderPdfPageThumbEphemeral(file, 0, {
            scale: PDF_THUMB_SCALE,
          });
          setFiles((prev) => {
            if (!prev.some((f) => f.id === id)) return prev;
            return prev.map((f) =>
              f.id === id
                ? { ...f, thumbnailUrl: url, thumbnailLoading: false }
                : f
            );
          });
        } catch {
          // Encrypted / corrupt PDFs: keep generic icon; processing errors stay separate.
          setFiles((prev) => {
            if (!prev.some((f) => f.id === id)) return prev;
            return prev.map((f) =>
              f.id === id ? { ...f, thumbnailLoading: false } : f
            );
          });
        } finally {
          releaseThumbSlot();
          thumbInFlight.current.delete(id);
        }
      })();
    },
    [acquireThumbSlot, releaseThumbSlot]
  );

  // Check webkitdirectory support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const input = document.createElement("input");
      setFolderSupported("webkitdirectory" in input);
    }
  }, []);

  // Revoke blob thumbnails only on unmount (per-remove/clear already revoke).
  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => revokeThumbUrl(f.thumbnailUrl));
    };
  }, []);

  // Notify parent only when the file identity list changes — not on thumbnail
  // progress updates (those rewrite `files` and would spam parent setState).
  const filesIdentityKey = files
    .map((f) => `${f.file.name}:${f.file.size}:${f.file.lastModified}`)
    .join("\0");
  const onFilesChangeRef = useRef(onFilesChange);
  onFilesChangeRef.current = onFilesChange;
  const prevFilesIdentityKey = useRef<string | null>(null);

  useEffect(() => {
    if (prevFilesIdentityKey.current === filesIdentityKey) return;
    prevFilesIdentityKey.current = filesIdentityKey;
    onFilesChangeRef.current?.(files.map((f) => f.file));
  }, [files, filesIdentityKey]);

  // Live output-size estimates (compress-image quality preview, etc.).
  // Debounced + idle-chunked so slider drag stays smooth; independent of Process All.
  // Function identity is read via ref — only estimateKey / file list should re-trigger.
  const hasSizeEstimator = Boolean(estimateOutputSize);
  useEffect(() => {
    if (!hasSizeEstimator) return;

    setFiles((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((f) => {
        if (f.estimateStale) return f;
        changed = true;
        return { ...f, estimateStale: true };
      });
      return changed ? next : prev;
    });

    if (estimateDebounceRef.current) clearTimeout(estimateDebounceRef.current);

    estimateDebounceRef.current = setTimeout(() => {
      const gen = ++estimateGenRef.current;
      const snapshot = filesRef.current.map((f) => ({ id: f.id, file: f.file }));

      void (async () => {
        for (const item of snapshot) {
          if (gen !== estimateGenRef.current) return;
          if (!filesRef.current.some((f) => f.id === item.id)) continue;

          const estimateFn = estimateFnRef.current;
          if (!estimateFn) return;

          try {
            const bytes = await estimateFn(item.file);
            if (gen !== estimateGenRef.current) return;
            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? { ...f, estimatedBytes: bytes, estimateStale: false }
                  : f
              )
            );
          } catch {
            if (gen !== estimateGenRef.current) return;
            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, estimateStale: false } : f
              )
            );
          }

          await yieldForEstimate();
        }
      })();
    }, ESTIMATE_DEBOUNCE_MS);

    return () => {
      if (estimateDebounceRef.current) clearTimeout(estimateDebounceRef.current);
      estimateGenRef.current += 1;
    };
  }, [hasSizeEstimator, estimateKey, filesIdentityKey]);

  const addFilesToList = useCallback(
    (newFiles: File[]) => {
      let skipped = 0;
      const validFiles: BatchFile[] = [];

      newFiles.forEach((file) => {
        if (isAccepted(file, accept)) {
          const isImage = file.type.startsWith("image/");
          const isPdf = isPdfFile(file);
          validFiles.push({
            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
            file,
            status: "queued",
            progress: 0,
            thumbnailUrl: isImage ? URL.createObjectURL(file) : undefined,
            thumbnailLoading: isPdf,
          });
        } else {
          skipped++;
        }
      });

      if (skipped > 0) {
        setSkippedCount((prev) => prev + skipped);
      }

      if (validFiles.length === 0) return;

      setCombinedOutput(null);
      setFiles((prev) => {
        // New files invalidate a prior combined result — re-queue finished items.
        const resetPrev = combineMode
          ? prev.map((f) =>
              f.status === "done"
                ? { ...f, status: "queued" as const, progress: 0 }
                : f
            )
          : prev;
        return [...resetPrev, ...validFiles];
      });

      validFiles.forEach((item) => {
        if (item.thumbnailLoading) {
          startPdfThumbnail(item.id, item.file);
        }
      });

      // Auto-select first new file when nothing is selected (resize preview, etc.).
      if (onSelectFile && !selectedFileId) {
        onSelectFile(validFiles[0].file, validFiles[0].id);
      }
    },
    [accept, combineMode, startPdfThumbnail, onSelectFile, selectedFileId]
  );

  // Read folder recursively
  const traverseEntry = async (entry: any): Promise<File[]> => {
    const filesAcc: File[] = [];

    const readEntries = (reader: any): Promise<any[]> => {
      return new Promise((resolve) => {
        const results: any[] = [];
        const read = () => {
          reader.readEntries(
            (entries: any[]) => {
              if (entries.length === 0) {
                resolve(results);
              } else {
                results.push(...entries);
                read();
              }
            },
            () => resolve(results)
          );
        };
        read();
      });
    };

    const process = async (item: any) => {
      if (item.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
          item.file(resolve, reject);
        });
        filesAcc.push(file);
      } else if (item.isDirectory) {
        const reader = item.createReader();
        const childEntries = await readEntries(reader);
        for (const child of childEntries) {
          await process(child);
        }
      }
    };

    await process(entry);
    return filesAcc;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragDepth.current = 0;

    const items = Array.from(e.dataTransfer.items || []);
    const fileList: File[] = [];

    const promises = items.map(async (item) => {
      if (item.kind === "file") {
        if (typeof item.webkitGetAsEntry === "function") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            const folderFiles = await traverseEntry(entry);
            fileList.push(...folderFiles);
            return;
          }
        }
        const file = item.getAsFile();
        if (file) fileList.push(file);
      }
    });

    await Promise.all(promises);
    addFilesToList(fileList);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current++;
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current--;
    if (dragDepth.current === 0) {
      setDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFilesToList(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();
  const triggerFolderSelect = () => folderInputRef.current?.click();

  const removeFile = (id: string) => {
    setCombinedOutput(null);
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      revokeThumbUrl(fileToRemove?.thumbnailUrl);
      const next = prev
        .filter((f) => f.id !== id)
        .map((f) =>
          combineMode && f.status === "done"
            ? { ...f, status: "queued" as const, progress: 0 }
            : f
        );

      if (onSelectFile && selectedFileId === id) {
        const fallback = next[0];
        // Defer so we don't setState in another component during this updater.
        queueMicrotask(() => {
          if (fallback) onSelectFile(fallback.file, fallback.id);
          else onSelectFile(null, null);
        });
      }

      return next;
    });
  };

  const clearAll = () => {
    files.forEach((f) => revokeThumbUrl(f.thumbnailUrl));
    setFiles([]);
    setSkippedCount(0);
    setCombinedOutput(null);
    onSelectFile?.(null, null);
    if (onClear) onClear();
  };

  const runCombined = async () => {
    if (!processCombined) return;
    const ordered = files.slice();
    if (ordered.length === 0) return;

    setProcessing(true);
    setCombinedOutput(null);
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        status: "processing" as const,
        progress: 0,
        error: undefined,
        outputs: undefined,
      }))
    );

    try {
      const output = await processCombined(
        ordered.map((f) => f.file),
        (pct) => {
          setFiles((prev) =>
            prev.map((f) => ({ ...f, progress: pct, status: "processing" }))
          );
        }
      );

      setCombinedOutput(output);
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "done" as const,
          progress: 100,
        }))
      );
      downloadBlob(output.blob, output.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as const,
          error: message,
        }))
      );
    } finally {
      setProcessing(false);
    }
  };

  const runQueue = async () => {
    if (combineMode) {
      await runCombined();
      return;
    }
    if (!processFile) return;

    const toProcess = files.filter(
      (f) => f.status === "queued" || f.status === "error"
    );
    if (toProcess.length === 0) return;

    setProcessing(true);

    let activeIndex = 0;
    const worker = async () => {
      while (activeIndex < toProcess.length) {
        const itemIdx = activeIndex++;
        const item = toProcess[itemIdx];

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "processing", progress: 0 } : f
          )
        );

        try {
          const res = await processFile(item.file, (pct) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress: pct } : f))
            );
          });

          const outputs = Array.isArray(res) ? res : [res];

          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: "done", progress: 100, outputs }
                : f
            )
          );
        } catch (err: any) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: "error", error: err?.message || "Error" }
                : f
            )
          );
        }
      }
    };

    // Concurrency limit: max 2 parallel tasks
    const concurrency = Math.min(2, toProcess.length);
    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    setProcessing(false);
  };

  const downloadOne = (item: BatchFile) => {
    if (!item.outputs || item.outputs.length === 0) return;
    item.outputs.forEach((out) => {
      downloadBlob(out.blob, out.name);
    });
  };

  const downloadZip = async () => {
    const completed = files.filter((f) => f.status === "done" && f.outputs);
    if (completed.length === 0) return;

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const usedNames = new Set<string>();

      completed.forEach((item) => {
        item.outputs?.forEach((out) => {
          let uniqueName = out.name;
          let counter = 1;
          const extIdx = uniqueName.lastIndexOf(".");
          const ext = extIdx !== -1 ? uniqueName.slice(extIdx) : "";
          const base = extIdx !== -1 ? uniqueName.slice(0, extIdx) : uniqueName;

          while (usedNames.has(uniqueName.toLowerCase())) {
            uniqueName = `${base} (${counter})${ext}`;
            counter++;
          }
          usedNames.add(uniqueName.toLowerCase());
          zip.file(uniqueName, out.blob);
        });
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "processed-files.zip");
    } catch (err) {
      console.error("ZIP Generation failed", err);
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;
  const hasOutputs = combineMode ? Boolean(combinedOutput) : doneCount > 0;
  const canProcess = combineMode
    ? files.length > 0 && !processing
    : !processing && files.some((f) => f.status === "queued" || f.status === "error");
  const overallPct =
    files.length === 0
      ? 0
      : Math.round(
          files.reduce((sum, f) => {
            if (f.status === "done") return sum + 100;
            if (f.status === "processing") return sum + f.progress;
            return sum;
          }, 0) / files.length
        );

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-2))]"
            : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)]"
        }`}
      >
        <Upload className="h-10 w-10 text-[var(--muted)]" />
        <p className="mt-3 text-sm font-medium text-[var(--text)] text-center">
          {labels.dropMultipleOrFolder}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={triggerFileSelect}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            disabled={processing}
          >
            <Upload className="h-3.5 w-3.5" />
            {labels.selectFiles}
          </button>
          {folderSupported && (
            <button
              type="button"
              onClick={triggerFolderSelect}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              disabled={processing}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              {labels.selectFolder}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={processing}
        />
        {folderSupported && (
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory=""
            // @ts-ignore
            directory=""
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            disabled={processing}
          />
        )}
      </div>

      {/* Warning/Skipped notification */}
      {skippedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-2.5 text-xs text-yellow-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{labels.skippedFiles(skippedCount)}</span>
          <button
            type="button"
            onClick={() => setSkippedCount(0)}
            className="ml-auto text-yellow-500 hover:text-yellow-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Overall batch progress */}
      {processing && files.length > 0 && (
        <ProgressIndicator label={labels.processing} value={overallPct} />
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
          <div className="border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5 flex items-center justify-between text-xs text-[var(--muted)] font-medium">
            <span>
              {labels.progress(doneCount, files.length)}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="hover:text-[var(--text)] transition-colors flex items-center gap-1"
              disabled={processing}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {labels.clearAll}
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto divide-y divide-[var(--line)]">
            {files.map((item) => {
              const selectable = Boolean(onSelectFile);
              const selected = selectable && selectedFileId === item.id;
              return (
              <div
                key={item.id}
                role={selectable ? "button" : undefined}
                tabIndex={selectable ? 0 : undefined}
                onClick={
                  selectable
                    ? () => onSelectFile?.(item.file, item.id)
                    : undefined
                }
                onKeyDown={
                  selectable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectFile?.(item.file, item.id);
                        }
                      }
                    : undefined
                }
                className={[
                  "p-3 text-sm transition-colors",
                  selectable
                    ? "cursor-pointer hover:bg-[var(--surface-2)]/80"
                    : "hover:bg-[var(--surface-2)]/50",
                  selected
                    ? "bg-[var(--cat-image)]/10 ring-1 ring-inset ring-[var(--cat-image)]/40"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  {/* File Thumbnail or Icon */}
                  <BatchThumbPreview
                    loading={Boolean(item.thumbnailLoading)}
                    url={item.thumbnailUrl}
                    rotateDeg={thumbnailRotateDeg}
                    aspectFrame={thumbnailAspect}
                    flip={thumbnailFlip}
                  />

                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--text)] text-xs">
                      {item.file.name}
                    </p>
                    {estimateOutputSize ? (
                      <SizeEstimateLine
                        original={item.file.size}
                        estimated={item.estimatedBytes}
                        stale={item.estimateStale}
                        calculatingLabel={labels.estimatingSize}
                      />
                    ) : (
                      <p className="text-[10px] text-[var(--muted)]">
                        {formatBytes(item.file.size)}
                      </p>
                    )}
                  </div>

                  {/* Status Indicator / Progress */}
                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === "queued" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                        {labels.statusQueued}
                      </span>
                    )}
                    {item.status === "processing" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--accent)] font-medium flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {labels.statusProcessing} ({item.progress}%)
                        </span>
                      </div>
                    )}
                    {item.status === "done" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {labels.statusDone}
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        {labels.statusError}
                      </span>
                    )}

                    {/* Action Buttons — per-file download only in independent mode */}
                    {!combineMode && item.status === "done" && item.outputs && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadOne(item);
                        }}
                        title={labels.downloadFile}
                        className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded hover:bg-[var(--surface-2)] transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(item.id);
                      }}
                      className="p-1 text-[var(--muted)] hover:text-red-500 rounded hover:bg-[var(--surface-2)] transition-colors"
                      disabled={processing}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Visible error text — not tooltip-only (mobile / discoverability) */}
                {item.status === "error" && item.error && (
                  <p
                    className="mt-2 text-xs leading-snug text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {item.error}
                  </p>
                )}
              </div>
              );
            })}
          </div>

          {/* Action buttons footer */}
          <div className="border-t border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
            <button
              type="button"
              onClick={runQueue}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
              disabled={!canProcess}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {labels.processing}
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {labels.processAll}
                </>
              )}
            </button>

            {hasOutputs && !combineMode && (
              <button
                type="button"
                onClick={downloadZip}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                {labels.downloadZip}
              </button>
            )}

            {hasOutputs && combineMode && combinedOutput && (
              <button
                type="button"
                onClick={() =>
                  downloadBlob(combinedOutput.blob, combinedOutput.name)
                }
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                {labels.downloadFile}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
