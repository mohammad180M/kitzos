"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { AlertTriangle, Download } from "lucide-react";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

const ERROR_LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return null;
  const l1 = relativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getQrOptions(
  foreground: string,
  background: string,
  errorCorrectionLevel: ErrorCorrectionLevel,
  size: number
) {
  return {
    width: size,
    margin: 2,
    errorCorrectionLevel,
    color: {
      dark: foreground,
      light: background,
    },
  };
}

export default function QrCodeGenerator() {
  const [text, setText] = useState("https://kitzos.com");
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  const [size, setSize] = useState(256);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lowContrast = useMemo(() => {
    const ratio = contrastRatio(foreground, background);
    return ratio !== null && ratio < 3;
  }, [foreground, background]);

  useEffect(() => {
    if (!text.trim()) {
      setQrDataUrl(null);
      setError(null);
      return;
    }

    QRCode.toDataURL(text, getQrOptions(foreground, background, errorLevel, size))
      .then((url) => {
        setQrDataUrl(url);
        setError(null);
      })
      .catch(() => {
        setQrDataUrl(null);
        setError("Could not generate QR code. Try shorter text.");
      });
  }, [text, foreground, background, errorLevel, size]);

  const downloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  const downloadSvg = async () => {
    if (!text.trim()) return;
    try {
      const svg = await QRCode.toString(text, {
        type: "svg",
        ...getQrOptions(foreground, background, errorLevel, size),
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("SVG export failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="qr-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Text or URL
        </label>
        <input
          id="qr-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL…"
          className="input-field mt-1"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/50 p-4 dark:border-gray-700 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="qr-fg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Foreground
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="qr-fg"
                type="color"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="input-field font-mono uppercase"
                maxLength={7}
              />
            </div>
          </div>
          <div>
            <label htmlFor="qr-bg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Background
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="qr-bg"
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="input-field font-mono uppercase"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {lowContrast && (
          <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300" role="status">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Low contrast between foreground and background may make this QR harder to scan.
          </p>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Error correction</label>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Higher = more scan-resistant but denser
          </p>
          <div className="mt-2 inline-flex rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 p-0.5">
            {ERROR_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setErrorLevel(level)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ errorLevel === level ? "bg-primary-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" }`}
                aria-pressed={errorLevel === level}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="qr-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Size: {size}px
          </label>
          <input
            id="qr-size"
            type="range"
            min={128}
            max={512}
            step={8}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="mt-2 w-full accent-primary-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>128px</span>
            <span>512px</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 p-6">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="Generated QR code"
            width={size}
            height={size}
            className="max-w-full"
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500"
            style={{ width: size, height: size, maxWidth: "100%" }}
          >
            QR code preview
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadPng}
          disabled={!qrDataUrl}
          className="btn-primary"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
        <button
          type="button"
          onClick={downloadSvg}
          disabled={!text.trim()}
          className="btn-secondary"
        >
          <Download className="h-4 w-4" />
          Download SVG
        </button>
      </div>
    </div>
  );
}
