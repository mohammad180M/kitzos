/**
 * Approximates browser canvas.toBlob compression (sharp re-encode proxy).
 * Run: node scripts/test-compress-sizes.mjs
 */
import sharp from "sharp";
import { randomBytes } from "crypto";

const w = 3000;
const h = 2000;
const raw = randomBytes(w * h * 3);
const jpegOriginal = await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
  .jpeg({ quality: 92 })
  .toBuffer();

console.log("=== JPEG photo (~5 MB noisy) ===");
console.log("Original:", jpegOriginal.length, "bytes", `(${(jpegOriginal.length / 1024 / 1024).toFixed(2)} MB)`);

for (const q of [100, 80]) {
  const out = await sharp(jpegOriginal).jpeg({ quality: q }).toBuffer();
  const keep = out.length >= jpegOriginal.length;
  console.log(
    `Q${q}%:`,
    out.length,
    `(${(out.length / 1024 / 1024).toFixed(2)} MB)`,
    keep ? "→ KEEP ORIGINAL branch" : `→ saved ${Math.round((1 - out.length / jpegOriginal.length) * 100)}%`
  );
}

const pngScreenshot = await sharp(jpegOriginal).png({ compressionLevel: 6 }).toBuffer();
const pngReencode = await sharp(pngScreenshot).png().toBuffer();
const pngToJpeg80 = await sharp(pngScreenshot).jpeg({ quality: 80 }).toBuffer();

console.log("\n=== PNG screenshot ===");
console.log("Original PNG:", pngScreenshot.length, `(${(pngScreenshot.length / 1024 / 1024).toFixed(2)} MB)`);
console.log(
  "PNG→PNG re-encode:",
  pngReencode.length,
  pngReencode.length >= pngScreenshot.length ? "→ KEEP ORIGINAL (fake compression)" : "smaller"
);
console.log(
  "PNG→JPEG Q80% (toggle on):",
  pngToJpeg80.length,
  `(${(pngToJpeg80.length / 1024 / 1024).toFixed(2)} MB)`,
  `→ saved ${Math.round((1 - pngToJpeg80.length / pngScreenshot.length) * 100)}% vs PNG`
);
