"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Download, Loader2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import UnsavedWorkDialog from "@/components/UnsavedWorkDialog";
import WatermarkFontPicker from "@/components/pdf/WatermarkFontPicker";
import PdfPreviewPane from "@/components/pdf/PdfPreviewPane";
import PdfWorkbenchLayout from "@/components/pdf/PdfWorkbenchLayout";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePdfToolLabels } from "@/lib/i18n/use-pdf-tool-labels";
import {
  applyPdfWatermark,
  prepareLogoBytes,
} from "@/lib/pdf/apply-pdf-watermark";
import { downloadBlob } from "@/lib/download";
import { renderWatermarkPreview } from "@/lib/pdf/preview-render";
import {
  getPdfPageCount,
  loadPdfDocument,
  releasePdfDocument,
} from "@/lib/pdf/thumbnails";
import {
  containsArabicScript,
  defaultWatermarkFontId,
} from "@/lib/pdf/watermark-fonts";
import { ensureWatermarkFontById } from "@/lib/pdf/watermark-font-loader";
import {
  DEFAULT_WATERMARK_PLACEMENT,
  clamp01,
  type WatermarkPlacement,
} from "@/lib/pdf/watermark-geometry";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useUnsavedWork } from "@/lib/unsaved-work";

type Mode = "text" | "image";

export default function PdfWatermark() {
  const t = usePdfToolLabels("pdfWatermark");
  const { locale, dir, t: dict } = useLocale();
  const fileRef = useRef<File | null>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const [mode, setMode] = useState<Mode>("text");
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [modeDialog, setModeDialog] = useState(false);

  const [text, setText] = useState("CONFIDENTIAL");
  const [fontId, setFontId] = useState(() => defaultWatermarkFontId(locale));
  /** Unrotated text width ÷ page width (not font-size ratio). */
  const [widthRatio, setWidthRatio] = useState(0.35);
  const [imageWidthRatio, setImageWidthRatio] = useState(0.35);
  const [placement, setPlacement] = useState<WatermarkPlacement>(DEFAULT_WATERMARK_PLACEMENT);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoIntrinsic, setLogoIntrinsic] = useState({ w: 1, h: 1 });
  const [logoBytes, setLogoBytes] = useState<Uint8Array | null>(null);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const debouncedText = useDebouncedValue(text, 250);
  const debouncedSize = useDebouncedValue(widthRatio, 250);
  const debouncedImgSize = useDebouncedValue(imageWidthRatio, 250);
  const debouncedPlacement = useDebouncedValue(placement, 250);
  const debouncedFont = useDebouncedValue(fontId, 200);

  const dirty =
    file !== null ||
    logoFile !== null ||
    text !== "CONFIDENTIAL" ||
    placement.tiled ||
    placement.opacity !== DEFAULT_WATERMARK_PLACEMENT.opacity;

  useUnsavedWork(dirty);

  useEffect(() => {
    setFontId(defaultWatermarkFontId(locale));
  }, [locale]);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    return () => {
      if (fileRef.current) releasePdfDocument(fileRef.current);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  useEffect(() => {
    if (!file) {
      setPreviewSrc(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        if (mode === "text") {
          await ensureWatermarkFontById(debouncedFont);
          const url = await renderWatermarkPreview(file, previewPage - 1, debouncedPlacement, {
            mode: "text",
            text: {
              text: debouncedText,
              fontId: debouncedFont,
              widthRatio: debouncedSize,
            },
          });
          if (!cancelled) setPreviewSrc(url);
        } else if (logoUrl) {
          const url = await renderWatermarkPreview(file, previewPage - 1, debouncedPlacement, {
            mode: "image",
            image: {
              src: logoUrl,
              widthRatio: debouncedImgSize,
              intrinsicW: logoIntrinsic.w,
              intrinsicH: logoIntrinsic.h,
            },
          });
          if (!cancelled) setPreviewSrc(url);
        } else if (!cancelled) {
          setPreviewSrc(null);
        }
      } catch {
        if (!cancelled) setPreviewSrc(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    file,
    previewPage,
    mode,
    debouncedText,
    debouncedFont,
    debouncedSize,
    debouncedPlacement,
    debouncedImgSize,
    logoUrl,
    logoIntrinsic,
  ]);

  const onFile = async (f: File) => {
    if (file) releasePdfDocument(file);
    setFile(f);
    setError(null);
    try {
      const count = await getPdfPageCount(f);
      await loadPdfDocument(f);
      setPageCount(count);
      setPreviewPage(1);
    } catch {
      setPageCount(0);
    }
  };

  const resetStampSettings = () => {
    setText("CONFIDENTIAL");
    setFontId(defaultWatermarkFontId(locale));
    setWidthRatio(0.35);
    setImageWidthRatio(0.35);
    setPlacement(DEFAULT_WATERMARK_PLACEMENT);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
    setLogoFile(null);
    setLogoBytes(null);
    setLogoIntrinsic({ w: 1, h: 1 });
  };

  const requestMode = (next: Mode) => {
    if (next === mode) return;
    const hasStampWork =
      (mode === "text" && (text.trim().length > 0 || placement.tiled)) ||
      (mode === "image" && logoFile !== null);
    if (hasStampWork) {
      setPendingMode(next);
      setModeDialog(true);
      return;
    }
    setMode(next);
  };

  const onLogo = async (list: FileList) => {
    const f = list[0];
    if (!f) return;
    setError(null);
    try {
      const prepared = await prepareLogoBytes(f);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      const pngCopy = new Uint8Array(prepared.bytes);
      const url = URL.createObjectURL(new Blob([pngCopy], { type: "image/png" }));
      setLogoFile(f);
      setLogoUrl(url);
      setLogoBytes(pngCopy);
      setLogoIntrinsic({ w: prepared.width, h: prepared.height });
    } catch {
      setError(t.errImageInvalid);
    }
  };

  const onPreviewPointer = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (placement.tiled || !previewBoxRef.current || !previewSrc) return;
      const rect = previewBoxRef.current.getBoundingClientRect();
      const x = clamp01((e.clientX - rect.left) / rect.width);
      const y = clamp01((e.clientY - rect.top) / rect.height);
      setPlacement((p) => ({ ...p, centerXRatio: x, centerYRatio: y }));
    },
    [placement.tiled, previewSrc]
  );

  const apply = async () => {
    if (!file) return;
    if (mode === "text" && containsArabicScript(text)) {
      const { getWatermarkFont } = await import("@/lib/pdf/watermark-fonts");
      if (!getWatermarkFont(fontId).arabic) {
        setError(t.arabicFontRequired);
        return;
      }
    }
    if (mode === "image" && !logoBytes) {
      setError(t.errNeedImage);
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      if (mode === "text") await ensureWatermarkFontById(fontId);
      const blob = await applyPdfWatermark(file, {
        mode,
        placement,
        text:
          mode === "text"
            ? {
                text,
                widthRatio,
                fontId,
                color: "#808080",
              }
            : undefined,
        imageBytes: mode === "image" ? logoBytes! : undefined,
        imageMeta:
          mode === "image"
            ? {
                widthRatio: imageWidthRatio,
                intrinsicW: logoIntrinsic.w,
                intrinsicH: logoIntrinsic.h,
              }
            : undefined,
      });
      downloadBlob(blob, `watermarked-${file.name}`);
    } catch {
      setError(t.errWatermarkFailed);
    } finally {
      setProcessing(false);
    }
  };

  const controls = (
    <>
      <FileDropZone
        accept="application/pdf"
        label={file ? file.name : t.uploadPdf}
        onFiles={(files) => {
          const f = files[0];
          if (f) void onFile(f);
        }}
      />

      <div>
        <p className="text-sm font-medium text-[var(--text)]">{t.stampMode}</p>
        <div className="mt-2 inline-flex rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5">
          <button
            type="button"
            onClick={() => requestMode("text")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "text"
                ? "bg-[var(--cat-pdf)] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.modeText}
          </button>
          <button
            type="button"
            onClick={() => requestMode("image")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "image"
                ? "bg-[var(--cat-pdf)] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.modeImage}
          </button>
        </div>
      </div>

      {mode === "text" ? (
        <>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">{t.watermarkText}</span>
            <input
              type="text"
              dir="auto"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input-field mt-1"
            />
          </label>

          <WatermarkFontPicker
            value={fontId}
            onChange={setFontId}
            locale={locale}
            watermarkText={text}
            label={t.fontLabel}
            arabicGroupLabel={t.fontGroupArabic}
            otherGroupLabel={t.fontGroupOther}
            arabicWarning={t.arabicFontWarning}
          />

          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">
              {t.sizePercentLabel(Math.round(widthRatio * 100))}
            </span>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.01}
              value={widthRatio}
              onChange={(e) => setWidthRatio(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--accent)]"
            />
          </label>
        </>
      ) : (
        <>
          <FileDropZone
            accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
            compact
            label={logoFile ? logoFile.name : t.uploadLogo}
            hint={t.logoFormats}
            onFiles={(list) => void onLogo(list)}
          />
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">
              {t.imageSizeLabel(Math.round(imageWidthRatio * 100))}
            </span>
            <input
              type="range"
              min={0.08}
              max={0.8}
              step={0.01}
              value={imageWidthRatio}
              onChange={(e) => setImageWidthRatio(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--accent)]"
            />
          </label>
        </>
      )}

      <label className="block text-sm">
        <span className="font-medium text-[var(--text)]">
          {t.opacityLabel(Math.round(placement.opacity * 100))}
        </span>
        <input
          type="range"
          min={0.1}
          max={0.8}
          step={0.05}
          value={placement.opacity}
          onChange={(e) =>
            setPlacement((p) => ({ ...p, opacity: Number(e.target.value) }))
          }
          className="mt-1 w-full accent-[var(--accent)]"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-[var(--text)]">
          {t.rotationLabel(Math.round(placement.rotationDeg))}
        </span>
        <input
          type="range"
          min={-90}
          max={90}
          step={1}
          value={placement.rotationDeg}
          onChange={(e) =>
            setPlacement((p) => ({ ...p, rotationDeg: Number(e.target.value) }))
          }
          className="mt-1 w-full accent-[var(--accent)]"
        />
      </label>

      <div>
        <p className="text-sm font-medium text-[var(--text)]">{t.layout}</p>
        <div className="mt-2 inline-flex rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5">
          <button
            type="button"
            onClick={() => setPlacement((p) => ({ ...p, tiled: false }))}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              !placement.tiled
                ? "bg-[var(--cat-pdf)] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.single}
          </button>
          <button
            type="button"
            onClick={() => setPlacement((p) => ({ ...p, tiled: true }))}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              placement.tiled
                ? "bg-[var(--cat-pdf)] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.tiled}
          </button>
        </div>
        {!placement.tiled && (
          <p className="mt-1.5 text-xs text-[var(--muted)]">{t.dragHint}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--cat-pdf)]" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void apply()}
        disabled={!file || processing || (mode === "image" && !logoBytes)}
        className="btn-primary inline-flex items-center gap-2"
      >
        {processing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {t.applyAndDownload}
      </button>
    </>
  );

  return (
    <>
      <PdfWorkbenchLayout
        active={!!file}
        controls={controls}
        preview={
          file ? (
            <PdfPreviewPane totalCount={pageCount} singleColumn>
              <div className="space-y-3">
                {pageCount > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={previewPage <= 1}
                      onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                    <span className="text-xs text-muted">
                      {previewPage} / {pageCount}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      disabled={previewPage >= pageCount}
                      onClick={() => setPreviewPage((p) => Math.min(pageCount, p + 1))}
                    >
                      ›
                    </button>
                  </div>
                )}
                <div
                  ref={previewBoxRef}
                  onPointerDown={onPreviewPointer}
                  className={`relative overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-2 ${
                    !placement.tiled ? "cursor-crosshair" : ""
                  }`}
                >
                  {!previewSrc && (
                    <div className="pdf-preview-shimmer aspect-[3/4] w-full rounded" aria-hidden="true" />
                  )}
                  {previewSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc}
                      alt=""
                      className="mx-auto max-h-80 w-full object-contain"
                      draggable={false}
                    />
                  )}
                </div>
              </div>
            </PdfPreviewPane>
          ) : null
        }
      />

      <UnsavedWorkDialog
        open={modeDialog}
        title={dict.header.unsavedWorkTitle}
        body={t.modeSwitchConfirm}
        confirmLabel={dict.header.unsavedWorkConfirm}
        cancelLabel={dict.header.unsavedWorkCancel}
        dir={dir}
        onConfirm={() => {
          setModeDialog(false);
          if (pendingMode) {
            resetStampSettings();
            setMode(pendingMode);
          }
          setPendingMode(null);
        }}
        onCancel={() => {
          setModeDialog(false);
          setPendingMode(null);
        }}
      />
    </>
  );
}
