Canonical location: docs/ARCHITECTURE.md — this repo copy is the source of truth from now on.

# KITZOS — Platform Architecture & Context File
**Version:** 2.2 · **Last updated:** 2026-07-13 · **This file is the single source of truth for any AI session working on kitzos. Read fully before touching code.**

---

## 1. Identity

- **Product:** kitzos.com — free browser-based tools platform. All processing is client-side; no files are ever uploaded to a server.
- **Owner:** Bosala Technology (Mohammad, solo developer, Cursor-driven workflow).
- **Positioning:** privacy-first precision tools ("Instrument Panel" identity). Not a content site, not an ad farm.
- **Scale:** 103 tools · 8 categories · bilingual (EN default + AR) · ~256 static pages (includes 20 PDF tool guide articles when present).

## 2. Stack & Deployment

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), **static export** (`output: 'export'`, `trailingSlash: true`) |
| Styling | Tailwind + CSS-variable token system (see §7) |
| Client storage | localStorage (`kitzos-*` keys) — always written as JSON, read via `lib/safe-json.ts` |
| Hosting | Cloudflare Pages — build `npm run build`, output `out/`, NODE_VERSION=20 |
| Repo hygiene | `out/`, `.next/`, `.next/analyze/` gitignored; releases tagged (`v2.0.0`+) |

**Build pipeline (exact chain — never bypass a step):**
```
generate:assets  →  validate-i18n-keys  →  next build  →  fix-html-lang
```
- `generate:assets` also emits `lib/registry-lite.ts` (client projection of the registry) and fails the build if any slug lacks Arabic labels. It also validates article locale pairs (`content/articles/{slug}.{en|ar}.md` — mismatch fails the build).
- `validate-i18n-keys` fails the build on EN/AR key mismatch.
- `fix-html-lang.ts` patches `lang`/`dir` on every exported `out/**/index.html`. Arabic pages MUST export with `lang="ar" dir="rtl"`.
- Bundle analyzer available: `ANALYZE=true npm run build` → `.next/analyze/client.html`.

## 3. Routing & i18n

- Locale routes: `app/[lang]/…` — separate static trees for `/en/` and `/ar/`. Arabic is fully exported HTML (SEO-visible), NOT a client overlay.
- Root `/`: thin shim — crawler links (sr-only) + inline pre-paint locale redirect script (localStorage `kitzos-lang`, else `navigator.languages`; `?stay=1` skips). Canonical of `/` → `https://kitzos.com/en/`; x-default → `/en/`.
- Locale switch is a navigation (full remount). The **unsaved-work guard** (§8) intercepts it.
- Tool URLs: `/{lang}/tools/{slug}/` — **slugs never change**. Category is NOT in the URL (category moves are metadata-only).
- Tool guide articles (document identity): `/{lang}/tools/{slug}/article/` — markdown in `content/articles/{slug}.{lang}.md`, server `fs` only (never client-bundled). Currently shipped for the 10 PDF tools.

## 4. Tool System (the core architecture)

**Registry chain (single source of truth → projections):**
```
lib/registry.ts (full: titles, descriptions, keywords, category — EN)
 ├─ locales/tools.ar.json (AR labels per slug)
 ├─ lib/registry-lite.ts  (BUILD-GENERATED — client-safe subset; never hand-edit)
 └─ lib/tool-order.ts     (explicit per-category order, all slugs listed)
```
- **Server components** (pages, ToolLayout, seo, sitemap) read the FULL registry.
- **Client components** (search, Footer, chips, cards) read ONLY `registry-lite`. The full registry and AR content JSON must never enter client bundles.

**Loading chain (per-tool code splitting — do not restructure):**
```
page.tsx (server) → ToolLayout (server: breadcrumbs, SEO, how-to, FAQ, related)
  → ToolSlot (client island, next/dynamic)
    → import(`lib/tool-entries/${slug}`)  → one thin entry file
      → dynamic(() => import("@/tools/…"), { ssr:false, loading: ToolSkeleton })
```
- Every tool component is `"use client"` and renders ONLY interactive UI. All SEO content renders server-side in ToolLayout.
- Heavy libraries (pdf-lib, pdfjs-dist, jszip, gifenc, heic2any, spark-md5) are dynamically imported at point of use, memoized. **Never top-level value imports** (type-only imports are fine).
- Achieved numbers (guard them): tool-route page chunk ~16 KB raw; First Load JS ~139 KB; each tool in its own async chunk.

## 5. Categories (8) & Counts (103)

| id | AR label | count | color |
|---|---|---|---|
| pdf | أدوات PDF | 10 | #F87171 |
| image | أدوات الصور | 15 | #34D399 |
| text | أدوات النصوص | 16 | #60A5FA |
| dev | أدوات المطورين | 29 | #A78BFA |
| calculators | الحاسبات | 14 | #A3E635 |
| converters | محولات الوحدات | 10 | #2DD4BF |
| misc | منوعات | 5 | #F472B6 |
| audio | أدوات الصوت | 4 | #FB923C |

- PDF order: merge, split, pdf-to-jpg (bidirectional PDF⇄images), compress, rotate, organize, extract-pages, sign, watermark, protect.
- The `vision` category was dissolved (image-to-text deleted; `/vision/` 301s → home).
- misc contains: pomodoro, stopwatch, random-picker, typing-speed-test, signature-pad.

## 6. Golden Rules (violations have caused real regressions — enforce)

1. **Slugs and URLs never change.** Category/order/title changes are fine; slug changes are not.
2. **Deletions and merges always ship a single-hop absolute 301** in `public/_redirects` (final URL with trailing slash). No redirect chains, no rule targeting another redirect. Indexed pages are never silently dropped.
3. **UI is for the user; SEO lives in metadata.** Tool names = 2–3-word function descriptors. Keyword variants go in descriptions/keywords, never in visible titles.
4. **One tool, one function.** Before adding a tool, check overlap with existing ones. Overlaps are resolved by merging (mode/toggle inside one tool + 301) or by splitting cleanly with cross-links — never duplicated capabilities in two tools (past offenders: rotate/flip, blur/pixelate, unit/temperature, line-breaks/whitespace).
5. **Mono is Latin+digits only.** IBM Plex Mono has no Arabic glyphs — any Arabic label uses IBM Plex Sans Arabic (`.label-mono` handles the swap under RTL). Exception: `CTRL K` kbd stays Latin.
6. **Coordinates are ratios.** Any preview interaction (drag, regions, crop, placement) stores positions/sizes as 0–1 ratios of the image/page and projects to preview and natural-resolution export separately. Effect strengths scale with natural size so preview == export. (pdf-lib origin is bottom-left — convert.)
7. **Privacy messaging exists in exactly one place:** `PrivacyBadge` mounted once in ToolLayout. Never add per-tool privacy notices.
8. **Diagnose root cause before fixing.** No per-tool patching of a systemic symptom; capture evidence (stack trace, git diff, analyzer) first.
9. **Global styles never leak into tool internals.** No base-layer element selectors that restyle inputs/buttons inside tools; scope via explicit classes.
10. **Every change ends with:** `npm run build` clean (i18n validation is part of it) + counts verified + grep for removed slugs (only `_redirects` hits allowed).

## 7. Design System — "Instrument Panel"

**Tokens (CSS vars, dark is reference):**
- Dark: `--bg #0B0E14`, `--surface #121722`, `--surface-2 #182031`, `--line #1F2733`, `--text #E8ECF2`, `--text-secondary #C6CEDB`, `--muted #A9B4C6`, `--accent #FFB020` (amber), `--accent-ink #1A1205`, `--success #4ADE80`, `--success-tint` (~8% success).
- Light: `--bg #F7F8FA`, `--surface #FFFFFF`, `--surface-2 #F0F2F6`, `--line #E4E8EF`, `--text #14181F`, `--text-secondary #3A424F`, `--muted #4C5665`, `--success #22C55E`, `--success-tint` (~8% success).
- Contrast floor: body text ≥ 4.5:1 on its surface. Fix failures at the TOKEN level.
- Zero hardcoded hex/gray-* in components — tokens only.

**Type:** Archivo (Latin display 600–800) · IBM Plex Sans (Latin body) · IBM Plex Sans Arabic (AR display+body) · IBM Plex Mono (labels/counts/kbd — Latin only). Loaded via next/font, display:swap.

**Page-type identities:**
- **Home:** command-bar hero (search + Ctrl/Cmd+K), blueprint micro-grid background (home hero ONLY), category chips with color dots, tool cards with 3px category-color spine.
- **Tool page ("workbench"):** category-color top rule, PrivacyBadge, workbench card as visual center; below it: ad frame, then how-to/FAQ in narrow documentation style; related tools grid.
- **Category page ("drawer"):** header tinted with the category color (~6%).
- **Info/legal ("document"):** narrow quiet reading layout. Tool guide articles use the same document family (~70ch, category-color top rule, CTA to the tool). **404:** minimal mono.
- Category filter on home: clicking a section h2 filters in place (like chips); dedicated category pages remain for SEO. Filtered category view shows ALL its tools (no pagination); pagination applies only in ALL view.

## 8. Shared Components & Behaviors (reuse — never reimplement)

| Component | Purpose |
|---|---|
| `components/pdf/PdfPreviewPane` + `lib/pdf/thumbnails.ts` | Result-preview grid for all PDF tools (lazy render, 50-page cap, one pdfjs doc per file) |
| `components/image/FixedFrameCropper` | Instagram-model crop: FIXED frame, image pans/zooms behind (clamped cover) — used by crop-image, passport-photo |
| Drag-overlay pattern (pdf-sign origin) | Draggable/resizable overlays (signature, watermark, text layers) — ratios + setPointerCapture |
| `lib/unsaved-work.ts` (`useUnsavedWork`) | Global dirty flag: language-toggle confirm dialog + single beforeunload handler. Wired in every tool holding real work |
| Confirm dialog | Portal to body, centered overlay, focus trap, RTL-aware — used by the guard and destructive mode switches |
| `PrivacyBadge` | §6 rule 7 |
| `lib/safe-json.ts` | All storage parsing goes through safeJsonParse |
| `ToolSkeleton` | Loading state for all tool entries |

**Tool workbench convention:** empty state = single centered drop zone (nothing else); loaded state = two columns on lg+ (`controls left, preview right` — same sides in both locales), stacked on mobile with controls first. Free-text inputs use `dir="auto"`; technical outputs/syntax inputs use `.ltr-input`.

## 9. SEO

- Sitemap generated at build (per-locale tool + category + info pages + article guides). Canonical per page; hreflang en/ar + x-default→en everywhere.
- FAQPage + HowTo JSON-LD render server-side from content files on **tool** pages. FAQ standard: 4 real questions per tool, EN+AR, reflecting actual behavior. Article pages use Article JSON-LD only (do not duplicate HowTo/FAQ there).
- `public/_redirects`: legacy non-locale URLs + every deleted/merged slug → single-hop absolute finals. HTTP→HTTPS adds one inherent hop (Cloudflare, acceptable). www needs a Cloudflare dashboard CNAME+301 (apex is canonical).
- GSC status (2026-06-30 export): ~203 indexed; "crawled/discovered not indexed" is Google-side — improves with traffic, not code.

## 10. Ads

- Provider: **Adsterra banners only** (desktop 728×90, mobile 300×100) — never popunders/social bar/push. Keys in `lib/ads-config.ts`.
- One ad per tool page, inside the labeled ad frame (`<aside>`: caption "هذا الإعلان يساعدنا نقدّم كل الأدوات مجاناً 💙" + reserved min-height = zero CLS). Ads don't load on localhost.
- Legal pages reference "third-party advertising partners (currently Adsterra)".
- AdSense: rejected once (low value). Re-application planned after indexing/traffic matures; block Gambling/Adult categories in Adsterra before any review window. NEVER click own ads.

## 11. Adding / Removing a Tool (checklist)

**Add:** overlap check (§6.4) → registry entry (short name!) + tools.ar.json → content how-to + 4 FAQs (EN+AR) → `tools/{category}/{slug}.tsx` ("use client", dynamic heavy imports, useUnsavedWork, tokens, dir rules) → `lib/tool-entries/{slug}.ts` → tool-order position → build (counts, sitemap, registry-lite auto) → functional smoke + AR/EN spot-check.

**Remove/merge:** absorb logic if merging → delete registry/order/entries/content/ar.json/component → 301s (en+ar) → uninstall now-unused deps → build passes i18n validation (proves no orphan keys) → grep slug: only `_redirects` hits → counts verified.

---
*Any statement in an older architecture file that conflicts with this one is obsolete. When the platform changes structurally (new category, new shared component, pipeline change), update THIS file in the same commit.*