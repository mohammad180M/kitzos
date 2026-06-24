"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
  decimal: string;
}

const PRESET_COLORS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6", "#FFFFFF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981",
  "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#D946EF", "#EC4899", "#F43F5E", "#78716C", "#A16207", "#15803D", "#1D4ED8",
];

function hexToRgb(hex: string): Rgb | null {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const s = max === 0 ? 0 : d / max;
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(max * 100),
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  if (r === 0 && g === 0 && b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;
  const k = Math.min(c, m, y);

  return {
    c: Math.round(((c - k) / (1 - k)) * 100),
    m: Math.round(((m - k) / (1 - k)) * 100),
    y: Math.round(((y - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function computeValues(hex: string): ColorValues {
  const rgbObj = hexToRgb(hex) ?? { r: 59, g: 130, b: 246 };
  const { r, g, b } = rgbObj;
  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  const normalizedHex = rgbToHex(r, g, b);

  return {
    hex: normalizedHex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    decimal: `${r}, ${g}, ${b}`,
  };
}

function getShadesAndTints(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const offsets = [-35, -25, -15, -8, 0, 8, 15, 25];
  return offsets.map((offset) => {
    const l = Math.max(0, Math.min(100, hsl.l + offset));
    const adjusted = hslToRgb(hsl.h, hsl.s, l);
    return rgbToHex(adjusted.r, adjusted.g, adjusted.b).toUpperCase();
  });
}

export default function ColorPicker() {
  const [color, setColor] = useState("#3B82F6");
  const [hexInput, setHexInput] = useState("#3B82F6");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const values = computeValues(color);
  const shades = useMemo(() => getShadesAndTints(color), [color]);

  const updateColor = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const normalized = rgbToHex(rgb.r, rgb.g, rgb.b);
      setColor(normalized);
      setHexInput(normalized.toUpperCase());
    }
  }, []);

  const handleHexInput = (value: string) => {
    setHexInput(value);
    const withHash = value.startsWith("#") ? value : `#${value}`;
    updateColor(withHash);
  };

  const copy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignored
    }
  };

  const colorSpaceRows = [
    { key: "hex", label: "HEX", value: values.hex },
    { key: "rgb", label: "RGB", value: values.rgb },
    { key: "hsl", label: "HSL", value: values.hsl },
    { key: "hsv", label: "HSV", value: values.hsv },
    { key: "cmyk", label: "CMYK", value: values.cmyk },
    { key: "decimal", label: "Decimal (R, G, B)", value: values.decimal },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <label className="relative cursor-pointer">
          <span className="sr-only">Pick a color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => updateColor(e.target.value)}
            className="h-24 w-24 cursor-pointer rounded-xl border-2 border-gray-200"
          />
        </label>

        <div
          className="h-24 flex-1 rounded-xl border border-gray-200"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      </div>

      <div>
        <label htmlFor="hex-input" className="text-sm font-medium text-gray-700">
          HEX
        </label>
        <input
          id="hex-input"
          type="text"
          value={hexInput}
          onChange={(e) => handleHexInput(e.target.value)}
          placeholder="#000000"
          className="input-field mt-1 font-mono uppercase"
          maxLength={7}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Color spaces</h3>
        <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-2.5 font-medium text-gray-500">Space</th>
                <th className="px-4 py-2.5 font-medium text-gray-500">Value</th>
                <th className="w-12 px-2 py-2.5" aria-hidden="true" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {colorSpaceRows.map((row) => (
                <tr key={row.key}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-600">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-900 break-all">
                    {row.value}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => copy(row.key, row.value)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={`Copy ${row.label}`}
                    >
                      {copiedField === row.key ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Quick palette</h3>
        <div className="mt-2 grid grid-cols-7 gap-2 sm:grid-cols-9">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => updateColor(preset)}
              className={`aspect-square rounded-lg border-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                color.toUpperCase() === preset.toUpperCase()
                  ? "border-primary-600 ring-2 ring-primary-200"
                  : "border-gray-200"
              }`}
              style={{ backgroundColor: preset }}
              title={preset}
              aria-label={`Select ${preset}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Shades &amp; tints</h3>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {shades.map((shade, index) => (
            <button
              key={`${shade}-${index}`}
              type="button"
              onClick={() => updateColor(shade)}
              className={`h-10 w-10 shrink-0 rounded-lg border-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                color.toUpperCase() === shade.toUpperCase()
                  ? "border-primary-600"
                  : "border-gray-200"
              }`}
              style={{ backgroundColor: shade }}
              title={shade}
              aria-label={`Select ${shade}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
