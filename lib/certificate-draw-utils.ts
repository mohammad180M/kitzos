import type { FontChoice } from "./certificate-types";

export function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

export function fontFamily(choice: FontChoice, text: string, preferSerif = false): string {
  if (hasArabic(text) || choice === "arabic") {
    return preferSerif
      ? '"Noto Serif Arabic", "Noto Sans Arabic", serif'
      : '"Noto Sans Arabic", sans-serif';
  }
  if (choice === "serif" || preferSerif) {
    return '"Playfair Display", Georgia, "Times New Roman", serif';
  }
  return 'system-ui, -apple-system, "Segoe UI", sans-serif';
}

export function presentedToLabel(texts: string[]): string {
  return texts.some(hasArabic) ? "يُقدَّم إلى" : "Presented to";
}

export function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = `${line} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines;
}

export function drawTextLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    color: string;
    size: number;
    weight: string;
    fontChoice: FontChoice;
    align?: CanvasTextAlign;
    preferSerif?: boolean;
    letterSpacing?: number;
  }
): void {
  if (!text.trim()) return;
  const arabic = hasArabic(text);
  ctx.save();
  ctx.direction = arabic ? "rtl" : "ltr";
  ctx.textAlign = options.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.font = `${options.weight} ${options.size}px ${fontFamily(options.fontChoice, text, options.preferSerif)}`;
  ctx.fillStyle = options.color;
  if (options.letterSpacing) {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
      `${options.letterSpacing}px`;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  options: {
    color: string;
    size: number;
    weight: string;
    fontChoice: FontChoice;
    align?: CanvasTextAlign;
    preferSerif?: boolean;
  }
): void {
  if (!text.trim()) return;
  const arabic = hasArabic(text);
  ctx.save();
  ctx.direction = arabic ? "rtl" : "ltr";
  ctx.textAlign = options.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.font = `${options.weight} ${options.size}px ${fontFamily(options.fontChoice, text, options.preferSerif)}`;
  ctx.fillStyle = options.color;
  const lines = wrapLines(ctx, text, maxWidth);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
  ctx.restore();
}

export function drawDotPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  spacing: number,
  radius = 1
): void {
  ctx.save();
  ctx.fillStyle = color;
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawOrnateCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  flipX: number,
  flipY: number,
  color: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX, flipY);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.15, size * 0.85);
  ctx.quadraticCurveTo(size * 0.1, size * 0.1, size * 0.85, size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.22, size * 0.22, size * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

export function drawOrnateCorners(
  ctx: CanvasRenderingContext2D,
  pad: number,
  width: number,
  height: number,
  color: string,
  size: number
): void {
  drawOrnateCorner(ctx, pad, pad, size, 1, 1, color);
  drawOrnateCorner(ctx, width - pad, pad, size, -1, 1, color);
  drawOrnateCorner(ctx, pad, height - pad, size, 1, -1, color);
  drawOrnateCorner(ctx, width - pad, height - pad, size, -1, -1, color);
}

export function drawGoldSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  accent: string
): void {
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
  grad.addColorStop(0, lighten(accent, 40));
  grad.addColorStop(0.55, accent);
  grad.addColorStop(1, darken(accent, 25));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = lighten(accent, 55);
  ctx.lineWidth = Math.max(2, radius * 0.08);
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = darken(accent, 15);
  ctx.lineWidth = Math.max(1, radius * 0.05);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r1 = radius * 0.88;
    const r2 = radius * 0.96;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  ctx.fillStyle = darken(accent, 35);
  ctx.font = `700 ${radius * 0.28}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", cx, cy);
  ctx.restore();
}

export function drawSignatureLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lineWidth: number,
  color: string,
  alpha = 0.45
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - lineWidth / 2, y);
  ctx.lineTo(x + lineWidth / 2, y);
  ctx.stroke();
  ctx.restore();
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return rgb(
    Math.min(255, r + amount),
    Math.min(255, g + amount),
    Math.min(255, b + amount)
  );
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return rgb(
    Math.max(0, r - amount),
    Math.max(0, g - amount),
    Math.max(0, b - amount)
  );
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgb(r: number, g: number, b: number): string {
  return `rgb(${r},${g},${b})`;
}
