"use client";

import { useRef, useState } from "react";
import { PenLine, Upload } from "lucide-react";
import type { SignatureSlotConfig } from "@/lib/certificate-types";
import CertificateSignaturePad from "./certificate-signature-pad";

type SigMode = "upload" | "draw";

interface CertificateSignatureSlotProps {
  slot: SignatureSlotConfig;
  labels: {
    uploadSignature: string;
    drawSignature: string;
    signerName: string;
    signerTitle: string;
    signatureSize: string;
    signerNamePlaceholder: string;
    signerTitlePlaceholder: string;
  };
  onChange: (patch: Partial<SignatureSlotConfig>) => void;
}

export default function CertificateSignatureSlot({
  slot,
  labels,
  onChange,
}: CertificateSignatureSlotProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<SigMode>("upload");

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange({ imageDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${
            mode === "upload"
              ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/40"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          {labels.uploadSignature}
        </button>
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${
            mode === "draw"
              ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/40"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <PenLine className="h-3.5 w-3.5" />
          {labels.drawSignature}
        </button>
      </div>

      {mode === "upload" ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/webp,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-secondary inline-flex items-center gap-2 text-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            {labels.uploadSignature}
          </button>
          {slot.imageDataUrl && mode === "upload" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.imageDataUrl}
              alt=""
              className="mx-auto max-h-16 max-w-full object-contain"
            />
          )}
        </>
      ) : (
        <CertificateSignaturePad onChange={(dataUrl) => onChange({ imageDataUrl: dataUrl })} />
      )}

      {slot.imageDataUrl && (
        <label className="block">
          <span className="text-xs text-gray-500 dark:text-gray-400">{labels.signatureSize}</span>
          <input
            type="range"
            min={24}
            max={96}
            value={slot.imageHeight}
            onChange={(e) => onChange({ imageHeight: Number(e.target.value) })}
            className="mt-1 w-full"
          />
        </label>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {labels.signerName}
          </span>
          <input
            type="text"
            value={slot.signerName}
            onChange={(e) => onChange({ signerName: e.target.value })}
            placeholder={labels.signerNamePlaceholder}
            className="input-field mt-1 w-full text-sm"
            dir="auto"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {labels.signerTitle}
          </span>
          <input
            type="text"
            value={slot.signerTitle}
            onChange={(e) => onChange({ signerTitle: e.target.value })}
            placeholder={labels.signerTitlePlaceholder}
            className="input-field mt-1 w-full text-sm"
            dir="auto"
          />
        </label>
      </div>
    </div>
  );
}
