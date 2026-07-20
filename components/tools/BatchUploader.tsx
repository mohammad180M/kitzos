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
  thumbnailUrl?: string;
}

export interface BatchUploaderProps {
  accept: string;
  processFile: (
    file: File,
    onProgress?: (pct: number) => void
  ) => Promise<BatchOutput | BatchOutput[]>;
  onClear?: () => void;
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

export default function BatchUploader({
  accept,
  processFile,
  onClear,
}: BatchUploaderProps) {
  const labels = useBatchLabels();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [folderSupported, setFolderSupported] = useState(false);
  const dragDepth = useRef(0);

  // Check webkitdirectory support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const input = document.createElement("input");
      setFolderSupported("webkitdirectory" in input);
    }
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.thumbnailUrl) URL.revokeObjectURL(f.thumbnailUrl);
      });
    };
  }, [files]);

  const addFilesToList = useCallback(
    (newFiles: File[]) => {
      let skipped = 0;
      const validFiles: BatchFile[] = [];

      newFiles.forEach((file) => {
        if (isAccepted(file, accept)) {
          const isImage = file.type.startsWith("image/");
          validFiles.push({
            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
            file,
            status: "queued",
            progress: 0,
            thumbnailUrl: isImage ? URL.createObjectURL(file) : undefined,
          });
        } else {
          skipped++;
        }
      });

      if (skipped > 0) {
        setSkippedCount((prev) => prev + skipped);
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [accept]
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
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.thumbnailUrl) {
        URL.revokeObjectURL(fileToRemove.thumbnailUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.thumbnailUrl) URL.revokeObjectURL(f.thumbnailUrl);
    });
    setFiles([]);
    setSkippedCount(0);
    if (onClear) onClear();
  };

  const runQueue = async () => {
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
  const hasOutputs = doneCount > 0;

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
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 text-sm hover:bg-[var(--surface-2)]/50 transition-colors"
              >
                {/* File Thumbnail or Icon */}
                <div className="h-10 w-10 shrink-0 rounded border border-[var(--line)] bg-[var(--surface-2)] overflow-hidden flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileIcon className="h-5 w-5 text-[var(--muted)]" />
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text)] text-xs">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {formatBytes(item.file.size)}
                  </p>
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
                    <span
                      title={item.error}
                      className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 cursor-help"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {labels.statusError}
                    </span>
                  )}

                  {/* Action Buttons */}
                  {item.status === "done" && item.outputs && (
                    <button
                      type="button"
                      onClick={() => downloadOne(item)}
                      title={labels.downloadFile}
                      className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="p-1 text-[var(--muted)] hover:text-red-500 rounded hover:bg-[var(--surface-2)] transition-colors"
                    disabled={processing}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons footer */}
          <div className="border-t border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
            <button
              type="button"
              onClick={runQueue}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
              disabled={processing || files.every((f) => f.status === "done")}
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

            {hasOutputs && (
              <button
                type="button"
                onClick={downloadZip}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                {labels.downloadZip}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
