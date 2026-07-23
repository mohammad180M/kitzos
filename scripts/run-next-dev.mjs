/**
 * Launch `next dev` with an isolated distDir so `npm run build` cannot
 * corrupt the running development cache (shared `.next` → 500 / missing chunks).
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

process.env.NEXT_DIST_DIR = ".next-dev";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
