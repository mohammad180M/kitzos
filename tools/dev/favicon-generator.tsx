"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { setupCanvas } from "@/lib/canvas-utils";
import { downloadBlob } from "@/lib/audio-utils";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

function loadJSZipModule() {
  return import("jszip");
}

let jsZipModulePromise: ReturnType<typeof loadJSZipModule> | undefined;

function getJSZipModule() {
  if (!jsZipModulePromise) jsZipModulePromise = loadJSZipModule();
  return jsZipModulePromise;
}

const SIZES = [16, 32, 48, 192, 512] as const;

export default function FaviconGenerator() {
  const t = useDevToolsExtraLabels("faviconGenerator");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (file: File) => {
    setProcessing(true);
    setError(null);
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = rej;
        img.src = url;
      });

      const JSZip = (await getJSZipModule()).default;
      const zip = new JSZip();
      for (const size of SIZES) {
        const canvas = document.createElement("canvas");
        setupCanvas(canvas, size, size);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, size, size);
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/png");
        });
        zip.file(`favicon-${size}x${size}.png`, blob);
      }
      URL.revokeObjectURL(url);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "favicons.zip");
    } catch {
      setError(t.errorGenerate);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileDropZone
        accept="image/*"
        label={t.uploadImage}
        hint={t.hint}
        disabled={processing}
        icon={processing ? <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" /> : undefined}
        onFiles={(files) => {
          const f = files[0];
          if (f) void generate(f);
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
