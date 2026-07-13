/**
 * Split delimiter-bundled article dumps into content/articles/{slug}.{lang}.md
 *
 * Delimiter format:
 *   === FILE: content/articles/{guess}.{lang}.md ===
 *
 * Guessed delimiter slugs are mapped to registry PDF slugs.
 *
 * Usage:
 *   npx tsx scripts/split-article-bundle.ts path/to/02-articles-en.md path/to/03-articles-ar.md
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";

/** Map author guess → real registry slug (pdf category). */
const SLUG_MAP: Record<string, string> = {
  merge: "merge-pdf",
  "merge-pdf": "merge-pdf",
  split: "split-pdf",
  "split-pdf": "split-pdf",
  "pdf-to-jpg": "pdf-to-jpg",
  "pdf-to-image": "pdf-to-jpg",
  compress: "compress-pdf",
  "compress-pdf": "compress-pdf",
  rotate: "rotate-pdf",
  "rotate-pdf": "rotate-pdf",
  organize: "organize-pdf",
  "organize-pdf": "organize-pdf",
  "extract-pages": "extract-pages",
  extract: "extract-pages",
  sign: "pdf-sign",
  "sign-pdf": "pdf-sign",
  "pdf-sign": "pdf-sign",
  watermark: "pdf-watermark",
  "watermark-pdf": "pdf-watermark",
  "pdf-watermark": "pdf-watermark",
  protect: "pdf-protect",
  "protect-pdf": "pdf-protect",
  "pdf-protect": "pdf-protect",
};

const DELIMITER_RE =
  /^===\s*FILE:\s*content\/articles\/([^\s.]+)\.(en|ar)\.md\s*===$/gm;

function resolveSlug(guess: string): string {
  const mapped = SLUG_MAP[guess];
  if (!mapped) {
    throw new Error(
      `Unknown article delimiter slug "${guess}". Add a mapping in scripts/split-article-bundle.ts`
    );
  }
  return mapped;
}

function splitBundle(filePath: string): { slug: string; locale: string; body: string }[] {
  const raw = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const matches = Array.from(raw.matchAll(DELIMITER_RE));
  if (matches.length === 0) {
    throw new Error(`No FILE delimiters found in ${basename(filePath)}`);
  }

  const out: { slug: string; locale: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const guess = match[1];
    const locale = match[2];
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? raw.length) : raw.length;
    const body = raw.slice(start, end).replace(/^\r?\n/, "").replace(/\s+$/, "") + "\n";
    out.push({ slug: resolveSlug(guess), locale, body });
  }
  return out;
}

function main(): void {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    console.error(
      "Usage: npx tsx scripts/split-article-bundle.ts <02-articles-en.md> [03-articles-ar.md …]"
    );
    process.exit(1);
  }

  const outDir = join(process.cwd(), "content", "articles");
  mkdirSync(outDir, { recursive: true });

  let written = 0;
  for (const input of inputs) {
    const parts = splitBundle(input);
    for (const part of parts) {
      const dest = join(outDir, `${part.slug}.${part.locale}.md`);
      writeFileSync(dest, part.body, "utf8");
      console.log(`Wrote ${part.slug}.${part.locale}.md (from guess in ${basename(input)})`);
      written += 1;
    }
  }

  console.log(`Done — ${written} article file(s) in content/articles/`);
}

main();
