"use client";

import { useEffect, useRef } from "react";
import { renderCertificateThumbnail } from "@/lib/certificate-render";
import {
  buildPreviewConfig,
  THUMB_HEIGHT,
  THUMB_WIDTH,
  type CertificateDefaults,
  type TemplateId,
} from "@/lib/certificate-types";

interface CertificateTemplateThumbProps {
  templateId: TemplateId;
  label: string;
  active: boolean;
  defaults: CertificateDefaults;
  fontsReady: boolean;
  onSelect: () => void;
}

export default function CertificateTemplateThumb({
  templateId,
  label,
  active,
  defaults,
  fontsReady,
  onSelect,
}: CertificateTemplateThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fontsReady || !canvasRef.current) return;
    const config = buildPreviewConfig(templateId, defaults);
    const thumb = renderCertificateThumbnail(
      config,
      { title: defaults.title, recipientName: defaults.recipientName },
      THUMB_WIDTH,
      THUMB_HEIGHT
    );
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    canvasRef.current.width = THUMB_WIDTH * 2;
    canvasRef.current.height = THUMB_HEIGHT * 2;
    ctx.drawImage(thumb, 0, 0, THUMB_WIDTH * 2, THUMB_HEIGHT * 2);
  }, [templateId, defaults, fontsReady]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`overflow-hidden rounded-lg border text-left transition-colors ${
        active
          ? "border-primary-500 ring-2 ring-primary-500/30 dark:border-primary-400"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      <canvas
        ref={canvasRef}
        width={THUMB_WIDTH * 2}
        height={THUMB_HEIGHT * 2}
        className="block w-full"
        style={{ aspectRatio: `${THUMB_WIDTH} / ${THUMB_HEIGHT}` }}
        aria-hidden="true"
      />
      <span className="block px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </button>
  );
}
