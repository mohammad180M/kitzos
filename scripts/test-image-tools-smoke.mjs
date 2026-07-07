/**
 * Headless smoke tests for the 8 new image tools (Part 1).
 * Run: node scripts/test-image-tools-smoke.mjs
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import gifencPkg from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifencPkg;

function rgbToHex({ r, g, b }) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}
function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const TMP = join(process.cwd(), ".tmp-smoke");
mkdirSync(TMP, { recursive: true });

const results = [];

function pass(slug, detail) {
  results.push({ slug, ok: true, detail });
}
function fail(slug, detail) {
  results.push({ slug, ok: false, detail });
}

// 1. crop-image (circle mode) — export PNG with alpha via round mask
try {
  const size = 120;
  const src = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 80, g: 160, b: 240 } },
  })
    .png()
    .toBuffer();
  const r = Math.floor(size * 0.4);
  const cx = size / 2;
  const cy = size / 2;
  const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/></svg>`;
  const out = await sharp(src)
    .composite([{ input: Buffer.from(circleSvg), blend: "dest-in" }])
    .png()
    .toBuffer();
  const meta = await sharp(out).metadata();
  const hasAlpha = meta.channels === 4;
  const outPath = join(TMP, "crop-image-circle.png");
  writeFileSync(outPath, out);
  if (hasAlpha && out.length > 200) pass("crop-image", `circle PNG ${out.length}B with alpha`);
  else fail("crop-image", `unexpected output channels=${meta.channels}`);
} catch (e) {
  fail("crop-image", String(e));
}

// 2. heic-to-jpg
try {
  const heicPath = join(TMP, "sample.heic");
  if (!existsSync(heicPath)) {
    const urls = [
      "https://github.com/alexcorvi/heic2any/raw/master/example/1.heic",
      "https://raw.githubusercontent.com/strukturag/libheif/main/examples/clock.heic",
    ];
    let downloaded = false;
    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) continue;
      writeFileSync(heicPath, Buffer.from(await res.arrayBuffer()));
      downloaded = true;
      break;
    }
    if (!downloaded) throw new Error("no sample HEIC available (404)");
  }
  const heic2any = (await import("heic2any")).default;
  const blob = new Blob([readFileSync(heicPath)], { type: "image/heic" });
  const converted = await heic2any({ blob, toType: "image/jpeg", quality: 0.85 });
  const jpgBuf = Buffer.from(await (Array.isArray(converted) ? converted[0] : converted).arrayBuffer());
  writeFileSync(join(TMP, "heic-out.jpg"), jpgBuf);
  const meta = await sharp(jpgBuf).metadata();
  if (meta.format === "jpeg" && jpgBuf.length > 500) pass("heic-to-jpg", `JPEG ${jpgBuf.length}B ${meta.width}x${meta.height}`);
  else fail("heic-to-jpg", `bad format ${meta.format}`);
} catch (e) {
  fail("heic-to-jpg", `needs-manual-test or env issue: ${e.message ?? e}`);
}

// 3. flip-image
try {
  const w = 40;
  const h = 20;
  const raw = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    raw[i] = x < w / 2 ? 255 : 0;
    raw[i + 1] = 0;
    raw[i + 2] = 0;
  }
  const flipped = await sharp(raw, { raw: { width: w, height: h, channels: 3 } }).flop().png().toBuffer();
  const { data } = await sharp(flipped).raw().toBuffer({ resolveWithObject: true });
  const leftBlack = data[0] < 50;
  if (leftBlack) pass("flip-image", "horizontal flip verified (red moved to right)");
  else fail("flip-image", "flip did not mirror as expected");
} catch (e) {
  fail("flip-image", String(e));
}

// 4. blur-image — pixelate region
try {
  const w = 60;
  const h = 60;
  const raw = Buffer.alloc(w * h * 3, 200);
  for (let y = 20; y < 40; y++) for (let x = 20; x < 40; x++) {
    const i = (y * w + x) * 3;
    raw[i] = 20; raw[i + 1] = 20; raw[i + 2] = 20;
  }
  const block = 8;
  const region = await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left: 20, top: 20, width: 20, height: 20 })
    .resize(Math.floor(20 / block), Math.floor(20 / block), { kernel: "nearest" })
    .resize(20, 20, { kernel: "nearest" })
    .raw()
    .toBuffer();
  const varied = new Set();
  for (let i = 0; i < region.length; i += 3) varied.add(region[i]);
  if (varied.size <= 4) pass("blur-image", `pixelate region → ${varied.size} distinct values`);
  else fail("blur-image", `pixelate not uniform enough (${varied.size} values)`);
} catch (e) {
  fail("blur-image", String(e));
}

// 5. image-watermark — composite text
try {
  const base = await sharp({
    create: { width: 200, height: 100, channels: 3, background: "#4488cc" },
  }).png().toBuffer();
  const svg = `<svg width="200" height="100"><text x="50" y="55" font-size="24" fill="rgba(255,255,255,0.5)" transform="rotate(-30 50 55)">KITZOS</text></svg>`;
  const out = await sharp(base).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();
  if (out.length > base.length) pass("image-watermark", `composited PNG ${out.length}B`);
  else fail("image-watermark", "composite unchanged size");
} catch (e) {
  fail("image-watermark", String(e));
}

// 6. image-color-picker
try {
  const hex = rgbToHex({ r: 255, g: 128, b: 0 });
  const hsl = rgbToHsl({ r: 255, g: 128, b: 0 });
  if (hex === "#FF8000" && hsl.h === 30) pass("image-color-picker", `HEX=${hex} HSL h=${hsl.h}`);
  else fail("image-color-picker", `got ${hex} h=${hsl.h}`);
} catch (e) {
  fail("image-color-picker", String(e));
}

// 7. passport-photo — 35x45mm @ 300dpi ≈ 413x531px
try {
  const dpi = 300;
  const wMm = 35;
  const hMm = 45;
  const wPx = Math.round((wMm / 25.4) * dpi);
  const hPx = Math.round((hMm / 25.4) * dpi);
  const photo = await sharp({
    create: { width: wPx, height: hPx, channels: 3, background: "#ffffff" },
  }).png().toBuffer();
  const sheetW = 1200;
  const sheetH = 1800;
  const sheet = await sharp({
    create: { width: sheetW, height: sheetH, channels: 3, background: "#ffffff" },
  })
    .composite([{ input: photo, top: 20, left: 20 }])
    .png()
    .toBuffer();
  const meta = await sharp(sheet).metadata();
  if (wPx === 413 && hPx === 531 && meta.width === sheetW) pass("passport-photo", `single ${wPx}x${hPx}, sheet ${sheetW}x${sheetH}`);
  else fail("passport-photo", `dims ${wPx}x${hPx} sheet ${meta.width}`);
} catch (e) {
  fail("passport-photo", String(e));
}

// 8. gif-maker — 5 frames @ 200ms + 20-frame encode timing
try {
  const makeFrame = (color) => {
    const w = 32;
    const h = 32;
    const raw = Buffer.alloc(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      raw[i * 4] = color[0];
      raw[i * 4 + 1] = color[1];
      raw[i * 4 + 2] = color[2];
      raw[i * 4 + 3] = 255;
    }
    return { data: new Uint8ClampedArray(raw), width: w, height: h };
  };

  const encode = (frameCount) => {
    const gif = GIFEncoder();
    const delayCs = 20; // 200ms
    const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255]];
    const t0 = performance.now();
    for (let i = 0; i < frameCount; i++) {
      const { data, width, height } = makeFrame(colors[i % colors.length]);
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);
      gif.writeFrame(index, width, height, { palette, delay: delayCs, dispose: 2 });
    }
    gif.finish();
    const ms = performance.now() - t0;
    return { bytes: gif.bytes(), ms };
  };

  const small = encode(5);
  writeFileSync(join(TMP, "gif-5.gif"), small.bytes);
  const big = encode(20);
  if (small.bytes.length > 100 && small.bytes[0] === 0x47) {
    pass("gif-maker", `5 frames → ${small.bytes.length}B in ${small.ms.toFixed(0)}ms; 20 frames → ${big.ms.toFixed(0)}ms`);
  } else fail("gif-maker", "invalid GIF header");
} catch (e) {
  fail("gif-maker", String(e));
}

console.log("\n| Tool | Result | Detail |");
console.log("|------|--------|--------|");
for (const r of results) {
  console.log(`| ${r.slug} | ${r.ok ? "PASS" : "FAIL"} | ${r.detail} |`);
}
const failed = results.filter((r) => !r.ok).length;
process.exit(failed > 0 ? 1 : 0);
