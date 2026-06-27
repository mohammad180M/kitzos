import type {
  CertificateAssets,
  CertificateConfig,
  DraggableElementId,
  ElementLayout,
  FontChoice,
  FontSize,
  LogoPosition,
  SignatureSlotConfig,
} from "./certificate-types";
import { EMPTY_CERTIFICATE_ASSETS, SIZE_SCALE } from "./certificate-types";
import {
  computeCertificateGeometry,
  drawSelectionOverlay,
  offsetPoint,
  type ElementBounds,
} from "./certificate-layout";
import { getElementLayout } from "./certificate-types";
import {
  drawSignatureLine,
  drawTextLine,
  drawWrappedText,
  presentedToLabel,
} from "./certificate-draw-utils";
import {
  drawTemplateBackground,
  drawTemplateSeal,
  getTemplateTheme,
} from "./certificate-templates";

export { hasArabic } from "./certificate-draw-utils";
export type { CertificateAssets } from "./certificate-types";
export { EMPTY_CERTIFICATE_ASSETS } from "./certificate-types";
export {
  computeElementBounds,
  drawSelectionOverlay,
  hitTestElement,
  hitTestResizeHandle,
  resetElementLayout,
} from "./certificate-layout";
export type { DraggableElementId, ElementBounds } from "./certificate-layout";

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

function drawLogo(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: CertificateConfig,
  width: number,
  height: number,
  logoTop: number,
  layout: ElementLayout
): void {
  const logoW = Math.min(config.logoWidth, width * 0.22) * layout.scale;
  const logoH = (img.height / img.width) * logoW;
  const def = logoDefaultRect(config.logoPosition, width, height, logoW, logoH, logoTop);
  const pos = offsetPoint(def.x, def.y, layout, width, height);
  const alpha =
    config.logoPosition === "watermark"
      ? (config.logoOpacity / 100) * 0.1
      : (config.logoOpacity / 100) * 0.92;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, pos.x, pos.y, logoW, logoH);
  ctx.restore();
}

function scaledSize(base: number, size: FontSize): number {
  return Math.round(base * SIZE_SCALE[size]);
}

function drawSignatureSlot(
  ctx: CanvasRenderingContext2D,
  slot: SignatureSlotConfig,
  centerX: number,
  lineY: number,
  lineW: number,
  minDim: number,
  smallBase: number,
  textColor: string,
  fontChoice: FontChoice,
  sigImage: HTMLImageElement | null,
  layout: ElementLayout,
  width: number,
  height: number
): void {
  const scale = (minDim / 794) * layout.scale;
  const imgH = slot.imageHeight * scale;
  const pos = offsetPoint(centerX, lineY, layout, width, height);
  const scaledLineW = lineW * layout.scale;

  if (sigImage && slot.imageDataUrl) {
    const imgW = (sigImage.width / sigImage.height) * imgH;
    const imgX = pos.x - imgW / 2;
    const imgY = pos.y - imgH - minDim * 0.012;
    ctx.drawImage(sigImage, imgX, imgY, imgW, imgH);
  }

  drawSignatureLine(ctx, pos.x, pos.y, scaledLineW, textColor);

  let textY = pos.y + smallBase * 1.2;
  if (slot.signerName.trim()) {
    drawTextLine(ctx, slot.signerName, pos.x, textY, {
      color: textColor,
      size: scaledSize(smallBase, "md") * layout.scale,
      weight: "600",
      fontChoice,
      align: "center",
    });
    textY += smallBase * 1.15;
  }
  if (slot.signerTitle.trim()) {
    drawTextLine(ctx, slot.signerTitle, pos.x, textY, {
      color: textColor,
      size: scaledSize(smallBase * 0.92, "sm") * layout.scale,
      weight: "400",
      fontChoice,
      align: "center",
    });
  }
}

export interface DrawCertificateOptions {
  selectedId?: DraggableElementId | null;
  selectedBounds?: ElementBounds;
}

export function drawCertificate(
  ctx: CanvasRenderingContext2D,
  config: CertificateConfig,
  width: number,
  height: number,
  assets: CertificateAssets,
  options?: DrawCertificateOptions
): void {
  const theme = getTemplateTheme(config.templateId, config);
  drawTemplateBackground(ctx, config.templateId, width, height, theme);

  const g = computeCertificateGeometry(config, width, height, assets);
  const cx = g.cx;
  const minDim = g.minDim;
  const bodyBase = minDim * 0.026;
  const labelBase = minDim * 0.024;
  const titleSerif = g.titleSerif;

  const titleLayout = getElementLayout(config, "title");
  const nameLayout = getElementLayout(config, "recipientName");
  const sealLayout = getElementLayout(config, "seal");
  const dateLayout = getElementLayout(config, "date");
  const sigRightLayout = getElementLayout(config, "sigRight");
  const sigLeftLayout = getElementLayout(config, "sigLeft");
  const logoLayout = getElementLayout(config, "logo");

  if (assets.logo && config.logoDataUrl) {
    drawLogo(ctx, assets.logo, config, width, height, g.logoTop, logoLayout);
  }

  const titlePos = offsetPoint(cx, g.titleY, titleLayout, width, height);
  const presentedY = height * 0.28;
  const dividerY = height * 0.47;
  const achievementY = height * 0.54;
  const descY = height * 0.63;

  const presented = presentedToLabel([
    config.title,
    config.recipientName,
    config.description,
  ]);

  const titleColor =
    config.templateId === "royal-gold" ? config.accentColor : config.textColor;

  drawTextLine(ctx, config.title, titlePos.x, titlePos.y, {
    color: titleColor,
    size: scaledSize(g.titleBase, config.titleSize) * titleLayout.scale,
    weight: "700",
    fontChoice: config.fontChoice,
    preferSerif: titleSerif,
    letterSpacing: config.templateId === "modern-minimal" ? 2 : 0,
  });

  drawTextLine(ctx, presented, cx, presentedY, {
    color: config.textColor,
    size: scaledSize(labelBase, "sm"),
    weight: "400",
    fontChoice: config.fontChoice,
    preferSerif: false,
  });

  const namePos = offsetPoint(cx, g.nameY, nameLayout, width, height);
  drawTextLine(ctx, config.recipientName, namePos.x, namePos.y, {
    color: config.textColor,
    size: scaledSize(g.nameBase, config.nameSize) * nameLayout.scale,
    weight: "700",
    fontChoice: config.fontChoice,
    preferSerif: titleSerif,
  });

  ctx.save();
  ctx.strokeStyle = config.accentColor;
  ctx.globalAlpha = config.templateId === "modern-minimal" ? 0.35 : 0.6;
  ctx.lineWidth = config.templateId === "classic-ivory" ? 2.5 : 1.5;
  if (config.templateId === "classic-ivory") {
    ctx.beginPath();
    ctx.moveTo(width * 0.22, dividerY);
    ctx.lineTo(width * 0.78, dividerY);
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.28, dividerY + 6);
    ctx.lineTo(width * 0.72, dividerY + 6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(width * 0.2, dividerY);
    ctx.lineTo(width * 0.8, dividerY);
    ctx.stroke();
  }
  ctx.restore();

  drawTextLine(ctx, config.achievement, cx, achievementY, {
    color: config.textColor,
    size: scaledSize(bodyBase, "md"),
    weight: "600",
    fontChoice: config.fontChoice,
    preferSerif: titleSerif,
  });

  drawWrappedText(ctx, config.description, cx, descY, width * 0.58, bodyBase * 1.5, {
    color: config.textColor,
    size: scaledSize(bodyBase, "sm"),
    weight: "400",
    fontChoice: config.fontChoice,
    preferSerif: false,
  });

  const sealPos = offsetPoint(cx, g.sealY, sealLayout, width, height);
  drawTemplateSeal(
    ctx,
    config.templateId,
    sealPos.x,
    sealPos.y,
    g.sealR * sealLayout.scale,
    config.accentColor
  );

  if (config.enableLeftSignature) {
    drawSignatureSlot(
      ctx,
      config.sigLeft,
      g.leftX,
      g.lineY,
      g.lineW,
      minDim,
      g.smallBase,
      config.textColor,
      config.fontChoice,
      assets.sigLeft,
      sigLeftLayout,
      width,
      height
    );
    const datePos = offsetPoint(cx, g.dateY - minDim * 0.02, dateLayout, width, height);
    drawTextLine(ctx, config.date, datePos.x, datePos.y, {
      color: config.textColor,
      size: scaledSize(g.smallBase, "sm") * dateLayout.scale,
      weight: "400",
      fontChoice: config.fontChoice,
      align: "center",
    });
  } else {
    const leftLinePos = offsetPoint(g.leftX, g.lineY, sigLeftLayout, width, height);
    drawSignatureLine(ctx, leftLinePos.x, leftLinePos.y, g.lineW, config.textColor);
    const datePos = offsetPoint(g.leftX, g.dateY, dateLayout, width, height);
    drawTextLine(ctx, config.date, datePos.x, datePos.y, {
      color: config.textColor,
      size: scaledSize(g.smallBase, "sm") * dateLayout.scale,
      weight: "400",
      fontChoice: config.fontChoice,
      align: "center",
    });
  }

  drawSignatureSlot(
    ctx,
    config.sigRight,
    g.rightX,
    g.lineY,
    g.lineW,
    minDim,
    g.smallBase,
    config.textColor,
    config.fontChoice,
    assets.sigRight,
    sigRightLayout,
    width,
    height
  );

  if (options?.selectedId != null && options.selectedBounds) {
    drawSelectionOverlay(ctx, options.selectedBounds);
  }
}

export function renderCertificateCanvas(
  config: CertificateConfig,
  width: number,
  height: number,
  assets: CertificateAssets,
  exportScale = 1
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * exportScale);
  canvas.height = Math.round(height * exportScale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  if (exportScale !== 1) ctx.scale(exportScale, exportScale);

  drawCertificate(ctx, config, width, height, assets);
  return canvas;
}

export function renderCertificateThumbnail(
  config: CertificateConfig,
  defaults: { title: string; recipientName: string },
  thumbW: number,
  thumbH: number
): HTMLCanvasElement {
  const preview = {
    ...config,
    title: defaults.title,
    recipientName: defaults.recipientName,
    achievement: config.achievement.slice(0, 48),
    description: config.description.slice(0, 80),
    logoDataUrl: null,
    elementLayout: {},
  };
  return renderCertificateCanvas(preview, thumbW, thumbH, EMPTY_CERTIFICATE_ASSETS, 2);
}
