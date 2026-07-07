/**
 * Verifies blur-image ratio coordinate math (quadrant test + blur scaling parity).
 * Run: npx tsx scripts/verify-blur-coordinates.ts
 */
import {
  BLUR_REFERENCE_WIDTH,
  blurRadiusForCanvas,
  naturalPixelSize,
  ratioRegionToPixels,
  type BlurRegion,
} from "../lib/image/blur-regions";

let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`OK: ${msg}`);
  }
}

// Top-right quadrant on 1481 × 1000 image
const natW = 1481;
const natH = 1000;
const quadrant: BlurRegion = { id: "q", x: 0.5, y: 0, w: 0.5, h: 0.5 };

const natPx = naturalPixelSize(quadrant, natW, natH);
assert(natPx.w === 741, `natural width = 741 (got ${natPx.w})`);
assert(natPx.h === 500, `natural height = 500 (got ${natPx.h})`);

const exportPx = ratioRegionToPixels(quadrant, natW, natH);
assert(exportPx.x === 740.5, `export x = 740.5 (got ${exportPx.x})`);
assert(exportPx.y === 0, `export y = 0 (got ${exportPx.y})`);
assert(Math.abs(exportPx.w - 740.5) < 0.01, `export w ≈ 740.5 (got ${exportPx.w})`);
assert(exportPx.h === 500, `export h = 500 (got ${exportPx.h})`);

// Preview at max 600px wide: scale = 600/1481
const previewW = Math.round(natW * (600 / natW));
const previewH = Math.round(natH * (600 / natW));
const previewPx = ratioRegionToPixels(quadrant, previewW, previewH);
assert(previewPx.x === previewW / 2, `preview x = half width (${previewPx.x})`);
assert(previewPx.w === previewW / 2, `preview w = half width (${previewPx.w})`);

// Blur strength 30 at 1481px natural → effective 44.43px natural radius
const slider = 30;
const naturalRadius = (slider * natW) / BLUR_REFERENCE_WIDTH;
assert(
  Math.abs(naturalRadius - 44.43) < 0.01,
  `natural blur radius ≈ 44.43 (got ${naturalRadius.toFixed(2)})`
);

// Preview and export must use same relative blur
const previewBlur = blurRadiusForCanvas(slider, previewW, natW);
const exportBlur = blurRadiusForCanvas(slider, natW, natW);
assert(
  Math.abs(previewBlur / previewW - exportBlur / natW) < 1e-9,
  `blur scales proportionally (preview ${previewBlur.toFixed(3)}px, export ${exportBlur.toFixed(3)}px)`
);

// Old bug: storing preview pixels on 540-wide canvas for 1481px image
const buggyLabelW = 540;
const buggyLabelH = 407;
assert(
  natPx.w !== buggyLabelW,
  `labels no longer show preview px (${buggyLabelW}) — now ${natPx.w}`
);

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll blur coordinate checks passed.");
