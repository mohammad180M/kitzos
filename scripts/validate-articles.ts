/**
 * Build-time check: every article slug must exist in both EN and AR.
 * Failures exit with code 1 so generate:assets / build stop early.
 */
import { validateArticleLocalePairs, listArticleSlugs } from "../lib/articles";

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
