/**
 * Phase 1 FAQ audit — read-only. Writes docs/faq-audit.md.
 * Run: npx tsx scripts/audit-faqs.ts
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tools } from "../lib/registry";
import { getToolContent } from "../content";
import type { FaqItem } from "../lib/seo";

const PDF_ARTICLE_SLUGS = [
  "merge-pdf",
  "split-pdf",
  "pdf-to-jpg",
  "compress-pdf",
  "rotate-pdf",
  "organize-pdf",
  "extract-pages",
  "pdf-sign",
  "pdf-watermark",
  "pdf-protect",
] as const;

const TECH_JARGON_RE =
  /\b(pdf-lib|pdfjs|pdf\.js|pdfjs-dist|qpdf|wasm|webassembly|canvas\b|OffscreenCanvas|FileReader|ArrayBuffer|Uint8Array|Blob\b|Web Worker|IndexedDB|localStorage|sessionStorage|CryptoJS|spark-md5|jszip|JSZip|heic2any|gifenc|piexif|exifr|lamejs|MediaRecorder|AudioContext|Web Audio|getUserMedia|WebGL|WebAssembly|ffmpeg|tesseract|OCR engine|Sharp\b|node-canvas|DOMPurify|marked\.parse)\b/i;

const PRIVACY_Q_RE =
  /\b(safe|privacy|private|upload|uploaded|server|leave my|leave your|stored|store my|secure)\b|خصوص|آمن|رفع|خادم|يُرفع|تُرفع|محلي|يغادر|تغادر/i;

const PRIVACY_BADGE_PHRASES = [
  "runs locally — nothing is uploaded",
  "يعمل محلياً — ملفاتك لا تُرفع",
];

type Flag =
  | "TECH-JARGON"
  | "AR-QUALITY"
  | "EN-AR-MISMATCH"
  | "WRONG-CLAIM"
  | "DUPLICATE"
  | "PRIVACY-REDUNDANT"
  | "ARTICLE-OVERLAP";

interface ToolAudit {
  slug: string;
  en: FaqItem[];
  ar: FaqItem[];
  flags: Flag[];
  notes: string[];
}

function normalizeQ(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s]/g, " ")
    .replace(/\b(the|a|an|my|your|this|that|with|kitzos|online|free|pdf|image|file|files|tool)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripToolNameTokens(q: string, slug: string): string {
  const tokens = slug.split("-").filter((t) => t.length > 2);
  let out = normalizeQ(q);
  for (const t of tokens) {
    out = out.replace(new RegExp(`\\b${t}\\b`, "g"), " ");
  }
  return out.replace(/\s+/g, " ").trim();
}

function similar(a: string, b: string, threshold = 0.62): boolean {
  const na = normalizeQ(a);
  const nb = normalizeQ(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const sa = new Set(na.split(" ").filter(Boolean));
  const sb = new Set(nb.split(" ").filter(Boolean));
  if (sa.size === 0 || sb.size === 0) return false;
  let inter = 0;
  for (const t of Array.from(sa)) if (sb.has(t)) inter += 1;
  const union = sa.size + sb.size - inter;
  return inter / union >= threshold;
}

/** Topic buckets for PDF article ↔ tool FAQ overlap. */
function faqTopics(text: string): string[] {
  const t = text.toLowerCase();
  const topics: string[] = [];
  if (
    /\b(limit|how many|file size|count limit|unlimited|memory)\b|عدد|حد\b|ذاكرة|حجم/.test(t) &&
    !/\b(leave|upload|uploaded|safe|privacy)\b|يغادر|رفع|آمن|خصوص/.test(t)
  ) {
    topics.push("limit");
  } else if (/\b(limit|how many|file size|count limit)\b|عدد الملفات|حد ل|حجم أو عدد/.test(t)) {
    topics.push("limit");
  }
  if (/\b(quality|reduce quality|re-?compress|lossy|lossless)\b|جودة|يقلل من الجودة|إعادة ضغط/.test(t)) {
    topics.push("quality");
  }
  if (
    /\b(safe|upload|uploaded|privacy|private|leave my|leave your|never leave|server)\b|آمن|يُرفع|تُرفع|خصوص|يغادر|تغادر|خادم/.test(
      t
    )
  ) {
    topics.push("privacy");
  }
  if (/\b(password-protected|encrypted|unlock)\b|كلمة مرور|محمي|تشفير|فك حماي/.test(t)) {
    topics.push("password");
  }
  if (/\b(legal|legally valid|law)\b|قانون|صالح قانون/.test(t)) topics.push("legal");
  if (/\bwatermark\b|علامة مائية/.test(t)) topics.push("watermark");
  if (/\b(rotate|rotation|orientation|sideways)\b|تدوير|اتجاه|مائل/.test(t)) topics.push("rotate");
  if (/\bviewer rotation\b|تدوير العارض/.test(t)) topics.push("viewer");
  return topics;
}

function primaryTopic(text: string): string | null {
  const topics = faqTopics(text);
  // Prefer non-privacy when both fire (avoids "memory/device" bleed)
  const order = ["password", "quality", "limit", "legal", "watermark", "rotate", "viewer", "privacy"];
  for (const t of order) if (topics.includes(t)) return t;
  return null;
}

function flagArQuality(en: FaqItem[], ar: FaqItem[]): string[] {
  const notes: string[] = [];
  for (let i = 0; i < ar.length; i++) {
    const a = ar[i];
    const e = en[i];
    // Heavy Latin leftovers in AR (excluding brand/format acronyms sparingly)
    const latinWords = a.answer.match(/\b[A-Za-z]{4,}\b/g) || [];
    const suspicious = latinWords.filter(
      (w) =>
        !/^(PDF|JPG|JPEG|PNG|WEBP|GIF|HEIC|MP3|CSV|JSON|JWT|QR|HTML|CSS|URL|API|HTTP|HTTPS|ZIP|OCR|BMI|RGB|HEX|UUID|SHA|MD5|Base64|WhatsApp|Word|Adobe|DevTools|Network|Kitzos|ZIP)$/i.test(
          w
        )
    );
    if (suspicious.length >= 3) {
      notes.push(
        `AR Q${i + 1}: many Latin leftovers (${suspicious.slice(0, 5).join(", ")}…)`
      );
    }
    // Broken mixed punctuation patterns often left by MT
    if (/[?]{2,}|\?\s*\?|؟\s*\?|\?\s*؟/.test(a.question + a.answer)) {
      notes.push(`AR Q${i + 1}: broken/mixed question punctuation`);
    }
    // Extremely short AR vs long EN (possible stub/MT collapse)
    if (e && e.answer.length > 120 && a.answer.length < e.answer.length * 0.35) {
      notes.push(`AR Q${i + 1}: answer much shorter than EN (possible MT collapse)`);
    }
    // English sentence left inside AR answer
    if (/\b(the|your|files|never|uploaded|browser)\b/i.test(a.answer) && /[\u0600-\u06FF]/.test(a.answer)) {
      notes.push(`AR Q${i + 1}: mixed EN words inside Arabic answer`);
    }
  }
  return notes;
}

function flagEnArMismatch(en: FaqItem[], ar: FaqItem[]): string[] {
  const notes: string[] = [];
  if (en.length !== ar.length) {
    notes.push(`FAQ count differs: EN=${en.length} AR=${ar.length}`);
  }
  const n = Math.min(en.length, ar.length);
  for (let i = 0; i < n; i++) {
    const e = en[i].answer.toLowerCase();
    const a = ar[i].answer;

    // Numeric claims
    const enNums = e.match(/\b\d+\b/g) || [];
    const arNums = a.match(/\b\d+\b/g) || [];
    if (enNums.join(",") !== arNums.join(",") && (enNums.length > 0 || arNums.length > 0)) {
      // allow date-like noise; flag if sets differ meaningfully
      const es = new Set(enNums);
      const as = new Set(arNums);
      const onlyEn = enNums.filter((x) => !as.has(x));
      const onlyAr = arNums.filter((x) => !es.has(x));
      if (onlyEn.length || onlyAr.length) {
        notes.push(
          `Q${i + 1}: numeric mismatch EN[${enNums.join(",")}] vs AR[${arNums.join(",")}]`
        );
      }
    }

    // Yes/no polarity on limit questions
    const enNoLimit = /no (hard |imposed )?limit|unlimited|no limit/i.test(e);
    const arNoLimit = /لا\s*(يوجد\s*)?(حد|حدود)|بلا\s*حد|بدون\s*حد|لا\s*تفرض/i.test(a);
    const enHasLimit = /\blimit(ed)?\b.*(mb|pages|files|size)|max(imum)?\s*\d+/i.test(e);
    const arHasLimit = /حد\s*(أقصى|الحجم|الصفحات)|بحد\s*أقصى/i.test(a);
    if (enNoLimit && arHasLimit && !arNoLimit) {
      notes.push(`Q${i + 1}: EN says no limit, AR implies a limit`);
    }
    if (enHasLimit && arNoLimit && !enNoLimit) {
      notes.push(`Q${i + 1}: EN implies a limit, AR says no limit`);
    }

    // Upload polarity
    const enNoUpload = /never (leave|uploaded)|not uploaded|nothing is uploaded|stay on your device|in your browser/i.test(
      e
    );
    const arUploadYes = /يُرفع|تُرفع|إلى\s*خادمنا|نرفع/i.test(a) && !/لا\s*يُرفع|لا\s*تُرفع|لا\s*يُرسل|لا\s*تُرسل|أبداً/i.test(a);
    if (enNoUpload && arUploadYes) {
      notes.push(`Q${i + 1}: EN says no upload, AR may imply upload`);
    }
  }
  return notes;
}

function flagWrongClaim(slug: string, en: FaqItem[]): string[] {
  const notes: string[] = [];
  const toolPathCandidates = [
    join(process.cwd(), "tools", "pdf", `${slug}.tsx`),
    join(process.cwd(), "tools", "image", `${slug}.tsx`),
    join(process.cwd(), "tools", "text", `${slug}.tsx`),
    join(process.cwd(), "tools", "dev", `${slug}.tsx`),
    join(process.cwd(), "tools", "calculators", `${slug}.tsx`),
    join(process.cwd(), "tools", "converters", `${slug}.tsx`),
    join(process.cwd(), "tools", "misc", `${slug}.tsx`),
    join(process.cwd(), "tools", "audio", `${slug}.tsx`),
  ];
  let src = "";
  for (const p of toolPathCandidates) {
    if (existsSync(p)) {
      src = readFileSync(p, "utf8");
      break;
    }
  }

  for (let i = 0; i < en.length; i++) {
    const qa = `${en[i].question} ${en[i].answer}`;
    // Absolute "unlimited" / "no limit" while code has real processing caps
    // (ignore preview-only PAGE_CAP / thumbnail caps — those don't bound the operation)
    if (/no (hard |imposed )?limit|unlimited|as many as you (want|need)/i.test(qa) && src) {
      const srcSansPreview = src
        .replace(/PDF_PREVIEW_PAGE_CAP/g, "")
        .replace(/PREVIEW_PAGE_CAP/g, "")
        .replace(/pageCap/gi, "");
      if (
        /MAX_FILES|maxFiles\s*=|MAX_FILE_SIZE|MAX_SIZE|FILE_LIMIT|sizeLimit|MAX_PAGES\s*=|maxPages\s*=\s*\d+/i.test(
          srcSansPreview
        )
      ) {
        notes.push(
          `Q${i + 1}: FAQ says no/hard-unlimited while tool source mentions a processing cap/limit`
        );
      }
    }
    // Encryption strength bravado
    if (/military.?grade|unbreakable|impossible to (crack|brute)|AES-256/i.test(qa)) {
      notes.push(`Q${i + 1}: strong encryption claim — verify against actual protect implementation`);
    }
    // Format support claims — flag if answer lists formats not obviously in UI strings
    if (/supports?\s+[A-Z]{2,5}(,\s*[A-Z]{2,5})+/i.test(qa) && src) {
      const claimed = Array.from(qa.matchAll(/\b(HEIC|AVIF|TIFF|BMP|SVG|WEBP|GIF|PNG|JPG|JPEG|PDF|MP3|WAV|DOCX)\b/gi)).map(
        (m) => m[1].toUpperCase()
      );
      for (const fmt of claimed) {
        if (!new RegExp(fmt, "i").test(src) && !["PDF", "JPG", "JPEG", "PNG"].includes(fmt)) {
          notes.push(`Q${i + 1}: claims ${fmt} but tool source may not mention it`);
        }
      }
    }
  }
  return notes;
}

function flagTechJargon(en: FaqItem[], ar: FaqItem[]): string[] {
  const notes: string[] = [];
  const all = [
    ...en.map((f, i) => ({ locale: "EN", i, ...f })),
    ...ar.map((f, i) => ({ locale: "AR", i, ...f })),
  ];
  for (const item of all) {
    const hit = `${item.question} ${item.answer}`.match(TECH_JARGON_RE);
    if (hit) {
      notes.push(`${item.locale} Q${item.i + 1}: mentions \`${hit[0]}\``);
    }
  }
  return notes;
}

function flagPrivacyRedundant(en: FaqItem[], ar: FaqItem[]): string[] {
  const notes: string[] = [];
  const enPrivacyIdx = en
    .map((f, i) => (PRIVACY_Q_RE.test(f.question) || PRIVACY_Q_RE.test(f.answer.slice(0, 80)) ? i + 1 : 0))
    .filter(Boolean);
  const arPrivacyIdx = ar
    .map((f, i) => (PRIVACY_Q_RE.test(f.question) || PRIVACY_Q_RE.test(f.answer.slice(0, 80)) ? i + 1 : 0))
    .filter(Boolean);

  if (enPrivacyIdx.length > 1) {
    notes.push(`EN has ${enPrivacyIdx.length} privacy/safety FAQs (Q${enPrivacyIdx.join(", Q")})`);
  }
  if (arPrivacyIdx.length > 1) {
    notes.push(`AR has ${arPrivacyIdx.length} privacy/safety FAQs (Q${arPrivacyIdx.join(", Q")})`);
  }

  for (const phrase of PRIVACY_BADGE_PHRASES) {
    for (let i = 0; i < en.length; i++) {
      if (en[i].answer.toLowerCase().includes(phrase.toLowerCase())) {
        notes.push(`EN Q${i + 1}: duplicates PrivacyBadge phrasing`);
      }
    }
    for (let i = 0; i < ar.length; i++) {
      if (ar[i].answer.includes(phrase)) {
        notes.push(`AR Q${i + 1}: duplicates PrivacyBadge phrasing`);
      }
    }
  }
  return notes;
}

function extractArticleFaqPairs(slug: string, locale: "en" | "ar"): { q: string; a: string }[] {
  const path = join(process.cwd(), "content", "articles", `${slug}.${locale}.md`);
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf8");
  const heading =
    locale === "en"
      ? /^##\s+Common questions\s*$/im
      : /^##\s+أسئلة شائعة\s*$/im;
  const match = raw.split(heading);
  if (match.length < 2) return [];
  const section = match[1].split(/^##\s+/m)[0];
  const pairs: { q: string; a: string }[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
    if (m) pairs.push({ q: m[1].replace(/[؟?]$/, "").trim(), a: m[2].trim() });
  }
  return pairs;
}

function flagArticleOverlap(slug: string, en: FaqItem[], ar: FaqItem[]): string[] {
  if (!(PDF_ARTICLE_SLUGS as readonly string[]).includes(slug)) return [];
  const notes: string[] = [];
  const articleEn = extractArticleFaqPairs(slug, "en");
  const articleAr = extractArticleFaqPairs(slug, "ar");

  for (let i = 0; i < en.length; i++) {
    const toolPrimary = primaryTopic(`${en[i].question} ${en[i].answer}`);
    for (const aq of articleEn) {
      if (similar(en[i].question, aq.q, 0.55)) {
        notes.push(`EN Q${i + 1} overlaps article FAQ wording: “${aq.q}?”`);
        continue;
      }
      const artPrimary = primaryTopic(`${aq.q} ${aq.a}`);
      if (toolPrimary && artPrimary && toolPrimary === artPrimary) {
        notes.push(
          `EN Q${i + 1} topic-overlaps article (“${aq.q}?”) on [${toolPrimary}]`
        );
      }
    }
  }
  for (let i = 0; i < ar.length; i++) {
    const toolPrimary = primaryTopic(`${ar[i].question} ${ar[i].answer}`);
    for (const aq of articleAr) {
      if (similar(ar[i].question, aq.q, 0.55)) {
        notes.push(`AR Q${i + 1} overlaps article FAQ wording: “${aq.q}؟”`);
        continue;
      }
      const artPrimary = primaryTopic(`${aq.q} ${aq.a}`);
      if (toolPrimary && artPrimary && toolPrimary === artPrimary) {
        notes.push(
          `AR Q${i + 1} topic-overlaps article (“${aq.q}؟”) on [${toolPrimary}]`
        );
      }
    }
  }
  return notes;
}

function main(): void {
  const audits: ToolAudit[] = [];

  for (const tool of tools) {
    const en = getToolContent(tool.slug, "en").faq;
    const ar = getToolContent(tool.slug, "ar").faq;
    audits.push({ slug: tool.slug, en, ar, flags: [], notes: [] });
  }

  // DUPLICATE across tools — keep at most a few exemplar partners per question
  const dupSeen = new Set<string>();
  for (let i = 0; i < audits.length; i++) {
    const a = audits[i];
    for (let qi = 0; qi < a.en.length; qi++) {
      const q = a.en[qi].question;
      const ans = a.en[qi].answer;
      const isGenericPrivacy =
        /is (it|my|the).*(safe|uploaded|private)|uploaded to a server|leave my (device|computer)|files uploaded/i.test(
          q
        ) && /browser|never leave|not uploaded|locally|nothing is uploaded/i.test(ans);
      const isGenericPassword =
        /password-protected|encrypted files/i.test(q) &&
        /unlock|does not support encrypted|password/i.test(ans);

      let partners = 0;
      for (let j = i + 1; j < audits.length && partners < 4; j++) {
        const b = audits[j];
        for (let qj = 0; qj < b.en.length; qj++) {
          const q2 = b.en[qj].question;
          const ans2 = b.en[qj].answer;
          const stripA = stripToolNameTokens(q, a.slug);
          const stripB = stripToolNameTokens(q2, b.slug);
          const pairKey = `${a.slug}#${qi}|${b.slug}#${qj}`;
          if (dupSeen.has(pairKey)) continue;

          let hit = false;
          if (
            isGenericPrivacy &&
            /safe|uploaded|private|server|device|leave/i.test(q2) &&
            /browser|never leave|not uploaded|locally|nothing is uploaded/i.test(ans2)
          ) {
            hit = true;
            a.notes.push(`DUPLICATE privacy filler EN Q${qi + 1} ≈ ${b.slug} Q${qj + 1}`);
            b.notes.push(`DUPLICATE privacy filler EN Q${qj + 1} ≈ ${a.slug} Q${qi + 1}`);
          } else if (
            isGenericPassword &&
            /password-protected|encrypted/i.test(q2) &&
            /unlock|does not support encrypted|password/i.test(ans2)
          ) {
            hit = true;
            a.notes.push(`DUPLICATE password filler EN Q${qi + 1} ≈ ${b.slug} Q${qj + 1}`);
            b.notes.push(`DUPLICATE password filler EN Q${qj + 1} ≈ ${a.slug} Q${qi + 1}`);
          } else if (stripA.split(" ").length >= 4 && similar(stripA, stripB, 0.78)) {
            const ansA = normalizeQ(ans);
            const ansB = normalizeQ(ans2);
            const sa = new Set(ansA.split(" ").filter((t) => t.length > 3));
            const sb = new Set(ansB.split(" ").filter((t) => t.length > 3));
            let inter = 0;
            for (const t of Array.from(sa)) if (sb.has(t)) inter += 1;
            const union = sa.size + sb.size - inter || 1;
            if (inter / union >= 0.55) {
              hit = true;
              a.notes.push(`DUPLICATE-ish EN Q${qi + 1} ≈ ${b.slug} Q${qj + 1} (“${q}”)`);
            }
          }
          if (hit) {
            dupSeen.add(pairKey);
            partners += 1;
            if (partners >= 4) break;
          }
        }
      }
    }
  }

  for (const audit of audits) {
    const flagSet = new Set<Flag>();

    const tech = flagTechJargon(audit.en, audit.ar);
    if (tech.length) {
      flagSet.add("TECH-JARGON");
      audit.notes.push(...tech);
    }

    const arq = flagArQuality(audit.en, audit.ar);
    if (arq.length) {
      flagSet.add("AR-QUALITY");
      audit.notes.push(...arq);
    }

    const mismatch = flagEnArMismatch(audit.en, audit.ar);
    if (mismatch.length) {
      flagSet.add("EN-AR-MISMATCH");
      audit.notes.push(...mismatch);
    }

    const wrong = flagWrongClaim(audit.slug, audit.en);
    if (wrong.length) {
      flagSet.add("WRONG-CLAIM");
      audit.notes.push(...wrong);
    }

    if (audit.notes.some((n) => n.startsWith("DUPLICATE"))) {
      flagSet.add("DUPLICATE");
    }

    const priv = flagPrivacyRedundant(audit.en, audit.ar);
    if (priv.length) {
      flagSet.add("PRIVACY-REDUNDANT");
      audit.notes.push(...priv);
    }

    const overlap = flagArticleOverlap(audit.slug, audit.en, audit.ar);
    if (overlap.length) {
      flagSet.add("ARTICLE-OVERLAP");
      audit.notes.push(...overlap);
    }

    audit.flags = Array.from(flagSet);
  }

  // Deduplicate notes
  for (const a of audits) {
    a.notes = Array.from(new Set(a.notes));
  }

  const lines: string[] = [];
  lines.push("# FAQ Audit Report (Phase 1 — read-only)");
  lines.push("");
  lines.push(`Generated: 2026-07-13`);
  lines.push(`Tools audited: ${audits.length}`);
  lines.push("");
  lines.push(
    "Source: `getToolContent(slug, locale)` → EN `content/*.ts` + `content/extra-tools.ts`; AR `locales/content.ar.json` + `locales/extra-content.ar.json`."
  );
  lines.push("");
  lines.push("### Methodology (heuristic — review before Phase 2)");
  lines.push("");
  lines.push(
    "- **TECH-JARGON:** regex for library/API names (`pdf-lib`, `pdf.js`, `canvas`, `wasm`, `MediaRecorder`, …) in Q or A."
  );
  lines.push(
    "- **AR-QUALITY:** Latin leftovers in AR answers, mixed EN words, collapsed length vs EN, broken `?`/`؟` mixes. Soft signal — not a native-speaker review."
  );
  lines.push(
    "- **EN-AR-MISMATCH:** FAQ count drift, differing numerals, limit/upload polarity conflicts."
  );
  lines.push(
    "- **WRONG-CLAIM:** FAQ “no limit” vs real processing caps in `tools/**` (preview-only caps ignored); strong encryption bravado; format claims missing from source."
  );
  lines.push(
    "- **DUPLICATE:** cross-tool near-identical privacy/password fillers (exemplar partners capped); or high question+answer similarity after stripping tool-name tokens."
  );
  lines.push(
    "- **PRIVACY-REDUNDANT:** >1 privacy/safety FAQ on the same tool, or verbatim PrivacyBadge phrasing."
  );
  lines.push(
    "- **ARTICLE-OVERLAP (PDF×10 only):** tool FAQ vs article “Common questions / أسئلة شائعة” — wording similarity or matching primary topic (privacy/limit/quality/password/…)."
  );
  lines.push("");
  lines.push(
    "Flags: `TECH-JARGON` · `AR-QUALITY` · `EN-AR-MISMATCH` · `WRONG-CLAIM` · `DUPLICATE` · `PRIVACY-REDUNDANT` · `ARTICLE-OVERLAP`"
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const audit of audits) {
    lines.push(`## ${audit.slug}`);
    lines.push("");
    const count = Math.max(audit.en.length, audit.ar.length);
    if (count === 0) {
      lines.push("_No FAQ entries._");
      lines.push("");
    }
    for (let i = 0; i < count; i++) {
      const en = audit.en[i];
      const ar = audit.ar[i];
      lines.push(`### Q${i + 1}`);
      lines.push("");
      lines.push(`**EN Q:** ${en?.question ?? "_(missing)_"}`);
      lines.push("");
      lines.push(`**EN A:** ${en?.answer ?? "_(missing)_"}`);
      lines.push("");
      lines.push(`**AR Q:** ${ar?.question ?? "_(missing)_"}`);
      lines.push("");
      lines.push(`**AR A:** ${ar?.answer ?? "_(missing)_"}`);
      lines.push("");
    }
    const flagLine =
      audit.flags.length > 0 ? audit.flags.join(", ") : "(none)";
    lines.push(`**FLAGS:** ${flagLine}`);
    if (audit.notes.length) {
      lines.push("");
      lines.push("Notes:");
      for (const n of audit.notes) {
        lines.push(`- ${n}`);
      }
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Summary
  const flagCounts: Record<Flag, number> = {
    "TECH-JARGON": 0,
    "AR-QUALITY": 0,
    "EN-AR-MISMATCH": 0,
    "WRONG-CLAIM": 0,
    DUPLICATE: 0,
    "PRIVACY-REDUNDANT": 0,
    "ARTICLE-OVERLAP": 0,
  };
  for (const a of audits) {
    for (const f of a.flags) flagCounts[f] += 1;
  }

  const sorted = [...audits].sort((a, b) => b.flags.length - a.flags.length || a.slug.localeCompare(b.slug));

  lines.push("## Summary");
  lines.push("");
  lines.push("### Flag totals (tools with flag)");
  lines.push("");
  lines.push("| Flag | Tools |");
  lines.push("|---|---:|");
  for (const [flag, n] of Object.entries(flagCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${flag} | ${n} |`);
  }
  lines.push("");
  lines.push("### Slug × flags (sorted by flag count desc)");
  lines.push("");
  lines.push("| Slug | # | Flags |");
  lines.push("|---|---:|---|");
  for (const a of sorted) {
    lines.push(
      `| ${a.slug} | ${a.flags.length} | ${a.flags.length ? a.flags.join(", ") : "—"} |`
    );
  }
  lines.push("");
  lines.push(
    `_Phase 1 only — no content rewrites. Review and specify Phase 2 fixes._`
  );

  const outPath = join(process.cwd(), "docs", "faq-audit.md");
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(
    `Flagged tools: ${audits.filter((a) => a.flags.length).length}/${audits.length}`
  );
  console.log(flagCounts);
}

main();
