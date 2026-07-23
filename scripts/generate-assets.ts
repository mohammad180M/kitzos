/**
 * Generates favicons, OG images, llms.txt, feed.xml; validates article locale pairs.
 * Run via: npm run generate:assets (also hooked by dev/build).
 */
import { mkdirSync, writeFileSync, cpSync, existsSync, rmSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { listArticleSlugs, validateArticleLocalePairs } from "../lib/articles";
import { categories } from "../lib/categories";
import { generateLlmsTxt } from "../lib/llms-txt";
import { tools } from "../lib/registry";
import { buildLocalizedUrl, getSiteUrl } from "../lib/seo";
import toolsAr from "../locales/tools.ar.json";
import extraToolsAr from "../locales/extra-tools.ar.json";

const publicDir = join(process.cwd(), "public");
const ogDir = join(publicDir, "og");
const sourceIcon = join(publicDir, "icon-512.png");
const pdfjsSrc = join(process.cwd(), "node_modules", "pdfjs-dist");
const pdfjsPublic = join(publicDir, "pdfjs");

/** Copy PDF.js cMaps + standard fonts so getDocument can resolve fonts client-side. */
function syncPdfjsAssets(): void {
  const cmapsSrc = join(pdfjsSrc, "cmaps");
  const fontsSrc = join(pdfjsSrc, "standard_fonts");
  if (!existsSync(cmapsSrc) || !existsSync(fontsSrc)) {
    throw new Error(
      "pdfjs-dist cmaps/standard_fonts missing — run npm install and retry generate:assets."
    );
  }

  if (existsSync(pdfjsPublic)) {
    rmSync(pdfjsPublic, { recursive: true, force: true });
  }
  mkdirSync(pdfjsPublic, { recursive: true });
  cpSync(cmapsSrc, join(pdfjsPublic, "cmaps"), { recursive: true });
  cpSync(fontsSrc, join(pdfjsPublic, "standard_fonts"), { recursive: true });
  console.log("Synced PDF.js assets to public/pdfjs (cmaps + standard_fonts).");
}

async function generateFavicons(): Promise<void> {
  const sourceBuffer = await sharp(sourceIcon).toBuffer();
  const pngSizes = [16, 32, 48, 192, 512] as const;

  for (const size of pngSizes) {
    await sharp(sourceBuffer)
      .resize(size, size, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(join(publicDir, `icon-${size}.png`));
  }

  await sharp(sourceBuffer)
    .resize(180, 180, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, "apple-touch-icon.png"));

  const faviconPath = join(publicDir, "favicon.ico");
  await sharp(sourceBuffer).resize(48, 48, { fit: "cover" }).toFile(faviconPath);
}

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_BG = { r: 37, g: 99, b: 235, alpha: 1 };

async function generateOgImage(outputPath: string, sourceBuffer: Buffer): Promise<void> {
  const logoSize = 320;
  const logo = await sharp(sourceBuffer)
    .resize(logoSize, logoSize, { fit: "cover" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 4, background: OG_BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function main(): Promise<void> {
  mkdirSync(ogDir, { recursive: true });
  syncPdfjsAssets();
  const sourceBuffer = await sharp(sourceIcon).toBuffer();
  await generateFavicons();

  await generateOgImage(join(ogDir, "default.png"), sourceBuffer);
  for (const category of categories) {
    await generateOgImage(join(ogDir, `category-${category.id}.png`), sourceBuffer);
  }

  writeFileSync(join(publicDir, "llms.txt"), generateLlmsTxt(), "utf8");

  const siteUrl = getSiteUrl();
  const feedItems = tools
    .map((tool) => {
      const url = buildLocalizedUrl("en", `/tools/${tool.slug}`);
      return `    <item>
      <title>${escapeXml(tool.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(tool.description)}</description>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>kitzos — Kitzos Tools</title>
    <link>${siteUrl}/en/</link>
    <description>Latest free browser-based tools on kitzos.</description>
    <language>en</language>
${feedItems}
  </channel>
</rss>
`;

  writeFileSync(join(publicDir, "feed.xml"), feed, "utf8");

  generateRegistryLite();
  validateArticles();

  console.log(
    `Generated assets: favicons (16–512 + apple 180 + favicon.ico), llms.txt, feed.xml, og/default.png + ${categories.length} category OG images (${tools.length} tools in feed)`
  );
}

function validateArticles(): void {
  const errors = validateArticleLocalePairs();
  if (errors.length > 0) {
    console.error("Article locale validation failed:\n");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    console.error(
      "\nAdd the missing content/articles/{slug}.{locale}.md file(s) and rebuild."
    );
    process.exit(1);
  }
  const slugs = listArticleSlugs();
  console.log(
    `Article locale validation passed (${slugs.length} slug(s) × 2 locales).`
  );
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type ToolAr = { title: string; description: string; keywords?: string[] };
const toolsArMap = {
  ...(toolsAr as Record<string, ToolAr>),
  ...(extraToolsAr as Record<string, ToolAr>),
};

function generateRegistryLite(): void {
  const liteTools = tools.map((tool) => {
    const ar = toolsArMap[tool.slug];
    if (!ar) {
      throw new Error(`registry-lite: missing Arabic labels for slug "${tool.slug}"`);
    }
    return {
      slug: tool.slug,
      category: tool.category,
      icon: tool.icon,
      title: tool.title,
      description: tool.description,
      keywords: tool.keywords,
      titleAr: ar.title,
      descriptionAr: ar.description,
      keywordsAr: ar.keywords ?? [],
      ...(tool.isNew ? { isNew: true } : {}),
    };
  });

  const body = `// Generated by scripts/generate-assets.ts — do not edit manually.
import type { CategoryId } from "./categories";

export interface ToolLite {
  slug: string;
  category: CategoryId;
  icon: string;
  title: string;
  description: string;
  keywords: string[];
  titleAr: string;
  descriptionAr: string;
  keywordsAr: string[];
  isNew?: boolean;
}

export const toolsLite: ToolLite[] = ${JSON.stringify(liteTools, null, 2)} as ToolLite[];

export function getToolBySlugLite(slug: string): ToolLite | undefined {
  return toolsLite.find((t) => t.slug === slug);
}

export function getToolsByCategoryLite(category: CategoryId): ToolLite[] {
  return toolsLite.filter((t) => t.category === category);
}
`;

  writeFileSync(join(process.cwd(), "lib", "registry-lite.ts"), body, "utf8");
  console.log(`Generated lib/registry-lite.ts (${liteTools.length} tools)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
