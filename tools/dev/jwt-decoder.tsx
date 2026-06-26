"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { decodeJwt, getTimeClaims, type JwtDecodeError } from "@/lib/jwt-decode";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

type CopyTarget = "header" | "payload" | null;

export default function JwtDecoder() {
  const { locale, t } = useLocale();
  const labels = useCommonLabels();
  const ui = t.jwtDecoder;
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState<CopyTarget>(null);

  const result = useMemo(() => {
    if (!token.trim()) return { decoded: null, error: null as JwtDecodeError | null };
    try {
      return { decoded: decodeJwt(token), error: null as JwtDecodeError | null };
    } catch (err) {
      const code =
        err instanceof Error && err.message
          ? (err.message as JwtDecodeError)
          : ("INVALID_PARTS" as JwtDecodeError);
      return { decoded: null, error: code };
    }
  }, [token]);

  const timeClaims = useMemo(
    () => (result.decoded ? getTimeClaims(result.decoded.payload, locale) : []),
    [result.decoded, locale]
  );

  const errorMessage = result.error ? ui.errors[result.error] : null;

  const copyText = async (text: string, target: CopyTarget) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(target);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignored
    }
  };

  const claimLabel = (key: string) => {
    if (key === "exp") return ui.claimExp;
    if (key === "iat") return ui.claimIat;
    if (key === "nbf") return ui.claimNbf;
    return key;
  };

  return (
    <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        role="note"
      >
        <p className="font-medium">{ui.securityNoticeTitle}</p>
        <p className="mt-1">{ui.securityNotice}</p>
      </div>

      <div>
        <label htmlFor="jwt-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {ui.tokenLabel}
        </label>
        <textarea
          id="jwt-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={ui.tokenPlaceholder}
          rows={4}
          className="input-field mt-1 resize-y font-mono text-sm"
          spellCheck={false}
          autoComplete="off"
          dir="ltr"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      {result.decoded && (
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="jwt-header" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {ui.header}
              </label>
              <button
                type="button"
                onClick={() => void copyText(result.decoded!.headerFormatted, "header")}
                className="btn-secondary inline-flex items-center gap-1.5 py-1.5 text-xs"
              >
                {copied === "header" ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {labels.copied}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {ui.copyHeader}
                  </>
                )}
              </button>
            </div>
            <pre
              id="jwt-header"
              className="overflow-x-auto rounded-lg bg-gray-100 p-3 font-mono text-sm text-emerald-800 dark:bg-gray-800 dark:text-emerald-300"
            >
              {result.decoded.headerFormatted}
            </pre>
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="jwt-payload" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {ui.payload}
              </label>
              <button
                type="button"
                onClick={() => void copyText(result.decoded!.payloadFormatted, "payload")}
                className="btn-secondary inline-flex items-center gap-1.5 py-1.5 text-xs"
              >
                {copied === "payload" ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {labels.copied}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {ui.copyPayload}
                  </>
                )}
              </button>
            </div>
            <pre
              id="jwt-payload"
              className="overflow-x-auto rounded-lg bg-gray-100 p-3 font-mono text-sm text-sky-800 dark:bg-gray-800 dark:text-sky-300"
            >
              {result.decoded.payloadFormatted}
            </pre>

            {timeClaims.length > 0 && (
              <ul className="mt-2 space-y-1.5 rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                {timeClaims.map(({ key, info }) => (
                  <li key={key} className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {claimLabel(key)}:
                    </span>
                    <span className="font-mono text-gray-600 dark:text-gray-400">{info.unix}</span>
                    <span className="text-gray-500 dark:text-gray-400">→ {info.readable}</span>
                    {info.expired && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                        {ui.expired}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="jwt-signature" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {ui.signature}
            </label>
            <pre
              id="jwt-signature"
              className="mt-1 overflow-x-auto break-all rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {result.decoded.signature}
            </pre>
          </div>
        </div>
      )}

      {token && (
        <button
          type="button"
          onClick={() => setToken("")}
          className="btn-secondary"
        >
          {labels.clear}
        </button>
      )}
    </div>
  );
}
