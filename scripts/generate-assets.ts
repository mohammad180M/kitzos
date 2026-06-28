import { copyFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { categories } from "../lib/categories";
import { generateLlmsTxt } from "../lib/llms-txt";
import { tools } from "../lib/registry";
import { buildLocalizedUrl, getSiteUrl } from "../lib/seo";

const publicDir = join(process.cwd(), "public");
const appDir = join(process.cwd(), "app");
const ogDir = join(publicDir, "og");
const sourceIcon = join(publicDir, "icon-512.png");

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

  copyFileSync(faviconPath, join(appDir, "favicon.ico"));
}

async function main(): Promise<void> {
  mkdirSync(ogDir, { recursive: true });
  await generateFavicons();

  copyFileSync(join(publicDir, "icon-512.png"), join(ogDir, "default.png"));
  for (const category of categories) {
    copyFileSync(join(publicDir, "icon-512.png"), join(ogDir, `category-${category.id}.png`));
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
    <title>kitzos — Free Online Tools</title>
    <link>${siteUrl}/en/</link>
    <description>Latest free browser-based tools on kitzos.</description>
    <language>en</language>
${feedItems}
  </channel>
</rss>
`;

  writeFileSync(join(publicDir, "feed.xml"), feed, "utf8");

  console.log(
    `Generated assets: favicons (16–512 + apple 180 + favicon.ico), llms.txt, feed.xml, og/default.png + ${categories.length} category OG images (${tools.length} tools in feed)`
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
