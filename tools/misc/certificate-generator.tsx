"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw, Upload, X } from "lucide-react";
import CertificateTemplateThumb from "@/components/CertificateTemplateThumb";
import CertificateSignatureSlot from "@/tools/misc/certificate-signature-slot";
import { setupPreviewCanvas, canvasToBlob } from "@/lib/canvas-utils";
import {
  computeElementBounds,
  drawCertificate,
  hitTestElement,
  hitTestResizeHandle,
  renderCertificateCanvas,
  resetElementLayout,
  type CertificateAssets,
  type ElementBounds,
} from "@/lib/certificate-render";
import {
  buildDefaultConfig,
  getCanvasDimensions,
  getPdfDimensions,
  getElementLayout,
  TEMPLATE_IDS,
  TEMPLATE_PRESETS,
  templateSupportsDualSignatures,
  type CertificateConfig,
  type DraggableElementId,
  type FontChoice,
  type FontSize,
  type LogoPosition,
  type Orientation,
  type PageSize,
  type SignatureSlotConfig,
  type TemplateId,
} from "@/lib/certificate-types";
import { downloadBlob } from "@/lib/download";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useUnsavedWork } from "@/lib/unsaved-work";

const EXPORT_SCALE = 2;
const RESIZE_HANDLE = 10;

type DragMode = "move" | "resize";

interface DragState {
  mode: DragMode;
  id: DraggableElementId;
  startCertX: number;
  startCertY: number;
  startDx: number;
  startDy: number;
  startScale: number;
  startW: number;
}

function certCoords(
  e: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  certW: number,
  certH: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * certW,
    y: ((e.clientY - rect.top) / rect.height) * certH,
  };
}

export default function CertificateGenerator() {
  const { t } = useLocale();
  const ui = t.certificateGenerator;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const sigLeftImageRef = useRef<HTMLImageElement | null>(null);
  const sigRightImageRef = useRef<HTMLImageElement | null>(null);
  const boundsRef = useRef<ElementBounds[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const [sigImagesReady, setSigImagesReady] = useState(0);
  const [selectedId, setSelectedId] = useState<DraggableElementId | null>(null);

  const defaults = useMemo(
    () => ({
      title: ui.defaultTitle,
      recipientName: ui.defaultRecipient,
      achievement: ui.defaultAchievement,
      description: ui.defaultDescription,
      date: ui.defaultDate,
      sigRightName: ui.defaultSignerName,
      sigRightTitle: ui.defaultSignerTitle,
    }),
    [ui]
  );

  const [config, setConfig] = useState<CertificateConfig>(() => buildDefaultConfig(defaults));
  const [fontsReady, setFontsReady] = useState(false);
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);

  useUnsavedWork(
    Boolean(config.logoDataUrl || config.sigRight.imageDataUrl || config.sigLeft.imageDataUrl) ||
      config.recipientName !== defaults.recipientName
  );

  const dualSupported = templateSupportsDualSignatures(config.templateId);

  const elementLabels: Record<DraggableElementId, string> = {
    logo: ui.elementLogo,
    seal: ui.elementSeal,
    sigRight: ui.elementSigRight,
    sigLeft: ui.elementSigLeft,
    title: ui.elementTitle,
    recipientName: ui.elementRecipientName,
    date: ui.elementDate,
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&family=Noto+Serif+Arabic:wght@400;700&family=Playfair+Display:wght@700&display=swap";
    document.head.appendChild(link);
    void Promise.all([
      document.fonts.load('700 48px "Noto Sans Arabic"'),
      document.fonts.load('700 48px "Noto Serif Arabic"'),
      document.fonts.load('700 48px "Playfair Display"'),
    ]).then(() => setFontsReady(true));
    return () => {
      link.remove();
    };
  }, []);

  useEffect(() => {
    if (!config.sigRight.imageDataUrl) {
      sigRightImageRef.current = null;
      setSigImagesReady((n) => n + 1);
      return;
    }
    const img = new Image();
    img.onload = () => {
      sigRightImageRef.current = img;
      setSigImagesReady((n) => n + 1);
    };
    img.src = config.sigRight.imageDataUrl;
  }, [config.sigRight.imageDataUrl]);

  useEffect(() => {
    if (!config.sigLeft.imageDataUrl) {
      sigLeftImageRef.current = null;
      setSigImagesReady((n) => n + 1);
      return;
    }
    const img = new Image();
    img.onload = () => {
      sigLeftImageRef.current = img;
      setSigImagesReady((n) => n + 1);
    };
    img.src = config.sigLeft.imageDataUrl;
  }, [config.sigLeft.imageDataUrl]);

  const { width, height } = getCanvasDimensions(config.pageSize, config.orientation);

  const patch = useCallback((partial: Partial<CertificateConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const patchSigRight = (partial: Partial<SignatureSlotConfig>) => {
    setConfig((prev) => ({ ...prev, sigRight: { ...prev.sigRight, ...partial } }));
  };

  const patchSigLeft = (partial: Partial<SignatureSlotConfig>) => {
    setConfig((prev) => ({ ...prev, sigLeft: { ...prev.sigLeft, ...partial } }));
  };

  const patchElementLayout = useCallback(
    (id: DraggableElementId, partial: { dx?: number; dy?: number; scale?: number }) => {
      setConfig((prev) => {
        const current = getElementLayout(prev, id);
        return {
          ...prev,
          elementLayout: {
            ...prev.elementLayout,
            [id]: { ...current, ...partial },
          },
        };
      });
    },
    []
  );

  const resetElementPosition = (id: DraggableElementId) => {
    setConfig((prev) => ({
      ...prev,
      elementLayout: resetElementLayout(prev.elementLayout, id),
    }));
    if (selectedId === id) setSelectedId(null);
  };

  const applyTemplate = (templateId: TemplateId) => {
    const preset = TEMPLATE_PRESETS[templateId];
    patch({
      templateId,
      accentColor: preset.accentColor,
      bgColor: preset.bgColor,
      textColor: preset.textColor,
      fontChoice:
        templateId === "modern-minimal" || templateId === "tech-gradient" ? "sans" : "serif",
      enableLeftSignature: templateSupportsDualSignatures(templateId)
        ? config.enableLeftSignature
        : false,
    });
  };

  const reset = () => {
    logoImageRef.current = null;
    sigLeftImageRef.current = null;
    sigRightImageRef.current = null;
    setSelectedId(null);
    setConfig(buildDefaultConfig(defaults));
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const loadLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        logoImageRef.current = img;
        patch({ logoDataUrl: dataUrl });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    logoImageRef.current = null;
    if (logoInputRef.current) logoInputRef.current.value = "";
    setConfig((prev) => ({
      ...prev,
      logoDataUrl: null,
      elementLayout: resetElementLayout(prev.elementLayout, "logo"),
    }));
    if (selectedId === "logo") setSelectedId(null);
  };

  const getAssets = (): CertificateAssets => ({
    logo: logoImageRef.current,
    sigLeft: sigLeftImageRef.current,
    sigRight: sigRightImageRef.current,
  });

  const assets = useMemo(
    () => getAssets(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.logoDataUrl, config.sigLeft.imageDataUrl, config.sigRight.imageDataUrl, sigImagesReady]
  );

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupPreviewCanvas(canvas, width, height);
    const bounds = computeElementBounds(ctx, config, width, height, assets);
    boundsRef.current = bounds;
    const editorOptions =
      selectedId != null
        ? { selectedId, selectedBounds: bounds.find((b) => b.id === selectedId) }
        : undefined;
    drawCertificate(ctx, config, width, height, assets, editorOptions);
  }, [config, width, height, assets, selectedId]);

  useEffect(() => {
    if (fontsReady) paint();
  }, [paint, fontsReady]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = certCoords(e, canvas, width, height);
    const bounds = boundsRef.current;

    if (selectedId) {
      const selectedBounds = bounds.find((b) => b.id === selectedId);
      if (hitTestResizeHandle(selectedBounds, x, y, RESIZE_HANDLE)) {
        const layout = getElementLayout(config, selectedId);
        dragRef.current = {
          mode: "resize",
          id: selectedId,
          startCertX: x,
          startCertY: y,
          startDx: layout.dx,
          startDy: layout.dy,
          startScale: layout.scale,
          startW: selectedBounds?.w ?? 1,
        };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    const hit = hitTestElement(bounds, x, y);
    if (hit) {
      setSelectedId(hit);
      const layout = getElementLayout(config, hit);
      dragRef.current = {
        mode: "move",
        id: hit,
        startCertX: x,
        startCertY: y,
        startDx: layout.dx,
        startDy: layout.dy,
        startScale: layout.scale,
        startW: bounds.find((b) => b.id === hit)?.w ?? 1,
      };
      canvas.setPointerCapture(e.pointerId);
    } else {
      setSelectedId(null);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const { x, y } = certCoords(e, canvas, width, height);

    if (drag.mode === "move") {
      const dx = drag.startDx + (x - drag.startCertX) / width;
      const dy = drag.startDy + (y - drag.startCertY) / height;
      patchElementLayout(drag.id, { dx, dy });
      return;
    }

    const selectedBounds = boundsRef.current.find((b) => b.id === drag.id);
    if (!selectedBounds) return;
    const ratio = Math.max(0.35, Math.min(2.5, (x - selectedBounds.x) / drag.startW));
    patchElementLayout(drag.id, { scale: drag.startScale * ratio });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const downloadPng = async () => {
    setExporting("png");
    try {
      const canvas = renderCertificateCanvas(config, width, height, getAssets(), EXPORT_SCALE);
      const blob = await canvasToBlob(canvas, "image/png");
      downloadBlob(blob, "certificate.png");
    } finally {
      setExporting(null);
    }
  };

  const downloadPdf = async () => {
    setExporting("pdf");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const canvas = renderCertificateCanvas(config, width, height, getAssets(), EXPORT_SCALE);
      const pngBlob = await canvasToBlob(canvas, "image/png");
      const pngBytes = await pngBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      const { width: pw, height: ph } = getPdfDimensions(config.pageSize, config.orientation);
      const page = pdfDoc.addPage([pw, ph]);
      const image = await pdfDoc.embedPng(pngBytes);
      page.drawImage(image, { x: 0, y: 0, width: pw, height: ph });
      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes as BlobPart], { type: "application/pdf" }), "certificate.pdf");
    } finally {
      setExporting(null);
    }
  };

  const templateLabels: Record<TemplateId, string> = {
    "royal-gold": ui.templateRoyalGold,
    "classic-ivory": ui.templateClassicIvory,
    "modern-minimal": ui.templateModernMinimal,
    "tech-gradient": ui.templateTechGradient,
  };

  const logoPositions: { id: LogoPosition; label: string }[] = [
    { id: "top-center", label: ui.logoTopCenter },
    { id: "top-left", label: ui.logoTopLeft },
    { id: "top-right", label: ui.logoTopRight },
    { id: "watermark", label: ui.logoWatermark },
  ];

  const slotLabels = {
    uploadSignature: ui.uploadSignature,
    drawSignature: ui.drawSignature,
    signerName: ui.signerName,
    signerTitle: ui.signerTitle,
    signatureSize: ui.signatureSize,
    signerNamePlaceholder: ui.signerNamePlaceholder,
    signerTitlePlaceholder: ui.signerTitlePlaceholder,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <fieldset>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.templates}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TEMPLATE_IDS.map((id) => (
              <CertificateTemplateThumb
                key={id}
                templateId={id}
                label={templateLabels[id]}
                active={config.templateId === id}
                defaults={defaults}
                fontsReady={fontsReady}
                onSelect={() => applyTemplate(id)}
              />
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.fieldTitle}</span>
            <input
              type="text"
              value={config.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="input-field mt-1 w-full"
              dir="auto"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.fieldRecipient}</span>
            <input
              type="text"
              value={config.recipientName}
              onChange={(e) => patch({ recipientName: e.target.value })}
              className="input-field mt-1 w-full"
              dir="auto"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.fieldAchievement}</span>
            <input
              type="text"
              value={config.achievement}
              onChange={(e) => patch({ achievement: e.target.value })}
              className="input-field mt-1 w-full"
              dir="auto"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.fieldDescription}</span>
            <textarea
              value={config.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={2}
              className="input-field mt-1 w-full"
              dir="auto"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.fieldDate}</span>
            <input
              type="text"
              value={config.date}
              onChange={(e) => patch({ date: e.target.value })}
              className="input-field mt-1 w-full"
              dir="auto"
              placeholder={ui.datePlaceholder}
            />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.signatureSection}</legend>
          {dualSupported && (
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={config.enableLeftSignature}
                onChange={(e) => patch({ enableLeftSignature: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              {ui.enableLeftSignature}
            </label>
          )}
          <div className="mt-3 space-y-4">
            {config.enableLeftSignature && dualSupported && (
              <div>
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{ui.leftSignature}</p>
                <CertificateSignatureSlot slot={config.sigLeft} labels={slotLabels} onChange={patchSigLeft} />
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{ui.rightSignature}</p>
              <CertificateSignatureSlot slot={config.sigRight} labels={slotLabels} onChange={patchSigRight} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.logoSection}</legend>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadLogo(f);
            }}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {ui.uploadLogo}
            </button>
            {config.logoDataUrl && (
              <button
                type="button"
                onClick={removeLogo}
                className="btn-secondary inline-flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <X className="h-4 w-4" />
                {ui.removeLogo}
              </button>
            )}
          </div>
          {config.logoDataUrl && (
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-xs text-gray-500 dark:text-gray-400">{ui.logoWidth}</span>
                <input
                  type="range"
                  min={40}
                  max={280}
                  value={config.logoWidth}
                  onChange={(e) => patch({ logoWidth: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-500 dark:text-gray-400">{ui.logoOpacity}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.logoOpacity}
                  onChange={(e) => patch({ logoOpacity: Number(e.target.value) })}

                  className="mt-1 w-full"

                />

              </label>

              <p className="text-xs text-gray-500 dark:text-gray-400">{ui.logoPosition}</p>

              <div className="flex flex-wrap gap-2">

                {logoPositions.map(({ id, label }) => (

                  <button

                    key={id}

                    type="button"

                    onClick={() => patch({ logoPosition: id })}

                    className={`rounded-lg border px-2.5 py-1.5 text-xs ${

                      config.logoPosition === id

                        ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/40"

                        : "border-gray-200 dark:border-gray-700"

                    }`}

                  >

                    {label}

                  </button>

                ))}

              </div>

            </div>

          )}

        </fieldset>



        <div className="grid gap-3 sm:grid-cols-3">

          <label className="block">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.accentColor}</span>

            <input

              type="color"

              value={config.accentColor}

              onChange={(e) => patch({ accentColor: e.target.value })}

              className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"

            />

          </label>

          <label className="block">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.bgColor}</span>

            <input

              type="color"

              value={config.bgColor}

              onChange={(e) => patch({ bgColor: e.target.value })}

              className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"

            />

          </label>

          <label className="block">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.textColor}</span>

            <input

              type="color"

              value={config.textColor}

              onChange={(e) => patch({ textColor: e.target.value })}

              className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"

            />

          </label>

        </div>



        <div className="grid gap-3 sm:grid-cols-2">

          <label className="block">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.titleSize}</span>

            <select

              value={config.titleSize}

              onChange={(e) => patch({ titleSize: e.target.value as FontSize })}

              className="input-field mt-1 w-full"

            >

              <option value="sm">{ui.sizeSmall}</option>

              <option value="md">{ui.sizeMedium}</option>

              <option value="lg">{ui.sizeLarge}</option>

            </select>

          </label>

          <label className="block">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.nameSize}</span>

            <select

              value={config.nameSize}

              onChange={(e) => patch({ nameSize: e.target.value as FontSize })}

              className="input-field mt-1 w-full"

            >

              <option value="sm">{ui.sizeSmall}</option>

              <option value="md">{ui.sizeMedium}</option>

              <option value="lg">{ui.sizeLarge}</option>

            </select>

          </label>

          <label className="block">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.fontChoice}</span>

            <select

              value={config.fontChoice}

              onChange={(e) => patch({ fontChoice: e.target.value as FontChoice })}

              className="input-field mt-1 w-full"

            >

              <option value="sans">{ui.fontSans}</option>

              <option value="serif">{ui.fontSerif}</option>

              <option value="arabic">{ui.fontArabic}</option>

            </select>

          </label>

          <label className="block">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.orientation}</span>

            <select

              value={config.orientation}

              onChange={(e) => patch({ orientation: e.target.value as Orientation })}

              className="input-field mt-1 w-full"

            >

              <option value="landscape">{ui.landscape}</option>

              <option value="portrait">{ui.portrait}</option>

            </select>

          </label>

          <label className="block sm:col-span-2">

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.pageSize}</span>

            <select

              value={config.pageSize}

              onChange={(e) => patch({ pageSize: e.target.value as PageSize })}

              className="input-field mt-1 w-full"

            >

              <option value="a4">{ui.sizeA4}</option>

              <option value="letter">{ui.sizeLetter}</option>

              <option value="square">{ui.sizeSquare}</option>

            </select>

          </label>

        </div>

      </div>



      <div className="flex flex-wrap gap-2">

        <button

          type="button"

          onClick={() => void downloadPng()}

          disabled={!!exporting}

          className="btn-primary inline-flex items-center gap-2"

        >

          <Download className="h-4 w-4" />

          {exporting === "png" ? ui.exporting : ui.downloadPng}

        </button>

        <button

          type="button"

          onClick={() => void downloadPdf()}

          disabled={!!exporting}

          className="btn-secondary inline-flex items-center gap-2"

        >

          <Download className="h-4 w-4" />

          {exporting === "pdf" ? ui.exporting : ui.downloadPdf}

        </button>

        <button type="button" onClick={reset} className="btn-secondary inline-flex items-center gap-2">

          <RotateCcw className="h-4 w-4" />

          {ui.reset}

        </button>

      </div>



      <section className="space-y-3">

        <div className="flex flex-wrap items-center justify-between gap-2">

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{ui.preview}</p>

          {selectedId && (

            <button

              type="button"

              onClick={() => resetElementPosition(selectedId)}

              className="btn-secondary text-xs"

            >

              {ui.resetElementPosition}: {elementLabels[selectedId]}

            </button>

          )}

        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">{ui.dragHint}</p>

        <div className="w-full rounded-xl border border-gray-200 bg-gray-100/80 p-2 dark:border-gray-700 dark:bg-gray-800/60 sm:p-3">
          <canvas
            ref={canvasRef}
            className="mx-auto block w-full cursor-default"
            style={{ touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>

      </section>

    </div>

  );

}

