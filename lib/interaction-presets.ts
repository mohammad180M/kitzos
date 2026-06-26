export type RipplePattern = "ripple" | "burst" | "shockwave" | "ring-pulse" | "ink-spread";

export interface RippleStyle {
  pattern: RipplePattern;
  color: string;
  duration: number;
  size: number;
}

export interface RipplePatternMeta {
  id: RipplePattern;
  name: string;
  description: string;
}

export const RIPPLE_PATTERNS: RipplePatternMeta[] = [
  { id: "ripple", name: "Ripple", description: "Classic circular wave from the tap point" },
  { id: "burst", name: "Burst", description: "Particles scatter outward on press" },
  { id: "shockwave", name: "Shockwave", description: "A ring expands and fades away" },
  { id: "ring-pulse", name: "Ring pulse", description: "Multiple rings pulse in sequence" },
  { id: "ink-spread", name: "Ink spread", description: "Square ink blot spreads unevenly" },
];

export const DEFAULT_RIPPLE_STYLE: Record<RipplePattern, Omit<RippleStyle, "pattern">> = {
  ripple: { color: "#2563eb80", duration: 600, size: 80 },
  burst: { color: "#2563ebcc", duration: 520, size: 72 },
  shockwave: { color: "#2563eb", duration: 650, size: 90 },
  "ring-pulse": { color: "#2563eb99", duration: 900, size: 70 },
  "ink-spread": { color: "#1e293b55", duration: 700, size: 64 },
};

export interface CursorPreset {
  id: string;
  name: string;
  description: string;
  color: string;
  size: number;
  trailLength: number;
  blur: number;
  mode: "dot" | "trail" | "glow" | "ring";
  lerp: number;
}

export const CURSOR_PRESETS: CursorPreset[] = [
  {
    id: "dot",
    name: "Dot follower",
    description: "Smooth dot tracks the pointer",
    color: "#2563eb",
    size: 12,
    trailLength: 0,
    blur: 0,
    mode: "dot",
    lerp: 0.28,
  },
  {
    id: "trail",
    name: "Motion trail",
    description: "Fading dots behind the cursor",
    color: "#8b5cf6",
    size: 8,
    trailLength: 14,
    blur: 0,
    mode: "trail",
    lerp: 0.35,
  },
  {
    id: "glow",
    name: "Spotlight",
    description: "Soft glow follows movement",
    color: "#f59e0b60",
    size: 120,
    trailLength: 0,
    blur: 24,
    mode: "glow",
    lerp: 0.2,
  },
  {
    id: "ring",
    name: "Magnetic ring",
    description: "Ring eases toward the cursor",
    color: "#10b981",
    size: 40,
    trailLength: 0,
    blur: 0,
    mode: "ring",
    lerp: 0.12,
  },
];

function rippleScale(size: number): number {
  return Math.max(3, size / 22);
}

export function buildRippleCss(style: RippleStyle): string {
  const { pattern, color, duration, size } = style;

  if (pattern === "burst") {
    return `.press-fx-target {
  position: relative;
  overflow: hidden;
}
.press-burst-particle {
  position: absolute;
  width: ${Math.max(4, Math.round(size / 12))}px;
  height: ${Math.max(4, Math.round(size / 12))}px;
  border-radius: 50%;
  background: ${color};
  pointer-events: none;
  animation: press-burst-fly ${duration}ms ease-out forwards;
}
@keyframes press-burst-fly {
  from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  to {
    transform: translate(calc(-50% + var(--bx)), calc(-50% + var(--by))) scale(0.2);
    opacity: 0;
  }
}`;
  }

  if (pattern === "shockwave") {
    return `.press-fx-target {
  position: relative;
  overflow: hidden;
}
.press-shockwave {
  position: absolute;
  border-radius: 50%;
  border: 2px solid ${color};
  background: transparent;
  pointer-events: none;
  transform: scale(0);
  animation: press-shockwave ${duration}ms ease-out forwards;
}
@keyframes press-shockwave {
  to { transform: scale(${rippleScale(size) * 1.2}); opacity: 0; }
}`;
  }

  if (pattern === "ring-pulse") {
    return `.press-fx-target {
  position: relative;
  overflow: hidden;
}
.press-ring-pulse {
  position: absolute;
  border-radius: 50%;
  border: 2px solid ${color};
  background: transparent;
  pointer-events: none;
  transform: scale(0);
  opacity: 0.85;
  animation: press-ring-pulse ${duration}ms ease-out forwards;
}
@keyframes press-ring-pulse {
  to { transform: scale(${rippleScale(size)}); opacity: 0; }
}`;
  }

  if (pattern === "ink-spread") {
    return `.press-fx-target {
  position: relative;
  overflow: hidden;
}
.press-ink {
  position: absolute;
  border-radius: 6px;
  background: ${color};
  pointer-events: none;
  transform: scale(0);
  transform-origin: center;
  animation: press-ink-spread ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes press-ink-spread {
  to {
    transform: scaleX(${rippleScale(size) * 0.9}) scaleY(${rippleScale(size) * 0.75});
    opacity: 0;
    border-radius: 2px;
  }
}`;
  }

  return `.press-fx-target {
  position: relative;
  overflow: hidden;
}
.press-ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: press-ripple ${duration}ms ease-out forwards;
  pointer-events: none;
  background: ${color};
}
@keyframes press-ripple {
  to { transform: scale(${rippleScale(size)}); opacity: 0; }
}`;
}

export function buildRippleJs(style: RippleStyle): string {
  const { pattern, color, duration, size } = style;
  const opts = JSON.stringify({ pattern, color, duration, size });

  if (pattern === "burst") {
    const count = Math.max(8, Math.min(20, Math.round(size / 5)));
    const dist = Math.round(size * 0.85);
    return `function attachPressEffect(el, opts) {
  opts = Object.assign(${opts}, opts || {});
  el.classList.add('press-fx-target');
  const count = ${count};
  const dist = ${dist};
  el.addEventListener('pointerdown', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const p = document.createElement('span');
      p.className = 'press-burst-particle';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--by', Math.sin(angle) * dist + 'px');
      p.style.animationDuration = opts.duration + 'ms';
      el.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  });
}`;
  }

  if (pattern === "shockwave") {
    return `function attachPressEffect(el, opts) {
  opts = Object.assign(${opts}, opts || {});
  el.classList.add('press-fx-target');
  el.addEventListener('pointerdown', (e) => {
    const rect = el.getBoundingClientRect();
    const wave = document.createElement('span');
    wave.className = 'press-shockwave';
    const d = Math.max(rect.width, rect.height, opts.size);
    wave.style.width = d + 'px';
    wave.style.height = d + 'px';
    wave.style.left = (e.clientX - rect.left - d / 2) + 'px';
    wave.style.top = (e.clientY - rect.top - d / 2) + 'px';
    wave.style.animationDuration = opts.duration + 'ms';
    el.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });
}`;
  }

  if (pattern === "ring-pulse") {
    return `function attachPressEffect(el, opts) {
  opts = Object.assign(${opts}, opts || {});
  el.classList.add('press-fx-target');
  el.addEventListener('pointerdown', (e) => {
    const rect = el.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height, opts.size);
    const x = e.clientX - rect.left - d / 2;
    const y = e.clientY - rect.top - d / 2;
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('span');
      ring.className = 'press-ring-pulse';
      ring.style.width = d + 'px';
      ring.style.height = d + 'px';
      ring.style.left = x + 'px';
      ring.style.top = y + 'px';
      ring.style.animationDelay = (i * opts.duration * 0.22) + 'ms';
      ring.style.animationDuration = opts.duration + 'ms';
      el.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove());
    }
  });
}`;
  }

  if (pattern === "ink-spread") {
    return `function attachPressEffect(el, opts) {
  opts = Object.assign(${opts}, opts || {});
  el.classList.add('press-fx-target');
  el.addEventListener('pointerdown', (e) => {
    const rect = el.getBoundingClientRect();
    const ink = document.createElement('span');
    ink.className = 'press-ink';
    const d = opts.size;
    ink.style.width = d + 'px';
    ink.style.height = d + 'px';
    ink.style.left = (e.clientX - rect.left - d / 2) + 'px';
    ink.style.top = (e.clientY - rect.top - d / 2) + 'px';
    ink.style.animationDuration = opts.duration + 'ms';
    el.appendChild(ink);
    ink.addEventListener('animationend', () => ink.remove());
  });
}`;
  }

  return `function attachPressEffect(el, opts) {
  opts = Object.assign(${opts}, opts || {});
  el.classList.add('press-fx-target');
  el.addEventListener('pointerdown', (e) => {
    const ripple = document.createElement('span');
    ripple.className = 'press-ripple';
    const rect = el.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height, opts.size);
    ripple.style.width = d + 'px';
    ripple.style.height = d + 'px';
    ripple.style.left = (e.clientX - rect.left - d / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - d / 2) + 'px';
    ripple.style.animationDuration = opts.duration + 'ms';
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}`;
}

/** Preview helper — spawns a press effect inside a container (client-only). */
export function spawnPressEffect(
  container: HTMLElement,
  clientX: number,
  clientY: number,
  style: RippleStyle
): void {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const { pattern, color, duration, size } = style;

  if (pattern === "burst") {
    const count = Math.max(8, Math.min(20, Math.round(size / 5)));
    const dist = size * 0.85;
    const particleSize = Math.max(4, Math.round(size / 12));
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2 * i) / count) + Math.random() * 0.4;
      const p = document.createElement("span");
      Object.assign(p.style, {
        position: "absolute",
        width: `${particleSize}px`,
        height: `${particleSize}px`,
        borderRadius: "50%",
        background: color,
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        animation: `press-burst-fly ${duration}ms ease-out forwards`,
        ["--bx" as string]: `${Math.cos(angle) * dist}px`,
        ["--by" as string]: `${Math.sin(angle) * dist}px`,
      });
      container.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
    return;
  }

  if (pattern === "shockwave") {
    const d = Math.max(rect.width, rect.height, size);
    const wave = document.createElement("span");
    Object.assign(wave.style, {
      position: "absolute",
      width: `${d}px`,
      height: `${d}px`,
      left: `${x - d / 2}px`,
      top: `${y - d / 2}px`,
      borderRadius: "50%",
      border: `2px solid ${color}`,
      background: "transparent",
      pointerEvents: "none",
      transform: "scale(0)",
      animation: `press-shockwave ${duration}ms ease-out forwards`,
    });
    container.appendChild(wave);
    wave.addEventListener("animationend", () => wave.remove());
    return;
  }

  if (pattern === "ring-pulse") {
    const d = Math.max(rect.width, rect.height, size);
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("span");
      Object.assign(ring.style, {
        position: "absolute",
        width: `${d}px`,
        height: `${d}px`,
        left: `${x - d / 2}px`,
        top: `${y - d / 2}px`,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        background: "transparent",
        pointerEvents: "none",
        transform: "scale(0)",
        opacity: "0.85",
        animation: `press-ring-pulse ${duration}ms ease-out forwards`,
        animationDelay: `${i * duration * 0.22}ms`,
      });
      container.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove());
    }
    return;
  }

  if (pattern === "ink-spread") {
    const ink = document.createElement("span");
    Object.assign(ink.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      borderRadius: "6px",
      background: color,
      pointerEvents: "none",
      transform: "scale(0)",
      transformOrigin: "center",
      animation: `press-ink-spread ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
    });
    container.appendChild(ink);
    ink.addEventListener("animationend", () => ink.remove());
    return;
  }

  const d = Math.max(rect.width, rect.height, size);
  const ripple = document.createElement("span");
  Object.assign(ripple.style, {
    position: "absolute",
    width: `${d}px`,
    height: `${d}px`,
    left: `${x - d / 2}px`,
    top: `${y - d / 2}px`,
    borderRadius: "50%",
    background: color,
    pointerEvents: "none",
    transform: "scale(0)",
    animation: `press-ripple ${duration}ms ease-out forwards`,
  });
  container.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

export function buildCursorCss(p: CursorPreset): string {
  if (p.mode === "glow") {
    return `.cursor-glow-wrap {
  position: relative;
  overflow: hidden;
}
.cursor-glow {
  position: absolute;
  width: ${p.size}px;
  height: ${p.size}px;
  border-radius: 50%;
  background: ${p.color};
  filter: blur(${p.blur}px);
  pointer-events: none;
  transform: translate(-50%, -50%);
  will-change: left, top;
}`;
  }
  if (p.mode === "ring") {
    return `.cursor-ring-wrap {
  position: relative;
  overflow: hidden;
}
.cursor-ring {
  position: absolute;
  width: ${p.size}px;
  height: ${p.size}px;
  border: 2px solid ${p.color};
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  will-change: left, top;
}`;
  }
  if (p.mode === "trail") {
    return `.cursor-trail-wrap {
  position: relative;
  overflow: hidden;
}
.cursor-trail-dot {
  position: absolute;
  width: ${p.size}px;
  height: ${p.size}px;
  border-radius: 50%;
  background: ${p.color};
  pointer-events: none;
  transform: translate(-50%, -50%);
  animation: cursor-trail-fade 0.55s ease-out forwards;
}
@keyframes cursor-trail-fade {
  0% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
}`;
  }
  return `.cursor-dot-wrap {
  position: relative;
  overflow: hidden;
}
.cursor-dot {
  position: absolute;
  width: ${p.size}px;
  height: ${p.size}px;
  border-radius: 50%;
  background: ${p.color};
  pointer-events: none;
  transform: translate(-50%, -50%);
  will-change: left, top;
}`;
}

function cursorJsBody(p: CursorPreset): string {
  const lerp = p.lerp;
  const trailInterval = 48;
  const maxDots = p.trailLength;

  if (p.mode === "trail") {
    return `
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let rafId = 0, active = false, lastSpawn = 0;
  const dots = [];
  function lerp(a, b, t) { return a + (b - a) * t; }
  function tick(now) {
    currentX = lerp(currentX, targetX, ${lerp});
    currentY = lerp(currentY, targetY, ${lerp});
    if (now - lastSpawn > ${trailInterval}) {
      lastSpawn = now;
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      dot.style.left = currentX + 'px';
      dot.style.top = currentY + 'px';
      el.appendChild(dot);
      dots.push(dot);
      dot.addEventListener('animationend', () => {
        dot.remove();
        const i = dots.indexOf(dot);
        if (i >= 0) dots.splice(i, 1);
      });
      while (dots.length > ${maxDots}) {
        const old = dots.shift();
        old?.remove();
      }
    }
    if (active) rafId = requestAnimationFrame(tick);
  }
  function onMove(e) {
    const rect = el.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    if (!active) {
      active = true;
      currentX = targetX;
      currentY = targetY;
      lastSpawn = 0;
      rafId = requestAnimationFrame(tick);
    }
  }
  function onLeave() {
    active = false;
    cancelAnimationFrame(rafId);
    dots.forEach((d) => d.remove());
    dots.length = 0;
  }
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  return () => {
    active = false;
    cancelAnimationFrame(rafId);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    dots.forEach((d) => d.remove());
  };`;
  }

  const className =
    p.mode === "glow" ? "cursor-glow" : p.mode === "ring" ? "cursor-ring" : "cursor-dot";
  const wrapClass =
    p.mode === "glow"
      ? "cursor-glow-wrap"
      : p.mode === "ring"
        ? "cursor-ring-wrap"
        : "cursor-dot-wrap";

  return `
  el.classList.add('${wrapClass}');
  const node = document.createElement('div');
  node.className = '${className}';
  el.appendChild(node);
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let rafId = 0, active = false;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function tick() {
    currentX = lerp(currentX, targetX, ${lerp});
    currentY = lerp(currentY, targetY, ${lerp});
    node.style.left = currentX + 'px';
    node.style.top = currentY + 'px';
    if (active) rafId = requestAnimationFrame(tick);
  }
  function onMove(e) {
    const rect = el.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    if (!active) {
      active = true;
      currentX = targetX;
      currentY = targetY;
      node.style.left = currentX + 'px';
      node.style.top = currentY + 'px';
      rafId = requestAnimationFrame(tick);
    }
  }
  function onLeave() {
    active = false;
    cancelAnimationFrame(rafId);
    node.style.opacity = '0';
  }
  function onEnter() {
    node.style.opacity = '1';
  }
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointerenter', onEnter);
  return () => {
    active = false;
    cancelAnimationFrame(rafId);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    el.removeEventListener('pointerenter', onEnter);
    node.remove();
  };`;
}

export function buildCursorJs(p: CursorPreset): string {
  const fnName =
    p.mode === "glow"
      ? "attachCursorGlow"
      : p.mode === "ring"
        ? "attachCursorRing"
        : p.mode === "trail"
          ? "attachCursorTrail"
          : "attachCursorDot";

  if (p.mode === "trail") {
    return `function ${fnName}(el) {
  el.classList.add('cursor-trail-wrap');${cursorJsBody(p)}
}`;
  }

  return `function ${fnName}(el) {${cursorJsBody(p)}
}`;
}

/** Sets up cursor motion preview; returns cleanup. */
export function setupCursorPreview(el: HTMLElement, preset: CursorPreset): () => void {
  el.querySelectorAll("[data-cursor-fx]").forEach((node) => node.remove());

  const hint = el.querySelector<HTMLElement>("[data-preview-hint]");
  const showHint = () => {
    if (hint) hint.style.opacity = "1";
  };
  const hideHint = () => {
    if (hint) hint.style.opacity = "0";
  };

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = 0;
  let active = false;
  let lastSpawn = 0;
  const trailDots: HTMLElement[] = [];

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const stopLoop = () => {
    active = false;
    cancelAnimationFrame(rafId);
  };

  const clearTrail = () => {
    trailDots.forEach((d) => d.remove());
    trailDots.length = 0;
  };

  if (preset.mode === "trail") {
    const tick = (now: number) => {
      currentX = lerp(currentX, targetX, preset.lerp);
      currentY = lerp(currentY, targetY, preset.lerp);
      if (now - lastSpawn > 48) {
        lastSpawn = now;
        const dot = document.createElement("div");
        dot.setAttribute("data-cursor-fx", "");
        Object.assign(dot.style, {
          position: "absolute",
          zIndex: "1",
          width: `${preset.size}px`,
          height: `${preset.size}px`,
          borderRadius: "50%",
          background: preset.color,
          pointerEvents: "none",
          left: `${currentX}px`,
          top: `${currentY}px`,
          transform: "translate(-50%, -50%)",
          animation: "cursor-trail-fade 0.55s ease-out forwards",
        });
        el.appendChild(dot);
        trailDots.push(dot);
        dot.addEventListener("animationend", () => {
          dot.remove();
          const idx = trailDots.indexOf(dot);
          if (idx >= 0) trailDots.splice(idx, 1);
        });
        while (trailDots.length > preset.trailLength) {
          trailDots.shift()?.remove();
        }
      }
      if (active) rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      hideHint();
      if (!active) {
        active = true;
        currentX = targetX;
        currentY = targetY;
        lastSpawn = 0;
        rafId = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => {
      stopLoop();
      clearTrail();
      showHint();
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      stopLoop();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      clearTrail();
      showHint();
    };
  }

  const node = document.createElement("div");
  node.setAttribute("data-cursor-fx", "");
  if (preset.mode === "glow") {
    Object.assign(node.style, {
      position: "absolute",
      zIndex: "1",
      width: `${preset.size}px`,
      height: `${preset.size}px`,
      borderRadius: "50%",
      background: preset.color,
      filter: `blur(${preset.blur}px)`,
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
      opacity: "0",
    });
  } else if (preset.mode === "ring") {
    Object.assign(node.style, {
      position: "absolute",
      zIndex: "1",
      width: `${preset.size}px`,
      height: `${preset.size}px`,
      border: `2px solid ${preset.color}`,
      borderRadius: "50%",
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
      opacity: "0",
    });
  } else {
    Object.assign(node.style, {
      position: "absolute",
      zIndex: "1",
      width: `${preset.size}px`,
      height: `${preset.size}px`,
      borderRadius: "50%",
      background: preset.color,
      pointerEvents: "none",
      transform: "translate(-50%, -50%)",
      opacity: "0",
    });
  }
  el.appendChild(node);

  const tick = () => {
    currentX = lerp(currentX, targetX, preset.lerp);
    currentY = lerp(currentY, targetY, preset.lerp);
    node.style.left = `${currentX}px`;
    node.style.top = `${currentY}px`;
    if (active) rafId = requestAnimationFrame(tick);
  };

  const onMove = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    hideHint();
    if (!active) {
      active = true;
      currentX = targetX;
      currentY = targetY;
      node.style.opacity = "1";
      node.style.left = `${currentX}px`;
      node.style.top = `${currentY}px`;
      rafId = requestAnimationFrame(tick);
    }
  };

  const onLeave = () => {
    stopLoop();
    node.style.opacity = "0";
    showHint();
  };

  const onEnter = () => {
    if (active) {
      node.style.opacity = "1";
      hideHint();
    }
  };

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("pointerenter", onEnter);

  return () => {
    stopLoop();
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("pointerenter", onEnter);
    node.remove();
    showHint();
  };
}
