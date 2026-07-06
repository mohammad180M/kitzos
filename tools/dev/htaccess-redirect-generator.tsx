"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

type RedirectStatus = "301" | "302";

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export default function HtaccessRedirectGenerator() {
  const t = useDevToolsExtraLabels("htaccessRedirectGenerator");
  const [from, setFrom] = useState("/old-page");
  const [to, setTo] = useState("/new-page");
  const [status, setStatus] = useState<RedirectStatus>("301");

  const output = useMemo(() => {
    const fromPath = normalizePath(from);
    const toPath = normalizePath(to);
    if (!fromPath || !toPath) return "";

    const flag = status === "301" ? "R=301" : "R=302";
    const fromPattern = fromPath.replace(/^\//, "");

    return [
      "RewriteEngine On",
      `RewriteRule ^${fromPattern}/?$ ${toPath} [${flag},L]`,
    ].join("\n");
  }, [from, to, status]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{t.hint}</p>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.from}</span>
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder={t.placeholderFrom}
          className="input-field ltr-input mt-1 w-full font-mono text-sm"
          dir="ltr"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.to}</span>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={t.placeholderTo}
          className="input-field ltr-input mt-1 w-full font-mono text-sm"
          dir="ltr"
        />
      </label>
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.status}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["301", "302"] as RedirectStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`btn-secondary ${status === s ? "ring-2 ring-primary-500" : ""}`}
            >
              {s === "301" ? t.redirect301 : t.redirect302}
            </button>
          ))}
        </div>
      </fieldset>
      {output && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.output}</label>
          <textarea
            value={output}
            readOnly
            rows={4}
            className="input-field ltr-input mt-1 w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
            dir="ltr"
            spellCheck={false}
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
