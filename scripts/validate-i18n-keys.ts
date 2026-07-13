/**
 * Validates that i18n hook label keys used in tools exist in EN/AR dictionaries.
 * Run via: npm run build.
 */
import { calcToolsEn, calcToolsAr } from "../lib/i18n/calc-tools";
import { textToolsEn, textToolsAr } from "../lib/i18n/text-tools";
import { devToolsExtraEn, devToolsExtraAr } from "../lib/i18n/dev-tools-extra";
import { imageToolsExtraEn, imageToolsExtraAr } from "../lib/i18n/image-tools-extra";
import { miscToolsExtraEn, miscToolsExtraAr } from "../lib/i18n/misc-tools-extra";
import { audioToolsEn, audioToolsAr } from "../lib/i18n/audio-tools";
import { pdfToolsEn, pdfToolsAr } from "../lib/i18n/pdf-tools";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const HOOK_MAP: Record<string, { en: Record<string, unknown>; ar: Record<string, unknown>; prefix: string }> = {
  useCalcToolLabels: { en: calcToolsEn, ar: calcToolsAr, prefix: "useCalcToolLabels" },
  useTextToolLabels: { en: textToolsEn, ar: textToolsAr, prefix: "useTextToolLabels" },
  usePdfToolLabels: { en: pdfToolsEn, ar: pdfToolsAr, prefix: "usePdfToolLabels" },
  useDevToolsExtraLabels: { en: devToolsExtraEn, ar: devToolsExtraAr, prefix: "useDevToolsExtraLabels" },
  useImageToolsExtraLabels: { en: imageToolsExtraEn, ar: imageToolsExtraAr, prefix: "useImageToolsExtraLabels" },
  useMiscToolsExtraLabels: { en: miscToolsExtraEn, ar: miscToolsExtraAr, prefix: "useMiscToolsExtraLabels" },
  useAudioToolLabels: { en: audioToolsEn, ar: audioToolsAr, prefix: "useAudioToolLabels" },
};

function walkTools(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTools(p));
    else if (entry.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const toolsDir = join(process.cwd(), "tools");
const files = walkTools(toolsDir);
let issues = 0;

for (const file of files) {
  const src = readFileSync(file, "utf8");
  for (const [hook, { en, ar }] of Object.entries(HOOK_MAP)) {
    const re = new RegExp(`${hook}\\("([^"]+)"\\)`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const key = m[1];
      const enVal = en[key];
      const arVal = ar[key];
      if (!enVal) {
        console.error(`MISSING EN key "${key}" for ${hook} in ${file}`);
        issues++;
      }
      if (!arVal) {
        console.error(`MISSING AR key "${key}" for ${hook} in ${file}`);
        issues++;
      }
      if (enVal && arVal && typeof enVal === "object" && typeof arVal === "object") {
        const enFields = Object.keys(enVal as object).sort();
        const arFields = Object.keys(arVal as object).sort();
        if (JSON.stringify(enFields) !== JSON.stringify(arFields)) {
          console.error(`FIELD MISMATCH "${key}" in ${file}`);
          console.error(`  EN only: ${enFields.filter((k) => !arFields.includes(k)).join(", ")}`);
          console.error(`  AR only: ${arFields.filter((k) => !enFields.includes(k)).join(", ")}`);
          issues++;
        }
      }
    }
  }
}

if (issues) {
  console.error(`\n${issues} issue(s) found`);
  process.exit(1);
}
console.log("All i18n keys validated OK");
