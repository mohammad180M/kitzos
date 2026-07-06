/**
 * Verifies all registry tools have a tool-entry module and static route output.
 * Run: npx tsx scripts/verify-tools-checklist.ts
 */
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { tools } from "../lib/registry";

const root = process.cwd();
let pass = 0;
let fail = 0;
const failures: string[] = [];

for (const tool of tools) {
  const entry = join(root, "lib", "tool-entries", `${tool.slug}.ts`);
  const enOut = join(root, "out", "en", "tools", tool.slug, "index.html");
  const arOut = join(root, "out", "ar", "tools", tool.slug, "index.html");

  const entryOk = existsSync(entry);
  const enOk = existsSync(enOut);
  const arOk = existsSync(arOut);
  const ok = entryOk && enOk && arOk;

  if (ok) {
    pass++;
    console.log(`PASS  ${tool.slug}`);
  } else {
    fail++;
    const reasons = [
      !entryOk && "missing tool-entry",
      !enOk && "missing en export",
      !arOk && "missing ar export",
    ]
      .filter(Boolean)
      .join(", ");
    failures.push(`${tool.slug}: ${reasons}`);
    console.log(`FAIL  ${tool.slug} — ${reasons}`);
  }
}

console.log(`\n${pass}/${tools.length} pass, ${fail} fail`);
if (failures.length) {
  process.exitCode = 1;
}
