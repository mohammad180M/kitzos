"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

function loadSparkMd5() {
  return import("spark-md5");
}

let sparkMd5Promise: ReturnType<typeof loadSparkMd5> | undefined;

function getSparkMd5() {
  if (!sparkMd5Promise) sparkMd5Promise = loadSparkMd5();
  return sparkMd5Promise;
}

async function md5Hash(text: string): Promise<string> {
  const { default: SparkMD5 } = await getSparkMd5();
  const bytes = new TextEncoder().encode(text);
  return SparkMD5.ArrayBuffer.hash(bytes.buffer);
}

type HashAlgo = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

interface HashResult {
  algo: HashAlgo;
  value: string;
}

async function shaHash(algo: "SHA-1" | "SHA-256" | "SHA-512", text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function computeHashes(text: string): Promise<HashResult[]> {
  const md5 = await md5Hash(text);
  const [sha1, sha256, sha512] = await Promise.all([
    shaHash("SHA-1", text),
    shaHash("SHA-256", text),
    shaHash("SHA-512", text),
  ]);

  return [
    { algo: "MD5", value: md5 },
    { algo: "SHA-1", value: sha1 },
    { algo: "SHA-256", value: sha256 },
    { algo: "SHA-512", value: sha512 },
  ];
}

export default function HashGenerator() {
  const t = useDevToolsExtraLabels("hashGenerator");
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const updateHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes([]);
      return;
    }
    setHashes(await computeHashes(text));
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => updateHashes(input), 150);
    return () => window.clearTimeout(id);
  }, [input, updateHashes]);

  const copy = async (algo: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(algo);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="hash-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.inputText}
        </label>
        <textarea
          id="hash-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={t.placeholder}
          className="input-field ltr-input mt-1 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      {hashes.length > 0 && (
        <div className="space-y-2">
          {hashes.map(({ algo, value }) => (
            <div
              key={algo}
              className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 dark:border-gray-700"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{algo}</p>
                <p className="mt-0.5 break-all font-mono text-sm text-gray-900 dark:text-gray-100">{value}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(algo, value)}
                className="shrink-0 rounded p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={`${t.copyAlgo} ${algo}`}
              >
                {copied === algo ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
