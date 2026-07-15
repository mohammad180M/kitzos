/**
 * Stylized QR render on top of `qrcode` matrix — canvas + SVG (logo optional in PNG).
 * Preview and export share the same draw path for parity.
 */

import QRCode from "qrcode";

export type ErrorLevel = "L" | "M" | "Q" | "H";
export type ModuleStyle =
  | "square"
  | "rounded"
  | "dots"
  | "diamond"
  | "heart"
  | "triangle"
  | "hexagon"
  | "star"
  | "drop"
  | "plus"
  | "cross"
  | "leaf";
export type FinderOuter = "square" | "rounded" | "soft" | "circle" | "leaf";
export type FinderInner = "square" | "rounded" | "circle" | "diamond" | "plus" | "leaf";
export type FrameStyle = "none" | "border" | "rounded" | "thick" | "dashed" | "label";

export const MODULE_STYLES: ModuleStyle[] = [
  "square",
  "rounded",
  "dots",
  "diamond",
  "heart",
  "triangle",
  "hexagon",
  "star",
  "drop",
  "plus",
  "cross",
  "leaf",
];
export const FINDER_OUTERS: FinderOuter[] = ["square", "rounded", "soft", "circle", "leaf"];
export const FINDER_INNERS: FinderInner[] = [
  "square",
  "rounded",
  "circle",
  "diamond",
  "plus",
  "leaf",
];
export const FRAME_STYLES: FrameStyle[] = [
  "none",
  "border",
  "rounded",
  "thick",
  "dashed",
  "label",
];

export interface QrStyleOptions {
  errorCorrectionLevel: ErrorLevel;
  /** Full output edge in CSS pixels (including frame padding). */
  size: number;
  marginModules?: number;
  foreground: string;
  background: string;
  moduleStyle: ModuleStyle;
  finderOuter: FinderOuter;
  finderInner: FinderInner;
  logo?: CanvasImageSource | null;
  /** Logo diameter as fraction of QR body (0.12–0.28). */
  logoScale?: number;
  frame: FrameStyle;
  frameLabel?: string;
}

export const ERROR_LEVEL_PCT: Record<ErrorLevel, number> = {
  L: 7,
  M: 15,
  Q: 25,
  H: 30,
};

export function createMatrix(text: string, level: ErrorLevel) {
  return QRCode.create(text, { errorCorrectionLevel: level });
}

function isFinderCell(row: number, col: number, n: number): boolean {
  const inTL = row < 7 && col < 7;
  const inTR = row < 7 && col >= n - 7;
  const inBL = row >= n - 7 && col < 7;
  return inTL || inTR || inBL;
}

/**
 * Logo quiet zone snapped to whole modules.
 * `margin` modules stay empty between data and the logo image — no half-cut dots.
 */
export function logoClearWindow(n: number, logoScale = 0.22) {
  const scale = Math.min(0.28, Math.max(0.12, logoScale));
  const margin = 1;
  let clearModules = Math.round(n * scale) + margin * 2;
  if (clearModules % 2 === 0) clearModules += 1;
  const maxClear = Math.max(5, Math.floor(n * 0.38));
  clearModules = Math.min(Math.max(clearModules, 5 + margin * 2), maxClear);
  if (clearModules % 2 === 0) clearModules -= 1;

  const start = Math.floor((n - clearModules) / 2);
  const end = start + clearModules;
  const logoModules = clearModules - margin * 2;
  return { start, end, margin, clearModules, logoModules };
}

export function isInLogoClear(
  row: number,
  col: number,
  win: { start: number; end: number } | null
): boolean {
  if (!win) return false;
  return row >= win.start && row < win.end && col >= win.start && col < win.end;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function leafPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.quadraticCurveTo(x + w, y, x + w, cy);
  ctx.quadraticCurveTo(x + w, y + h, cx, y + h);
  ctx.quadraticCurveTo(x, y + h, x, cy);
  ctx.quadraticCurveTo(x, y, cx, y);
  ctx.closePath();
}

function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  ctx.beginPath();
  ctx.moveTo(cx, y + s * 0.32);
  ctx.bezierCurveTo(x + s * 0.08, y + s * 0.02, x - s * 0.02, y + s * 0.42, cx, y + s * 0.92);
  ctx.bezierCurveTo(x + s * 1.02, y + s * 0.42, x + s * 0.92, y + s * 0.02, cx, y + s * 0.32);
  ctx.closePath();
}

function polygonPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radii: number[],
  startAngle: number
) {
  ctx.beginPath();
  for (let i = 0; i < radii.length; i++) {
    const a = startAngle + (Math.PI * 2 * i) / radii.length;
    const px = cx + radii[i]! * Math.cos(a);
    const py = cy + radii[i]! * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  style: ModuleStyle,
  color: string
) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  ctx.fillStyle = color;

  if (style === "square") {
    ctx.fillRect(x, y, s, s);
    return;
  }
  if (style === "rounded") {
    roundedRectPath(ctx, x, y, s, s, s * 0.28);
    ctx.fill();
    return;
  }
  if (style === "dots") {
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.38, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (style === "diamond") {
    ctx.beginPath();
    ctx.moveTo(cx, y + s * 0.08);
    ctx.lineTo(x + s * 0.92, cy);
    ctx.lineTo(cx, y + s * 0.92);
    ctx.lineTo(x + s * 0.08, cy);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (style === "heart") {
    heartPath(ctx, x, y, s);
    ctx.fill();
    return;
  }
  if (style === "triangle") {
    ctx.beginPath();
    ctx.moveTo(cx, y + s * 0.1);
    ctx.lineTo(x + s * 0.9, y + s * 0.88);
    ctx.lineTo(x + s * 0.1, y + s * 0.88);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (style === "hexagon") {
    const r = s * 0.42;
    polygonPath(ctx, cx, cy, [r, r, r, r, r, r], Math.PI / 6);
    ctx.fill();
    return;
  }
  if (style === "star") {
    const outer = s * 0.46;
    const inner = s * 0.2;
    const radii = Array.from({ length: 8 }, (_, i) => (i % 2 === 0 ? outer : inner));
    polygonPath(ctx, cx, cy, radii, -Math.PI / 2);
    ctx.fill();
    return;
  }
  if (style === "drop") {
    ctx.beginPath();
    ctx.moveTo(cx, y + s * 0.08);
    ctx.quadraticCurveTo(x + s * 0.92, y + s * 0.42, cx, y + s * 0.92);
    ctx.quadraticCurveTo(x + s * 0.08, y + s * 0.42, cx, y + s * 0.08);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (style === "plus") {
    const t = s * 0.32;
    roundedRectPath(ctx, cx - t / 2, y + s * 0.08, t, s * 0.84, t * 0.25);
    ctx.fill();
    roundedRectPath(ctx, x + s * 0.08, cy - t / 2, s * 0.84, t, t * 0.25);
    ctx.fill();
    return;
  }
  if (style === "cross") {
    ctx.beginPath();
    const w = s * 0.22;
    ctx.moveTo(x + s * 0.12, y + s * 0.12 + w);
    ctx.lineTo(x + s * 0.12 + w, y + s * 0.12);
    ctx.lineTo(cx, cy - w * 0.35);
    ctx.lineTo(x + s * 0.88 - w, y + s * 0.12);
    ctx.lineTo(x + s * 0.88, y + s * 0.12 + w);
    ctx.lineTo(cx + w * 0.35, cy);
    ctx.lineTo(x + s * 0.88, y + s * 0.88 - w);
    ctx.lineTo(x + s * 0.88 - w, y + s * 0.88);
    ctx.lineTo(cx, cy + w * 0.35);
    ctx.lineTo(x + s * 0.12 + w, y + s * 0.88);
    ctx.lineTo(x + s * 0.12, y + s * 0.88 - w);
    ctx.lineTo(cx - w * 0.35, cy);
    ctx.closePath();
    ctx.fill();
    return;
  }
  // leaf
  leafPath(ctx, x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84);
  ctx.fill();
}

/** Finder geometry: all layers share the same center (cx, cy) on an integer module grid. */
function finderGeometry(ox: number, oy: number, moduleSize: number) {
  const s = moduleSize * 7;
  const hole = moduleSize * 5;
  const eye = moduleSize * 3;
  const cx = ox + s / 2;
  const cy = oy + s / 2;
  return {
    s,
    hole,
    eye,
    cx,
    cy,
    ox,
    oy,
    hx: cx - hole / 2,
    hy: cy - hole / 2,
    ex: cx - eye / 2,
    ey: cy - eye / 2,
    /** Same corner radius ratio for outer + hole so the ring thickness stays even. */
    outerRx: (kind: FinderOuter) => {
      if (kind === "soft") return s * 0.32;
      if (kind === "rounded") return s * 0.16;
      return 0;
    },
    holeRx: (kind: FinderOuter) => {
      if (kind === "soft") return hole * 0.32;
      if (kind === "rounded") return hole * 0.16;
      return 0;
    },
  };
}

export function drawFinder(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  moduleSize: number,
  outer: FinderOuter,
  inner: FinderInner,
  fg: string,
  bg: string
) {
  const g = finderGeometry(ox, oy, moduleSize);
  const { s, hole, eye, cx, cy, hx, hy, ex, ey } = g;

  // Clear the exact 7×7 finder cell so soft modules don't bleed under the kit.
  ctx.fillStyle = bg;
  ctx.fillRect(ox, oy, s, s);

  ctx.fillStyle = fg;
  if (outer === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (outer === "leaf") {
    leafPath(ctx, ox, oy, s, s);
    ctx.fill();
  } else if (outer === "soft" || outer === "rounded") {
    roundedRectPath(ctx, ox, oy, s, s, g.outerRx(outer));
    ctx.fill();
  } else {
    ctx.fillRect(ox, oy, s, s);
  }

  ctx.fillStyle = bg;
  if (outer === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, hole / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (outer === "leaf") {
    leafPath(ctx, hx, hy, hole, hole);
    ctx.fill();
  } else if (outer === "soft" || outer === "rounded") {
    roundedRectPath(ctx, hx, hy, hole, hole, g.holeRx(outer));
    ctx.fill();
  } else {
    ctx.fillRect(hx, hy, hole, hole);
  }

  ctx.fillStyle = fg;
  if (inner === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, eye / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (inner === "diamond") {
    ctx.beginPath();
    ctx.moveTo(cx, ey);
    ctx.lineTo(ex + eye, cy);
    ctx.lineTo(cx, ey + eye);
    ctx.lineTo(ex, cy);
    ctx.closePath();
    ctx.fill();
  } else if (inner === "rounded") {
    roundedRectPath(ctx, ex, ey, eye, eye, eye * 0.28);
    ctx.fill();
  } else if (inner === "plus") {
    let t = Math.max(1, Math.round(eye * 0.28));
    // Keep thickness parity with eye so the bar sits on the pixel center.
    if ((eye - t) % 2 !== 0) t = Math.min(eye, t + 1);
    const barX = cx - t / 2;
    const barY = cy - t / 2;
    ctx.fillRect(barX, ey, t, eye);
    ctx.fillRect(ex, barY, eye, t);
  } else if (inner === "leaf") {
    leafPath(ctx, ex, ey, eye, eye);
    ctx.fill();
  } else {
    ctx.fillRect(ex, ey, eye, eye);
  }
}

/**
 * Snap module size to whole pixels and center the symbol so finders sit on the grid.
 * Label height is extra (below) — it must not shrink the QR square.
 */
function layoutMetrics(n: number, size: number, marginModules: number, frame: FrameStyle) {
  const framePad =
    frame === "none" ? 0 : frame === "thick" ? Math.round(size * 0.09) : Math.round(size * 0.06);
  const labelPad = frame === "label" ? Math.round(size * 0.1) : 0;
  const qrSide = Math.max(1, size - framePad * 2);
  const modules = n + marginModules * 2;
  const moduleSize = Math.max(1, Math.floor(qrSide / modules));
  const used = moduleSize * modules;
  const offset = Math.floor((qrSide - used) / 2);
  const gridOrigin = framePad + offset + marginModules * moduleSize;
  return { framePad, labelPad, moduleSize, gridOrigin, modules, used, offset, qrSide };
}

function strokeFrame(
  ctx: CanvasRenderingContext2D,
  frame: FrameStyle,
  size: number,
  totalH: number,
  framePad: number,
  fg: string
) {
  if (frame === "none") return;
  ctx.strokeStyle = fg;
  if (frame === "thick") {
    ctx.lineWidth = Math.max(4, size * 0.028);
    ctx.strokeRect(framePad / 2, framePad / 2, size - framePad, totalH - framePad);
  } else if (frame === "dashed") {
    ctx.lineWidth = Math.max(2, size * 0.012);
    ctx.setLineDash([size * 0.035, size * 0.02]);
    ctx.strokeRect(framePad / 2, framePad / 2, size - framePad, totalH - framePad);
    ctx.setLineDash([]);
  } else if (frame === "rounded") {
    ctx.lineWidth = Math.max(2, size * 0.012);
    roundedRectPath(ctx, framePad / 2, framePad / 2, size - framePad, totalH - framePad, size * 0.035);
    ctx.stroke();
  } else if (frame === "border" || frame === "label") {
    ctx.lineWidth = Math.max(2, size * 0.012);
    ctx.strokeRect(framePad / 2, framePad / 2, size - framePad, totalH - framePad);
  }
}

export async function renderQrToCanvas(
  text: string,
  options: QrStyleOptions
): Promise<HTMLCanvasElement> {
  const qr = createMatrix(text, options.errorCorrectionLevel);
  const n = qr.modules.size;
  const margin = options.marginModules ?? 2;
  const size = options.size;
  const { framePad, labelPad, moduleSize, gridOrigin } = layoutMetrics(
    n,
    size,
    margin,
    options.frame
  );

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + (options.frame === "label" ? labelPad : 0);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const totalH = canvas.height;
  ctx.fillStyle = options.background;
  if (options.frame === "rounded") {
    roundedRectPath(ctx, 0, 0, size, totalH, size * 0.04);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, totalH);
  }

  strokeFrame(ctx, options.frame, size, totalH, framePad, options.foreground);

  const logoWin = options.logo ? logoClearWindow(n, options.logoScale) : null;

  // Finders first (exact 7×7 grid cells), then data modules so grid alignment stays crisp.
  drawFinder(
    ctx,
    gridOrigin,
    gridOrigin,
    moduleSize,
    options.finderOuter,
    options.finderInner,
    options.foreground,
    options.background
  );
  drawFinder(
    ctx,
    gridOrigin + (n - 7) * moduleSize,
    gridOrigin,
    moduleSize,
    options.finderOuter,
    options.finderInner,
    options.foreground,
    options.background
  );
  drawFinder(
    ctx,
    gridOrigin,
    gridOrigin + (n - 7) * moduleSize,
    moduleSize,
    options.finderOuter,
    options.finderInner,
    options.foreground,
    options.background
  );

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!qr.modules.get(row, col)) continue;
      if (isFinderCell(row, col, n)) continue;
      if (isInLogoClear(row, col, logoWin)) continue;
      const x = gridOrigin + col * moduleSize;
      const y = gridOrigin + row * moduleSize;
      drawModule(ctx, x, y, moduleSize, options.moduleStyle, options.foreground);
    }
  }

  if (options.logo && logoWin) {
    const clearPx = logoWin.clearModules * moduleSize;
    const clearX = gridOrigin + logoWin.start * moduleSize;
    const clearY = gridOrigin + logoWin.start * moduleSize;
    const logoPx = logoWin.logoModules * moduleSize;
    const lx = clearX + logoWin.margin * moduleSize;
    const ly = clearY + logoWin.margin * moduleSize;

    // Full quiet plateau on module boundaries, then logo starts after the margin.
    ctx.fillStyle = options.background;
    ctx.fillRect(clearX, clearY, clearPx, clearPx);
    ctx.save();
    roundedRectPath(ctx, lx, ly, logoPx, logoPx, Math.max(2, logoPx * 0.1));
    ctx.clip();
    ctx.drawImage(options.logo, lx, ly, logoPx, logoPx);
    ctx.restore();
  }

  if (options.frame === "label" && options.frameLabel?.trim()) {
    ctx.fillStyle = options.foreground;
    ctx.font = `600 ${Math.round(size * 0.045)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(options.frameLabel.trim().slice(0, 24), size / 2, size + labelPad / 2);
  }

  return canvas;
}

export async function canvasToPngDataUrl(canvas: HTMLCanvasElement): Promise<string> {
  return canvas.toDataURL("image/png");
}

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG export failed");
  return blob;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
}

function moduleSvgMarkup(style: ModuleStyle, x: number, y: number, s: number, fg: string): string {
  const cx = x + s / 2;
  const cy = y + s / 2;

  if (style === "dots") {
    return `<circle cx="${cx}" cy="${cy}" r="${s * 0.38}" fill="${fg}"/>`;
  }
  if (style === "rounded") {
    return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.28}" fill="${fg}"/>`;
  }
  if (style === "diamond") {
    return `<polygon points="${cx},${y + s * 0.08} ${x + s * 0.92},${cy} ${cx},${y + s * 0.92} ${x + s * 0.08},${cy}" fill="${fg}"/>`;
  }
  if (style === "heart") {
    return `<path d="M${cx} ${y + s * 0.32} C${x + s * 0.08} ${y + s * 0.02} ${x - s * 0.02} ${y + s * 0.42} ${cx} ${y + s * 0.92} C${x + s * 1.02} ${y + s * 0.42} ${x + s * 0.92} ${y + s * 0.02} ${cx} ${y + s * 0.32}Z" fill="${fg}"/>`;
  }
  if (style === "triangle") {
    return `<polygon points="${cx},${y + s * 0.1} ${x + s * 0.9},${y + s * 0.88} ${x + s * 0.1},${y + s * 0.88}" fill="${fg}"/>`;
  }
  if (style === "hexagon") {
    const r = s * 0.42;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = Math.PI / 6 + (Math.PI * 2 * i) / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="${fg}"/>`;
  }
  if (style === "star") {
    const outer = s * 0.46;
    const inner = s * 0.2;
    const pts = Array.from({ length: 8 }, (_, i) => {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (Math.PI * 2 * i) / 8;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="${fg}"/>`;
  }
  if (style === "drop") {
    return `<path d="M${cx} ${y + s * 0.08} Q${x + s * 0.92} ${y + s * 0.42} ${cx} ${y + s * 0.92} Q${x + s * 0.08} ${y + s * 0.42} ${cx} ${y + s * 0.08}Z" fill="${fg}"/>`;
  }
  if (style === "plus") {
    const t = s * 0.32;
    return `<rect x="${cx - t / 2}" y="${y + s * 0.08}" width="${t}" height="${s * 0.84}" rx="${t * 0.25}" fill="${fg}"/><rect x="${x + s * 0.08}" y="${cy - t / 2}" width="${s * 0.84}" height="${t}" rx="${t * 0.25}" fill="${fg}"/>`;
  }
  if (style === "cross") {
    const w = s * 0.22;
    const pts = [
      `${x + s * 0.12},${y + s * 0.12 + w}`,
      `${x + s * 0.12 + w},${y + s * 0.12}`,
      `${cx},${cy - w * 0.35}`,
      `${x + s * 0.88 - w},${y + s * 0.12}`,
      `${x + s * 0.88},${y + s * 0.12 + w}`,
      `${cx + w * 0.35},${cy}`,
      `${x + s * 0.88},${y + s * 0.88 - w}`,
      `${x + s * 0.88 - w},${y + s * 0.88}`,
      `${cx},${cy + w * 0.35}`,
      `${x + s * 0.12 + w},${y + s * 0.88}`,
      `${x + s * 0.12},${y + s * 0.88 - w}`,
      `${cx - w * 0.35},${cy}`,
    ].join(" ");
    return `<polygon points="${pts}" fill="${fg}"/>`;
  }
  if (style === "leaf") {
    const lx = x + s * 0.08;
    const ly = y + s * 0.08;
    const w = s * 0.84;
    const h = s * 0.84;
    const lcx = lx + w / 2;
    const lcy = ly + h / 2;
    return `<path d="M${lcx} ${ly} Q${lx + w} ${ly} ${lx + w} ${lcy} Q${lx + w} ${ly + h} ${lcx} ${ly + h} Q${lx} ${ly + h} ${lx} ${lcy} Q${lx} ${ly} ${lcx} ${ly}Z" fill="${fg}"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${fg}"/>`;
}

function leafSvg(x: number, y: number, w: number, h: number, fill: string) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `<path d="M${cx} ${y} Q${x + w} ${y} ${x + w} ${cy} Q${x + w} ${y + h} ${cx} ${y + h} Q${x} ${y + h} ${x} ${cy} Q${x} ${y} ${cx} ${y}Z" fill="${fill}"/>`;
}

function finderSvgMarkup(
  ox: number,
  oy: number,
  moduleSize: number,
  outer: FinderOuter,
  inner: FinderInner,
  fg: string,
  bg: string
): string {
  const g = finderGeometry(ox, oy, moduleSize);
  const { s, hole, eye, cx, cy, hx, hy, ex, ey } = g;
  let out = `<rect x="${ox}" y="${oy}" width="${s}" height="${s}" fill="${bg}"/>`;

  if (outer === "circle") {
    out += `<circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="${fg}"/>`;
    out += `<circle cx="${cx}" cy="${cy}" r="${hole / 2}" fill="${bg}"/>`;
  } else if (outer === "leaf") {
    out += leafSvg(ox, oy, s, s, fg);
    out += leafSvg(hx, hy, hole, hole, bg);
  } else if (outer === "soft" || outer === "rounded") {
    out += `<rect x="${ox}" y="${oy}" width="${s}" height="${s}" rx="${g.outerRx(outer)}" fill="${fg}"/>`;
    out += `<rect x="${hx}" y="${hy}" width="${hole}" height="${hole}" rx="${g.holeRx(outer)}" fill="${bg}"/>`;
  } else {
    out += `<rect x="${ox}" y="${oy}" width="${s}" height="${s}" fill="${fg}"/>`;
    out += `<rect x="${hx}" y="${hy}" width="${hole}" height="${hole}" fill="${bg}"/>`;
  }

  if (inner === "circle") {
    out += `<circle cx="${cx}" cy="${cy}" r="${eye / 2}" fill="${fg}"/>`;
  } else if (inner === "diamond") {
    const m = `${cx},${ey} ${ex + eye},${cy} ${cx},${ey + eye} ${ex},${cy}`;
    out += `<polygon points="${m}" fill="${fg}"/>`;
  } else if (inner === "rounded") {
    out += `<rect x="${ex}" y="${ey}" width="${eye}" height="${eye}" rx="${eye * 0.28}" fill="${fg}"/>`;
  } else if (inner === "plus") {
    let t = Math.max(1, Math.round(eye * 0.28));
    if ((eye - t) % 2 !== 0) t = Math.min(eye, t + 1);
    out += `<rect x="${cx - t / 2}" y="${ey}" width="${t}" height="${eye}" fill="${fg}"/>`;
    out += `<rect x="${ex}" y="${cy - t / 2}" width="${eye}" height="${t}" fill="${fg}"/>`;
  } else if (inner === "leaf") {
    out += leafSvg(ex, ey, eye, eye, fg);
  } else {
    out += `<rect x="${ex}" y="${ey}" width="${eye}" height="${eye}" fill="${fg}"/>`;
  }
  return out;
}

/** SVG without embedded logo (logo is PNG-only for reliability). */
export function renderQrToSvg(text: string, options: QrStyleOptions): string {
  const qr = createMatrix(text, options.errorCorrectionLevel);
  const n = qr.modules.size;
  const margin = options.marginModules ?? 2;
  const size = options.size;
  const labelPad = options.frame === "label" ? Math.round(size * 0.1) : 0;
  const { framePad, moduleSize, gridOrigin } = layoutMetrics(n, size, margin, options.frame);
  const totalH = size + labelPad;
  const fg = options.foreground;
  const bg = options.background;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${totalH}" viewBox="0 0 ${size} ${totalH}">`
  );
  if (options.frame === "rounded") {
    parts.push(`<rect width="${size}" height="${totalH}" rx="${size * 0.04}" fill="${bg}"/>`);
  } else {
    parts.push(`<rect width="${size}" height="${totalH}" fill="${bg}"/>`);
  }

  parts.push(
    finderSvgMarkup(
      gridOrigin,
      gridOrigin,
      moduleSize,
      options.finderOuter,
      options.finderInner,
      fg,
      bg
    )
  );
  parts.push(
    finderSvgMarkup(
      gridOrigin + (n - 7) * moduleSize,
      gridOrigin,
      moduleSize,
      options.finderOuter,
      options.finderInner,
      fg,
      bg
    )
  );
  parts.push(
    finderSvgMarkup(
      gridOrigin,
      gridOrigin + (n - 7) * moduleSize,
      moduleSize,
      options.finderOuter,
      options.finderInner,
      fg,
      bg
    )
  );

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!qr.modules.get(row, col)) continue;
      if (isFinderCell(row, col, n)) continue;
      const x = gridOrigin + col * moduleSize;
      const y = gridOrigin + row * moduleSize;
      parts.push(moduleSvgMarkup(options.moduleStyle, x, y, moduleSize, fg));
    }
  }

  if (options.frame !== "none") {
    const sw =
      options.frame === "thick" ? Math.max(4, size * 0.028) : Math.max(2, size * 0.012);
    const dash =
      options.frame === "dashed" ? ` stroke-dasharray="${size * 0.035} ${size * 0.02}"` : "";
    const rx = options.frame === "rounded" ? ` rx="${size * 0.035}"` : "";
    parts.push(
      `<rect x="${framePad / 2}" y="${framePad / 2}" width="${size - framePad}" height="${totalH - framePad}" fill="none" stroke="${fg}" stroke-width="${sw}"${dash}${rx}/>`
    );
  }

  if (options.frame === "label" && options.frameLabel?.trim()) {
    const fs = Math.round(size * 0.045);
    const label = escapeXml(options.frameLabel.trim().slice(0, 24));
    parts.push(
      `<text x="${size / 2}" y="${size + labelPad / 2}" text-anchor="middle" dominant-baseline="middle" fill="${fg}" font-family="system-ui,sans-serif" font-size="${fs}" font-weight="600">${label}</text>`
    );
  }

  parts.push("</svg>");
  return parts.join("");
}

/** Tiny SVG used by style pickers — viewBox only; CSS sizes the element. */
export function styleSwatchSvg(
  kind: "module" | "finder-outer" | "finder-inner" | "frame",
  value: string,
  fg = "#111827",
  bg = "#ffffff"
): string {
  const shell = (body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><rect width="48" height="48" rx="8" fill="${bg}"/>${body}</svg>`;

  if (kind === "module") {
    const style = value as ModuleStyle;
    // 3×3 sample centered: cell 10, gap 2 → step 12, footprint 34, origin 7.
    const cell = 10;
    const step = 12;
    const origin = 7;
    const cells = [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 0],
      [2, 2],
      [0, 2],
      [1, 2],
    ];
    const parts = cells.map(([c, r]) =>
      moduleSvgMarkup(style, origin + c * step, origin + r * step, cell, fg)
    );
    return shell(parts.join(""));
  }

  if (kind === "finder-outer" || kind === "finder-inner") {
    // moduleSize 5 → finder 35px; center in 48: origin 6.5
    const ms = 5;
    const origin = (48 - ms * 7) / 2;
    const markup =
      kind === "finder-outer"
        ? finderSvgMarkup(origin, origin, ms, value as FinderOuter, "square", fg, bg)
        : finderSvgMarkup(origin, origin, ms, "square", value as FinderInner, fg, bg);
    return shell(markup);
  }

  const frame = value as FrameStyle;
  if (frame === "none") {
    return shell(`<rect x="14" y="14" width="20" height="20" rx="2" fill="${fg}" opacity="0.22"/>`);
  }
  const sw = frame === "thick" ? 3.5 : 2;
  const dash = frame === "dashed" ? ` stroke-dasharray="4 3"` : "";
  const rx = frame === "rounded" ? ` rx="6"` : "";
  const label =
    frame === "label"
      ? `<text x="24" y="41" text-anchor="middle" dominant-baseline="middle" font-size="7" font-weight="600" fill="${fg}">Aa</text>`
      : "";
  const boxH = frame === "label" ? 30 : 28;
  const boxY = frame === "label" ? 7 : 10;
  return shell(
    `<rect x="10" y="${boxY}" width="28" height="${boxH}" fill="none" stroke="${fg}" stroke-width="${sw}"${dash}${rx}/><rect x="16" y="${boxY + 6}" width="16" height="16" rx="2" fill="${fg}" opacity="0.25"/>${label}`
  );
}
