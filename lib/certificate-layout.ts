import type {
  CertificateAssets,
  CertificateConfig,
  CertificateElementLayout,
  DraggableElementId,
  ElementLayout,
  FontSize,
  LogoPosition,
  SignatureSlotConfig,
} from "./certificate-types";
import { DEFAULT_ELEMENT_LAYOUT, SIZE_SCALE, getElementLayout } from "./certificate-types";
import { fontFamily } from "./certificate-draw-utils";
import { getTemplateTheme } from "./certificate-templates";

export type { DraggableElementId, ElementLayout, CertificateElementLayout } from "./certificate-types";
export { DRAGGABLE_ELEMENT_IDS, DEFAULT_ELEMENT_LAYOUT, getElementLayout } from "./certificate-types";

export function offsetPoint(
  x: number,
  y: number,
  layout: ElementLayout,
  width: number,
  height: number
): { x: number; y: number } {
  return { x: x + layout.dx * width, y: y + layout.dy * height };
}

export interface ElementBounds {
  id: DraggableElementId;
  x: number;
  y: number;
  w: number;
  h: number;
}

function logoDefaultRect(
  position: LogoPosition,
  width: number,
  height: number,
  logoW: number,
  logoH: number,
  topOffset: number
): { x: number; y: number } {
  const margin = Math.min(width, height) * 0.07;
  switch (position) {
    case "top-left":
      return { x: margin + width * 0.02, y: margin };
    case "top-right":
      return { x: width - margin - logoW - width * 0.02, y: margin };
    case "watermark":
      return { x: (width - logoW) / 2, y: (height - logoH) / 2 };
    default:
      return { x: (width - logoW) / 2, y: topOffset };
  }
}

function scaledSize(base: number, size: FontSize): number {
  return Math.round(base * SIZE_SCALE[size]);
}

function measureTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  weight: string,
  fontChoice: CertificateConfig["fontChoice"],
  preferSerif = false
): number {
  if (!text.trim()) return 0;
  ctx.save();
  ctx.font = `${weight} ${size}px ${fontFamily(fontChoice, text, preferSerif)}`;
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
}

function signatureSlotBounds(
  slot: SignatureSlotConfig,
  centerX: number,
  lineY: number,
  lineW: number,
  minDim: number,
  smallBase: number,
  layout: ElementLayout,
  width: number,
  height: number,
  hasImage: boolean
): ElementBounds {
  const scale = minDim / 794;
  const imgH = hasImage ? slot.imageHeight * scale * layout.scale : 0;
  const pos = offsetPoint(centerX, lineY, layout, width, height);
  const slotH = signatureSlotHeight(slot, minDim, smallBase, hasImage, layout.scale);
  const slotW = Math.max(lineW * layout.scale, imgH > 0 ? imgH * 2.2 : lineW);
  const top = pos.y - (imgH > 0 ? imgH + minDim * 0.012 : 0) - minDim * 0.02;
  return {
    id: "sigRight",
    x: pos.x - slotW / 2,
    y: top,
    w: slotW,
    h: slotH + minDim * 0.04,
  };
}

function signatureSlotHeight(
  slot: SignatureSlotConfig,
  minDim: number,
  smallBase: number,
  hasImage: boolean,
  scale: number
): number {
  const imgH = hasImage ? slot.imageHeight * (minDim / 794) * scale : 0;
  const gap = minDim * 0.012;
  let h = imgH > 0 ? imgH + gap : 0;
  h += smallBase * 0.5;
  if (slot.signerName.trim()) h += smallBase * 1.2;
  if (slot.signerTitle.trim()) h += smallBase * 1.15;
  return h;
}

export interface CertificateGeometry {
  width: number;
  height: number;
  cx: number;
  minDim: number;
  logoTop: number;
  titleY: number;
  nameY: number;
  sealY: number;
  dateY: number;
  lineY: number;
  lineW: number;
  leftX: number;
  rightX: number;
  titleBase: number;
  nameBase: number;
  smallBase: number;
  sealR: number;
  titleSerif: boolean;
}

export function computeCertificateGeometry(
  config: CertificateConfig,
  width: number,
  height: number,
  assets: CertificateAssets
): CertificateGeometry {
  const theme = getTemplateTheme(config.templateId, config);
  const cx = width / 2;
  const minDim = Math.min(width, height);
  const hasLogoTop =
    !!assets.logo && !!config.logoDataUrl && config.logoPosition !== "watermark";

  return {
    width,
    height,
    cx,
    minDim,
    logoTop: height * 0.09,
    titleY: height * (hasLogoTop ? 0.2 : 0.17),
    nameY: height * 0.4,
    sealY: height * 0.82,
    dateY: height * 0.9,
    lineY: height * 0.9 + minDim * 0.04,
    lineW: width * 0.16,
    leftX: width * 0.22,
    rightX: width * 0.78,
    titleBase: minDim * 0.048,
    nameBase: minDim * 0.072,
    smallBase: minDim * 0.022,
    sealR: minDim * 0.055,
    titleSerif: theme.preferSerif,
  };
}

export function computeElementBounds(
  ctx: CanvasRenderingContext2D,
  config: CertificateConfig,
  width: number,
  height: number,
  assets: CertificateAssets
): ElementBounds[] {
  const g = computeCertificateGeometry(config, width, height, assets);
  const bounds: ElementBounds[] = [];

  if (assets.logo && config.logoDataUrl) {
    const layout = getElementLayout(config, "logo");
    const logoW = Math.min(config.logoWidth, width * 0.22) * layout.scale;
    const logoH = (assets.logo.height / assets.logo.width) * logoW;
    const def = logoDefaultRect(
      config.logoPosition,
      width,
      height,
      logoW,
      logoH,
      g.logoTop
    );
    const pos = offsetPoint(def.x, def.y, layout, width, height);
    bounds.push({ id: "logo", x: pos.x, y: pos.y, w: logoW, h: logoH });
  }

  {
    const layout = getElementLayout(config, "seal");
    const r = g.sealR * layout.scale;
    const pos = offsetPoint(g.cx, g.sealY, layout, width, height);
    bounds.push({ id: "seal", x: pos.x - r, y: pos.y - r, w: r * 2, h: r * 2 });
  }

  {
    const layout = getElementLayout(config, "sigRight");
    const b = signatureSlotBounds(
      config.sigRight,
      g.rightX,
      g.lineY,
      g.lineW,
      g.minDim,
      g.smallBase,
      layout,
      width,
      height,
      !!assets.sigRight && !!config.sigRight.imageDataUrl
    );
    bounds.push({ ...b, id: "sigRight" });
  }

  if (config.enableLeftSignature) {
    const layout = getElementLayout(config, "sigLeft");
    const b = signatureSlotBounds(
      config.sigLeft,
      g.leftX,
      g.lineY,
      g.lineW,
      g.minDim,
      g.smallBase,
      layout,
      width,
      height,
      !!assets.sigLeft && !!config.sigLeft.imageDataUrl
    );
    bounds.push({ ...b, id: "sigLeft" });
  }

  {
    const layout = getElementLayout(config, "title");
    const size = scaledSize(g.titleBase, config.titleSize) * layout.scale;
    const tw = measureTextWidth(ctx, config.title, size, "700", config.fontChoice, g.titleSerif);
    const pos = offsetPoint(g.cx, g.titleY, layout, width, height);
    const pad = g.minDim * 0.02;
    bounds.push({
      id: "title",
      x: pos.x - tw / 2 - pad,
      y: pos.y - size / 2 - pad,
      w: tw + pad * 2,
      h: size + pad * 2,
    });
  }

  {
    const layout = getElementLayout(config, "recipientName");
    const size = scaledSize(g.nameBase, config.nameSize) * layout.scale;
    const tw = measureTextWidth(ctx, config.recipientName, size, "700", config.fontChoice, g.titleSerif);
    const pos = offsetPoint(g.cx, g.nameY, layout, width, height);
    const pad = g.minDim * 0.02;
    bounds.push({
      id: "recipientName",
      x: pos.x - tw / 2 - pad,
      y: pos.y - size / 2 - pad,
      w: tw + pad * 2,
      h: size + pad * 2,
    });
  }

  {
    const layout = getElementLayout(config, "date");
    const size = scaledSize(g.smallBase, "sm") * layout.scale;
    const tw = measureTextWidth(ctx, config.date, size, "400", config.fontChoice);
    const dateX = config.enableLeftSignature ? g.cx : g.leftX;
    const dateY = config.enableLeftSignature ? g.dateY - g.minDim * 0.02 : g.dateY;
    const pos = offsetPoint(dateX, dateY, layout, width, height);
    const pad = g.minDim * 0.015;
    bounds.push({
      id: "date",
      x: pos.x - tw / 2 - pad,
      y: pos.y - size / 2 - pad,
      w: tw + pad * 2,
      h: size + pad * 2,
    });
  }

  return bounds;
}

export function hitTestElement(
  bounds: ElementBounds[],
  x: number,
  y: number
): DraggableElementId | null {
  for (let i = bounds.length - 1; i >= 0; i--) {
    const b = bounds[i];
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return null;
}

export function hitTestResizeHandle(
  bounds: ElementBounds | undefined,
  x: number,
  y: number,
  handleSize: number
): boolean {
  if (!bounds) return false;
  const hx = bounds.x + bounds.w;
  const hy = bounds.y + bounds.h;
  return x >= hx - handleSize && x <= hx + handleSize && y >= hy - handleSize && y <= hy + handleSize;
}

export function drawSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  bounds: ElementBounds | undefined
): void {
  if (!bounds) return;
  const handle = 6;
  ctx.save();
  ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
  ctx.setLineDash([]);
  const hx = bounds.x + bounds.w;
  const hy = bounds.y + bounds.h;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(hx - handle, hy - handle, handle, handle);
  ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
  ctx.lineWidth = 1;
  ctx.strokeRect(hx - handle, hy - handle, handle, handle);
  ctx.restore();
}

export function resetElementLayout(
  layout: CertificateElementLayout,
  id: DraggableElementId
): CertificateElementLayout {
  const next = { ...layout };
  delete next[id];
  return next;
}
