/**
 * Downloads OFL/Apache watermark fonts into public/fonts/watermark/.
 * Run: node scripts/fetch-watermark-fonts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ttf2woff2 from "ttf2woff2";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "fonts", "watermark");
const RAW = "https://raw.githubusercontent.com/google/fonts/main";

/** Known-good direct URLs (static Regular preferred). */
const FONTS = [
  { id: "inter", label: "Inter", style: "sans", arabic: false, license: "OFL", urls: [`${RAW}/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf`] },
  { id: "roboto", label: "Roboto", style: "sans", arabic: false, license: "Apache-2.0", urls: ["https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Regular.ttf"] },
  { id: "open-sans", label: "Open Sans", style: "sans", arabic: false, license: "OFL", urls: [`${RAW}/ofl/opensans/OpenSans%5Bwdth%2Cwght%5D.ttf`] },
  { id: "montserrat", label: "Montserrat", style: "sans", arabic: false, license: "OFL", urls: [`${RAW}/ofl/montserrat/Montserrat%5Bwght%5D.ttf`] },
  { id: "lato", label: "Lato", style: "sans", arabic: false, license: "OFL", urls: [`${RAW}/ofl/lato/Lato-Regular.ttf`] },
  { id: "poppins", label: "Poppins", style: "sans", arabic: false, license: "OFL", urls: [`${RAW}/ofl/poppins/Poppins-Regular.ttf`] },
  { id: "nunito", label: "Nunito", style: "rounded", arabic: false, license: "OFL", urls: [`${RAW}/ofl/nunito/Nunito%5Bwght%5D.ttf`] },
  { id: "source-sans-3", label: "Source Sans 3", style: "sans", arabic: false, license: "OFL", urls: [`${RAW}/ofl/sourcesans3/SourceSans3%5Bwght%5D.ttf`] },
  { id: "comfortaa", label: "Comfortaa", style: "rounded", arabic: false, license: "OFL", urls: [`${RAW}/ofl/comfortaa/Comfortaa%5Bwght%5D.ttf`] },
  { id: "oswald", label: "Oswald", style: "condensed", arabic: false, license: "OFL", urls: [`${RAW}/ofl/oswald/Oswald%5Bwght%5D.ttf`] },
  { id: "barlow-condensed", label: "Barlow Condensed", style: "condensed", arabic: false, license: "OFL", urls: [`${RAW}/ofl/barlowcondensed/BarlowCondensed-Regular.ttf`] },
  { id: "playfair-display", label: "Playfair Display", style: "serif", arabic: false, license: "OFL", urls: [`${RAW}/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf`] },
  { id: "merriweather", label: "Merriweather", style: "serif", arabic: false, license: "OFL", urls: [`${RAW}/ofl/merriweather/Merriweather-Regular.ttf`, `${RAW}/ofl/merriweather/static/Merriweather-Regular.ttf`] },
  { id: "libre-baskerville", label: "Libre Baskerville", style: "serif", arabic: false, license: "OFL", urls: [`${RAW}/ofl/librebaskerville/LibreBaskerville-Regular.ttf`] },
  { id: "roboto-slab", label: "Roboto Slab", style: "slab", arabic: false, license: "Apache-2.0", urls: [`${RAW}/apache/robotoslab/RobotoSlab%5Bwght%5D.ttf`] },
  { id: "zilla-slab", label: "Zilla Slab", style: "slab", arabic: false, license: "OFL", urls: [`${RAW}/ofl/zillaslab/ZillaSlab-Regular.ttf`] },
  { id: "roboto-mono", label: "Roboto Mono", style: "mono", arabic: false, license: "Apache-2.0", urls: [`${RAW}/apache/robotomono/RobotoMono%5Bwght%5D.ttf`] },
  { id: "source-code-pro", label: "Source Code Pro", style: "mono", arabic: false, license: "OFL", urls: [`${RAW}/ofl/sourcecodepro/SourceCodePro%5Bwght%5D.ttf`] },
  { id: "ibm-plex-mono", label: "IBM Plex Mono", style: "mono", arabic: false, license: "OFL", urls: [`${RAW}/ofl/ibmplexmono/IBMPlexMono-Regular.ttf`] },
  { id: "space-grotesk", label: "Space Grotesk", style: "display", arabic: false, license: "OFL", urls: [`${RAW}/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf`] },
  { id: "bebas-neue", label: "Bebas Neue", style: "display", arabic: false, license: "OFL", urls: [`${RAW}/ofl/bebasneue/BebasNeue-Regular.ttf`] },
  { id: "anton", label: "Anton", style: "display", arabic: false, license: "OFL", urls: [`${RAW}/ofl/anton/Anton-Regular.ttf`] },
  { id: "pacifico", label: "Pacifico", style: "script", arabic: false, license: "OFL", urls: [`${RAW}/ofl/pacifico/Pacifico-Regular.ttf`] },
  { id: "dancing-script", label: "Dancing Script", style: "script", arabic: false, license: "OFL", urls: [`${RAW}/ofl/dancingscript/DancingScript%5Bwght%5D.ttf`] },
  { id: "great-vibes", label: "Great Vibes", style: "script", arabic: false, license: "OFL", urls: [`${RAW}/ofl/greatvibes/GreatVibes-Regular.ttf`] },
  { id: "special-elite", label: "Special Elite", style: "stencil", arabic: false, license: "OFL", urls: [`${RAW}/ofl/specialelite/SpecialElite-Regular.ttf`] },
  { id: "cairo", label: "Cairo", style: "sans", arabic: true, license: "OFL", urls: [`${RAW}/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf`] },
  { id: "tajawal", label: "Tajawal", style: "sans", arabic: true, license: "OFL", urls: [`${RAW}/ofl/tajawal/Tajawal-Regular.ttf`] },
  { id: "almarai", label: "Almarai", style: "sans", arabic: true, license: "OFL", urls: [`${RAW}/ofl/almarai/Almarai-Regular.ttf`] },
  { id: "amiri", label: "Amiri", style: "serif", arabic: true, license: "OFL", urls: [`${RAW}/ofl/amiri/Amiri-Regular.ttf`] },
  { id: "changa", label: "Changa", style: "display", arabic: true, license: "OFL", urls: [`${RAW}/ofl/changa/Changa%5Bwght%5D.ttf`] },
];

async function fetchBuf(url, ms = 45000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 1000 ? buf : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function writePair(id, ttf) {
  const ttfPath = path.join(OUT, `${id}.ttf`);
  const woffPath = path.join(OUT, `${id}.woff2`);
  fs.writeFileSync(ttfPath, ttf);
  try {
    if (ttf.length > 2_500_000) {
      // Variable fonts too large for reliable ttf2woff2 — preview falls back to TTF.
      fs.copyFileSync(ttfPath, woffPath.replace(/\.woff2$/, ".preview.ttf"));
      console.log(`  skip woff2 (large ${ttf.length}); preview uses TTF`);
      return { usedTtfPreview: true };
    }
    const woff = ttf2woff2(ttf);
    fs.writeFileSync(woffPath, woff);
    console.log(`  ok ttf=${ttf.length} woff2=${woff.length}`);
    return { usedTtfPreview: false };
  } catch (e) {
    console.warn(`  woff2 failed: ${e.message}; preview uses TTF`);
    return { usedTtfPreview: true };
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const catalog = [];
  const licenses = [
    "# Watermark font licenses",
    "",
    "Self-hosted static assets for Kitzos `pdf-watermark`. No Google Fonts CDN at runtime.",
    "",
  ];

  for (const font of FONTS) {
    const ttfPath = path.join(OUT, `${font.id}.ttf`);
    const woffPath = path.join(OUT, `${font.id}.woff2`);
    const previewTtf = path.join(OUT, `${font.id}.preview.ttf`);
    let usedTtfPreview = fs.existsSync(previewTtf) && !fs.existsSync(woffPath);

    if (fs.existsSync(ttfPath) && (fs.existsSync(woffPath) || usedTtfPreview)) {
      console.log(`skip ${font.id} (exists)`);
    } else {
      console.log(`Fetching ${font.id}…`);
      let ttf = null;
      for (const url of font.urls) {
        console.log(`  ${url}`);
        ttf = await fetchBuf(url);
        if (ttf) break;
      }
      if (!ttf) {
        console.error(`FAILED ${font.id}`);
        process.exitCode = 1;
        continue;
      }
      const result = writePair(font.id, ttf);
      usedTtfPreview = result.usedTtfPreview;
    }

    const woff2 = usedTtfPreview
      ? `/fonts/watermark/${font.id}.ttf`
      : fs.existsSync(woffPath)
        ? `/fonts/watermark/${font.id}.woff2`
        : `/fonts/watermark/${font.id}.ttf`;

    catalog.push({
      id: font.id,
      label: font.label,
      family: `Wm_${font.id.replace(/-/g, "_")}`,
      style: font.style,
      arabic: font.arabic,
      license: font.license,
      woff2,
      ttf: `/fonts/watermark/${font.id}.ttf`,
    });
    licenses.push(`- **${font.label}** (\`${font.id}\`): ${font.license}`);
  }

  fs.writeFileSync(path.join(OUT, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT, "LICENSES.md"), licenses.join("\n") + "\n");
  console.log(`Catalog: ${catalog.length} fonts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
