import type { TemplateId } from "./certificate-types";
import {
  drawDotPattern,
  drawGoldSeal,
  drawOrnateCorners,
} from "./certificate-draw-utils";

export interface TemplateTheme {
  accent: string;
  bg: string;
  text: string;
  preferSerif: boolean;
}

export function drawTemplateBackground(
  ctx: CanvasRenderingContext2D,
  templateId: TemplateId,
  width: number,
  height: number,
  theme: TemplateTheme
): void {
  switch (templateId) {
    case "royal-gold":
      drawRoyalGold(ctx, width, height, theme);
      break;
    case "classic-ivory":
      drawClassicIvory(ctx, width, height, theme);
      break;
    case "modern-minimal":
      drawModernMinimal(ctx, width, height, theme);
      break;
    case "tech-gradient":
      drawTechGradient(ctx, width, height, theme);
      break;
    default:
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);
  }
}

function drawRoyalGold(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: TemplateTheme
): void {
  const pad = Math.min(width, height) * 0.055;
  const gold = theme.accent;

  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#0c0c0c");
  bgGrad.addColorStop(0.5, theme.bg);
  bgGrad.addColorStop(1, "#050505");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  drawDotPattern(ctx, width, height, "rgba(212,175,55,0.04)", 28, 0.8);

  ctx.save();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 5;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.85;
  ctx.strokeRect(pad + 14, pad + 14, width - (pad + 14) * 2, height - (pad + 14) * 2);
  ctx.globalAlpha = 1;
  drawOrnateCorners(ctx, pad + 6, width, height, gold, pad * 0.55);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.12;
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75
  );
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "#000");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawClassicIvory(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: TemplateTheme
): void {
  const pad = Math.min(width, height) * 0.05;
  const accent = theme.accent;

  const paper = ctx.createLinearGradient(0, 0, 0, height);
  paper.addColorStop(0, "#fffdf8");
  paper.addColorStop(0.5, theme.bg);
  paper.addColorStop(1, "#f3ead8");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(pad + 10, pad + 10, width - (pad + 10) * 2, height - (pad + 10) * 2);
  ctx.setLineDash([]);
  drawOrnateCorners(ctx, pad + 4, width, height, accent, pad * 0.5);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(width * 0.18, height * 0.155, width * 0.64, 3);
  ctx.globalAlpha = 0.2;
  ctx.fillRect(width * 0.22, height * 0.845, width * 0.56, 2);
  ctx.restore();
}

function drawModernMinimal(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: TemplateTheme
): void {
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  const barW = Math.max(8, width * 0.014);
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, barW, height);

  ctx.save();
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.08;
  ctx.fillRect(0, 0, width, height * 0.008);
  ctx.fillRect(0, height * 0.992, width, height * 0.008);
  ctx.restore();

  const pad = Math.min(width, height) * 0.06;
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
}

function drawTechGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: TemplateTheme
): void {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#4c1d95");
  grad.addColorStop(0.45, "#1e3a8a");
  grad.addColorStop(1, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  const step = 48;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  const pad = Math.min(width, height) * 0.045;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(pad, height * 0.2);
  ctx.lineTo(width - pad, height * 0.2);
  ctx.stroke();
  ctx.restore();
}

export function drawTemplateSeal(
  ctx: CanvasRenderingContext2D,
  templateId: TemplateId,
  cx: number,
  cy: number,
  radius: number,
  accent: string
): void {
  if (templateId === "modern-minimal") {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (templateId === "tech-gradient") {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    const r = radius * 0.75;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(34,211,238,0.12)";
    ctx.fill();
    ctx.restore();
    return;
  }

  drawGoldSeal(ctx, cx, cy, radius, accent);
}

export function getTemplateTheme(templateId: TemplateId, config: {
  accentColor: string;
  bgColor: string;
  textColor: string;
}): TemplateTheme {
  return {
    accent: config.accentColor,
    bg: config.bgColor,
    text: config.textColor,
    preferSerif: templateId === "royal-gold" || templateId === "classic-ivory",
  };
}
