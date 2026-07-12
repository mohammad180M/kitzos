import {
  defaultFontForLocale,
  ensureTextOverlayFonts,
  getTextOverlayFont,
  type TextOverlayFontId,
} from "@/lib/image/text-overlay-fonts";

export const MAX_TEXT_LAYERS = 10;

export interface TextOverlayLayer {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: TextOverlayFontId;
  /** -100 flat … 0 straight … +100 arc upward; negative arcs downward. */
  curvature: number;
  color: string;
  strokeEnabled: boolean;
  strokeColor: string;
  /** Center anchor, 0–1 relative to image width/height. */
  xRatio: number;
  yRatio: number;
}

const ARABIC_RE = /[\u0600-\u06FF]/;

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function layerHasArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

export function isMostlyRtl(text: string): boolean {
  const rtl = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return rtl > latin;
}

function canvasFont(layer: TextOverlayLayer, fontSize: number): string {
  const family = getTextOverlayFont(layer.fontFamily).canvasFamily;
  return `bold ${fontSize}px ${family}`;
}

function strokeWidthFor(fontSize: number, enabled: boolean): number {
  return enabled ? Math.max(2, fontSize / 12) : 0;
}

function splitChars(text: string): string[] {
  return Array.from(text);
}

export function measureTextLayerBox(
  ctx: CanvasRenderingContext2D,
  layer: TextOverlayLayer,
  fontSize: number
): { width: number; height: number } {
  if (!layer.text.trim()) {
    return { width: 0, height: fontSize };
  }

  const curvature = layerHasArabic(layer.text) ? 0 : layer.curvature;
  ctx.font = canvasFont(layer, fontSize);
  const strokePad = strokeWidthFor(fontSize, layer.strokeEnabled) * 2;

  if (Math.abs(curvature) < 1) {
    const width = ctx.measureText(layer.text).width + strokePad;
    return { width, height: fontSize + strokePad };
  }

  const chars = splitChars(layer.text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  const sweep = (Math.abs(curvature) / 100) * Math.PI * 0.9;
  const radius = Math.max(totalWidth / Math.max(sweep, 0.05), fontSize);
  const chord = 2 * radius * Math.sin(sweep / 2);
  const sagitta = radius - radius * Math.cos(sweep / 2);
  return {
    width: Math.max(chord, totalWidth) + strokePad,
    height: fontSize + sagitta + strokePad,
  };
}

export function clampLayerPosition(
  xRatio: number,
  yRatio: number,
  boxW: number,
  boxH: number,
  imgW: number,
  imgH: number
): { xRatio: number; yRatio: number } {
  if (imgW < 1 || imgH < 1 || boxW < 1 || boxH < 1) {
    return { xRatio: clamp(xRatio, 0, 1), yRatio: clamp(yRatio, 0, 1) };
  }
  const halfWRatio = boxW / 2 / imgW;
  const halfHRatio = boxH / 2 / imgH;
  return {
    xRatio: clamp(xRatio, halfWRatio, 1 - halfWRatio),
    yRatio: clamp(yRatio, halfHRatio, 1 - halfHRatio),
  };
}

export function nudgeLayerPosition(
  layer: TextOverlayLayer,
  dxRatio: number,
  dyRatio: number,
  imgW: number,
  imgH: number,
  measureCtx: CanvasRenderingContext2D
): Pick<TextOverlayLayer, "xRatio" | "yRatio"> {
  const box = measureTextLayerBox(measureCtx, layer, layer.fontSize);
  return clampLayerPosition(
    layer.xRatio + dxRatio,
    layer.yRatio + dyRatio,
    box.width,
    box.height,
    imgW,
    imgH
  );
}

function paintGlyph(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  rotation: number,
  layer: TextOverlayLayer,
  fontSize: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  if (layer.strokeEnabled) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = strokeWidthFor(fontSize, true);
    ctx.strokeText(ch, 0, 0);
  }
  ctx.fillStyle = layer.color;
  ctx.fillText(ch, 0, 0);
  ctx.restore();
}

function drawStraightText(
  ctx: CanvasRenderingContext2D,
  layer: TextOverlayLayer,
  x: number,
  y: number,
  fontSize: number
) {
  ctx.save();
  ctx.font = canvasFont(layer, fontSize);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = isMostlyRtl(layer.text) ? "rtl" : "ltr";
  if (layer.strokeEnabled) {
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineWidth = strokeWidthFor(fontSize, true);
    ctx.strokeText(layer.text, x, y);
  }
  ctx.fillStyle = layer.color;
  ctx.fillText(layer.text, x, y);
  ctx.restore();
}

function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  layer: TextOverlayLayer,
  x: number,
  y: number,
  fontSize: number
) {
  const chars = splitChars(layer.text);
  if (chars.length === 0) return;

  ctx.font = canvasFont(layer, fontSize);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "ltr";

  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  const bend = layer.curvature / 100;
  const sweep = Math.abs(bend) * Math.PI * 0.9;
  const radius = Math.max(totalWidth / Math.max(sweep, 0.05), fontSize * 2);
  const sign = bend > 0 ? 1 : -1;
  const centerY = y - sign * radius;

  let angle = -sweep / 2;
  for (let i = 0; i < chars.length; i++) {
    const w = widths[i];
    const charSweep = w / radius;
    angle += charSweep / 2;
    const px = x + radius * Math.sin(angle);
    const py = centerY + sign * radius * Math.cos(angle);
    const tangent = angle * sign;
    paintGlyph(ctx, chars[i], px, py, tangent, layer, fontSize);
    angle += charSweep / 2;
  }
}

export function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextOverlayLayer,
  imgW: number,
  imgH: number,
  scale = 1
) {
  if (!layer.text.trim()) return;

  const fontSize = Math.max(8, Math.round(layer.fontSize * scale));
  const x = layer.xRatio * imgW;
  const y = layer.yRatio * imgH;
  const curvature = layerHasArabic(layer.text) ? 0 : layer.curvature;

  if (Math.abs(curvature) < 1) {
    drawStraightText(ctx, layer, x, y, fontSize);
    return;
  }

  drawCurvedText(ctx, layer, x, y, fontSize);
}

export async function drawAllTextLayers(
  ctx: CanvasRenderingContext2D,
  layers: TextOverlayLayer[],
  imgW: number,
  imgH: number,
  scale = 1
) {
  await ensureTextOverlayFonts(layers, scale);
  for (const layer of layers) {
    drawTextLayer(ctx, layer, imgW, imgH, scale);
  }
}

export function createTextLayer(
  partial: Partial<TextOverlayLayer> & Pick<TextOverlayLayer, "text">,
  locale = "en"
): TextOverlayLayer {
  const hasArabic = layerHasArabic(partial.text ?? "");
  return {
    id: crypto.randomUUID(),
    fontSize: 36,
    fontFamily: defaultFontForLocale(locale),
    color: "#ffffff",
    strokeEnabled: true,
    strokeColor: "#000000",
    xRatio: 0.5,
    yRatio: 0.5,
    ...partial,
    curvature: hasArabic ? 0 : (partial.curvature ?? 0),
  };
}

export function sanitizeLayerPatch(
  layer: TextOverlayLayer,
  patch: Partial<TextOverlayLayer>
): Partial<TextOverlayLayer> {
  const next = { ...patch };
  const mergedText = patch.text ?? layer.text;
  if (layerHasArabic(mergedText)) {
    next.curvature = 0;
  }
  return next;
}
