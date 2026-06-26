import { copyFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { categories } from "../lib/categories";
import { generateLlmsTxt } from "../lib/llms-txt";
import { tools } from "../lib/registry";
import { buildLocalizedUrl, getSiteUrl } from "../lib/seo";

const publicDir = join(process.cwd(), "public");
const ogDir = join(publicDir, "og");
const icon512 = join(publicDir, "icon-512.png");

mkdirSync(ogDir, { recursive: true });
copyFileSync(icon512, join(ogDir, "default.png"));
for (const category of categories) {
  copyFileSync(icon512, join(ogDir, `category-${category.id}.png`));
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
  `Generated assets: llms.txt, feed.xml, og/default.png + ${categories.length} category OG images (${tools.length} tools in feed)`
);

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
