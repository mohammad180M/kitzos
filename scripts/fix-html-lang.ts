/**
 * Post-export pass: set html lang/dir on static pages under out/.
 * Run via: npm run build (after next build).
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const outDir = join(process.cwd(), "out");

function collectIndexHtml(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      collectIndexHtml(fullPath, files);
    } else if (entry === "index.html") {
      files.push(fullPath);
    }
  }
  return files;
}

function localeFromPath(relativePath: string): "ar" | "en" {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.includes("/ar/") || normalized.endsWith("/ar/index.html")) {
    return "ar";
  }
  return "en";
}

function patchHtmlLang(filePath: string): boolean {
  const relative = filePath.slice(outDir.length);
  const locale = localeFromPath(relative);
  const dir = locale === "ar" ? "rtl" : "ltr";
  const content = readFileSync(filePath, "utf8");

  const patched = content.replace(
    /<html lang="en" dir="ltr">/g,
    `<html lang="${locale}" dir="${dir}">`
  );

  if (patched === content) return false;
  writeFileSync(filePath, patched, "utf8");
  return true;
}

const files = collectIndexHtml(outDir);
let updated = 0;

for (const file of files) {
  if (patchHtmlLang(file)) updated++;
}

console.log(`Fixed html lang/dir on ${updated} of ${files.length} static pages.`);
