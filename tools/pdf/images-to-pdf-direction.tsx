"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  Download,
  GripVertical,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import PdfPreviewPane, { type PreviewPage } from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import { renderImagePdfPagePreview } from "@/lib/pdf/image-page-preview";
import { pdfBytesToBlob } from "@/lib/pdf/bytes";

function loadPdfLib() {
  return import("pdf-lib");
}

let pdfLibPromise: ReturnType<typeof loadPdfLib> | undefined;

function getPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = loadPdfLib();
  return pdfLibPromise;
}

type PageSize = "a4" | "letter" | "fit";
type Orientation = "auto" | "portrait" | "landscape";
type Margin = "none" | "small" | "normal";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
}

const A4 = { width: 595.28, height: 841.89 };
const LETTER = { width: 612, height: 792 };
const MARGIN_PT: Record<Margin, number> = { none: 0, small: 18, normal: 36 };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return (
    file.type.startsWith("image/") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")
  );
}

async function loadImageDimensions(
  file: File
): Promise<{ width: number; height: number; embedBytes: Uint8Array; isPng: boolean }> {
  if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported.");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("WebP conversion failed."))), "image/jpeg", 0.92);
    });
    const embedBytes = new Uint8Array(await blob.arrayBuffer());
    return { width: canvas.width, height: canvas.height, embedBytes, isPng: false };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = document.createElement("img");
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image load failed."));
      el.src = url;
    });
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const embedBytes = new Uint8Array(await file.arrayBuffer());
    return { width: img.naturalWidth, height: img.naturalHeight, embedBytes, isPng };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function resolvePageDimensions(
  pageSize: PageSize,
  imageW: number,
  imageH: number,
  orientation: Orientation
): { width: number; height: number } {
  if (pageSize === "fit") {
    return { width: imageW, height: imageH };
  }

  const base = pageSize === "a4" ? A4 : LETTER;
  let width = base.width;
  let height = base.height;

  const landscape =
    orientation === "landscape" || (orientation === "auto" && imageW > imageH);

  if (landscape) {
    width = base.height;
    height = base.width;
  }

  return { width, height };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ImagesToPdfDirectionProps {
  onDirtyChange: (dirty: boolean) => void;
}

export default function ImagesToPdfDirection({ onDirtyChange }: ImagesToPdfDirectionProps) {
  const t = usePdfToolLabels("pdfToJpg");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<Margin>("small");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => {
    onDirtyChange(images.length > 0);
  }, [images.length, onDirtyChange]);

  useEffect(() => {
    return () => {
      previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const addImages = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      const valid = Array.from(newFiles).filter(isImageFile);
      if (valid.length === 0) {
        setError(t.errInvalidFiles);
        return;
      }

      const items: ImageItem[] = valid.map((file) => {
        const preview = URL.createObjectURL(file);
        previewUrls.current.push(preview);
        return {
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          preview,
        };
      });

      setImages((prev) => [...prev, ...items]);
    },
    [t.errInvalidFiles]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) addImages(e.dataTransfer.files);
    },
    [addImages]
  );

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        previewUrls.current = previewUrls.current.filter((u) => u !== item.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
    setError(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropReorder = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const createPdf = async () => {
    if (images.length === 0) {
      setError(t.errNeedOne);
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const { PDFDocument } = await getPdfLib();
      const pdf = await PDFDocument.create();
      const marginPt = MARGIN_PT[margin];

      for (const item of images) {
        const { width: imgW, height: imgH, embedBytes, isPng } = await loadImageDimensions(item.file);
        const { width: pageW, height: pageH } = resolvePageDimensions(pageSize, imgW, imgH, orientation);
        const page = pdf.addPage([pageW, pageH]);
        const image = isPng ? await pdf.embedPng(embedBytes) : await pdf.embedJpg(embedBytes);

        const maxW = pageW - marginPt * 2;
        const maxH = pageH - marginPt * 2;
        const scale = Math.min(maxW / imgW, maxH / imgH, 1);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;

        page.drawImage(image, { x, y, width: drawW, height: drawH });
      }

      const bytes = await pdf.save();
      downloadBlob(pdfBytesToBlob(bytes), "images.pdf");
    } catch {
      setError(t.errCreateFailed);
    } finally {
      setCreating(false);
    }
  };

  const previewOpts = useMemo(
    () => ({ pageSize, orientation, margin }),
    [pageSize, orientation, margin]
  );

  const previewPages = useMemo((): PreviewPage[] => {
    return images.map((img, i) => ({
      id: img.id,
      label: String(i + 1),
      render: () => renderImagePdfPagePreview(img.file, previewOpts),
    }));
  }, [images, previewOpts]);

  const controls = (
    <>
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-primary-500 dark:hover:bg-primary-950/30"
      >
        <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t.dropHint}</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t.multipleSupported}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addImages(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="page-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.pageSize}
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as PageSize)}
              className="input-field mt-1"
            >
              <option value="a4">{t.sizeA4}</option>
              <option value="letter">{t.sizeLetter}</option>
              <option value="fit">{t.sizeFit}</option>
            </select>
          </div>
          <div>
            <label htmlFor="orientation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.orientation}
            </label>
            <select
              id="orientation"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
              className="input-field mt-1"
            >
              <option value="auto">{t.orientAuto}</option>
              <option value="portrait">{t.orientPortrait}</option>
              <option value="landscape">{t.orientLandscape}</option>
            </select>
          </div>
          <div>
            <label htmlFor="margin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.margin}
            </label>
            <select
              id="margin"
              value={margin}
              onChange={(e) => setMargin(e.target.value as Margin)}
              className="input-field mt-1"
            >
              <option value="none">{t.marginNone}</option>
              <option value="small">{t.marginSmall}</option>
              <option value="normal">{t.marginNormal}</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="space-y-2" aria-label={t.imagesListAria}>
          {images.map((img, index) => (
            <li
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDropReorder(e, index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 dark:bg-gray-800 ${
                dragOverIndex === index
                  ? "border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-950/40"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <img src={img.preview} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{img.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatBytes(img.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:text-gray-500 dark:hover:bg-gray-700"
                aria-label={t.removeFile(img.name)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={createPdf}
        disabled={creating || images.length === 0}
        className="btn-primary w-full sm:w-auto"
      >
        {creating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.creating}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {t.createPdf}
          </>
        )}
      </button>
    </>
  );

  return (
    <PdfWorkbenchLayout
      active={images.length > 0}
      controls={controls}
      preview={
        images.length > 0 ? (
          <PdfPreviewPane pages={previewPages} totalCount={images.length} singleColumn={images.length === 1} />
        ) : null
      }
    />
  );
}
