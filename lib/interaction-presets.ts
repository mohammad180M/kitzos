export interface RipplePreset {
  id: string;
  name: string;
  color: string;
  duration: number;
  size: number;
  scale: number;
  easing: string;
}

export interface CursorPreset {
  id: string;
  name: string;
  description: string;
  color: string;
  size: number;
  trailLength: number;
  blur: number;
  mode: "dot" | "trail" | "glow" | "ring";
}

export const RIPPLE_PRESETS: RipplePreset[] = [
  { id: "material", name: "Material", color: "#2563eb80", duration: 600, size: 80, scale: 4, easing: "ease-out" },
  { id: "soft", name: "Soft light", color: "#ffffff50", duration: 500, size: 70, scale: 3.5, easing: "ease-out" },
  { id: "ink", name: "Dark ink", color: "#00000030", duration: 700, size: 90, scale: 4.5, easing: "cubic-bezier(0, 0, 0.2, 1)" },
  { id: "neon", name: "Neon pulse", color: "#06b6d480", duration: 450, size: 60, scale: 3, easing: "ease-out" },
  { id: "minimal", name: "Minimal", color: "#6366f140", duration: 300, size: 50, scale: 2.5, easing: "ease-in-out" },
];

export const CURSOR_PRESETS: CursorPreset[] = [
  { id: "dot", name: "Dot follower", description: "Smooth dot tracks the pointer", color: "#2563eb", size: 12, trailLength: 0, blur: 0, mode: "dot" },
  { id: "trail", name: "Motion trail", description: "Fading dots behind the cursor", color: "#8b5cf6", size: 8, trailLength: 12, blur: 0, mode: "trail" },
  { id: "glow", name: "Spotlight", description: "Soft glow follows movement", color: "#f59e0b60", size: 120, trailLength: 0, blur: 24, mode: "glow" },
  { id: "ring", name: "Magnetic ring", description: "Ring eases toward the cursor", color: "#10b981", size: 40, trailLength: 0, blur: 0, mode: "ring" },
];

export function buildRippleCss(p: RipplePreset): string {
  return `.ripple-target {
  position: relative;
  overflow: hidden;
}
.ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-anim ${p.duration}ms ${p.easing};
  pointer-events: none;
  background: ${p.color};
}
@keyframes ripple-anim {
  to { transform: scale(${p.scale}); opacity: 0; }
}`;
}

export function buildRippleJs(p: RipplePreset): string {
  return `function attachRipple(el, size = ${p.size}) {
  el.classList.add('ripple-target');
  el.addEventListener('pointerdown', (e) => {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = el.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height, size);
    r.style.width = r.style.height = d + 'px';
    r.style.left = (e.clientX - rect.left - d / 2) + 'px';
    r.style.top = (e.clientY - rect.top - d / 2) + 'px';
    el.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
}`;
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
  transition: left 0.08s ease-out, top 0.08s ease-out;
  will-change: left, top;
}`;
  }
  if (p.mode === "ring") {
    return `.cursor-ring-wrap {
  position: relative;
}
.cursor-ring {
  position: absolute;
  width: ${p.size}px;
  height: ${p.size}px;
  border: 2px solid ${p.color};
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}`;
  }
  if (p.mode === "trail") {
    return `.cursor-trail-wrap {
  position: relative;
}
.cursor-trail-dot {
  position: absolute;
  width: ${p.size}px;
  height: ${p.size}px;
  border-radius: 50%;
  background: ${p.color};
  pointer-events: none;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: trail-fade 0.5s ease-out forwards;
}
@keyframes trail-fade {
  0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
}`;
  }
  return `.cursor-dot-wrap {
  position: relative;
}
.cursor-dot {
  position: absolute;
  width: ${p.size}px;
  height: ${p.size}px;
  border-radius: 50%;
  background: ${p.color};
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.05s linear, top 0.05s linear;
}`;
}

export function buildCursorJs(p: CursorPreset): string {
  if (p.mode === "glow") {
    return `function attachCursorGlow(el) {
  el.classList.add('cursor-glow-wrap');
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  el.appendChild(glow);
  el.addEventListener('pointermove', (e) => {
    const rect = el.getBoundingClientRect();
    glow.style.left = (e.clientX - rect.left) + 'px';
    glow.style.top = (e.clientY - rect.top) + 'px';
  });
}`;
  }
  if (p.mode === "ring") {
    return `function attachCursorRing(el) {
  el.classList.add('cursor-ring-wrap');
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  el.appendChild(ring);
  el.addEventListener('pointermove', (e) => {
    const rect = el.getBoundingClientRect();
    ring.style.left = (e.clientX - rect.left) + 'px';
    ring.style.top = (e.clientY - rect.top) + 'px';
  });
}`;
  }
  if (p.mode === "trail") {
    return `function attachCursorTrail(el, maxDots = ${p.trailLength}) {
  el.classList.add('cursor-trail-wrap');
  let last = 0;
  el.addEventListener('pointermove', (e) => {
    const now = Date.now();
    if (now - last < 40) return;
    last = now;
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    const rect = el.getBoundingClientRect();
    dot.style.left = (e.clientX - rect.left) + 'px';
    dot.style.top = (e.clientY - rect.top) + 'px';
    el.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
    while (el.querySelectorAll('.cursor-trail-dot').length > maxDots) {
      el.querySelector('.cursor-trail-dot')?.remove();
    }
  });
}`;
  }
  return `function attachCursorDot(el) {
  el.classList.add('cursor-dot-wrap');
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  el.appendChild(dot);
  el.addEventListener('pointermove', (e) => {
    const rect = el.getBoundingClientRect();
    dot.style.left = (e.clientX - rect.left) + 'px';
    dot.style.top = (e.clientY - rect.top) + 'px';
  });
}`;
}
