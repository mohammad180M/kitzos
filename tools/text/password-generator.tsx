"use client";

import { useCallback, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

type Strength = "weak" | "fair" | "good" | "strong";

function getCharset(opts: {
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
}): string {
  let charset = "";
  if (opts.upper) charset += UPPER;
  if (opts.lower) charset += LOWER;
  if (opts.numbers) charset += NUMBERS;
  if (opts.symbols) charset += SYMBOLS;
  return charset;
}

function getStrength(password: string, length: number): Strength {
  let score = 0;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return "weak";
  if (score <= 2) return "fair";
  if (score <= 3) return "good";
  return "strong";
}

const strengthColors: Record<Strength, string> = {
  weak: "bg-red-500",
  fair: "bg-orange-400",
  good: "bg-yellow-400",
  strong: "bg-green-500",
};

const strengthLabels: Record<Strength, string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(() => {
    const charset = getCharset({ upper, lower, numbers, symbols });
    if (!charset) {
      setError("Enable at least one character type.");
      return;
    }

    setError(null);
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    setPassword(result);
  }, [length, upper, lower, numbers, symbols]);

  const strength = password ? getStrength(password, length) : null;

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 dark:border-gray-700 font-mono text-sm">
        <span className="flex-1 break-all" aria-live="polite">
          {password || "Click Generate to create a password"}
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={!password}
          className="shrink-0 rounded p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-40"
          aria-label="Copy password"
        >
          {copied ? <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {strength && (
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Strength</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{strengthLabels[strength]}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${strengthColors[strength]}`}
              style={{
                width:
                  strength === "weak"
                    ? "25%"
                    : strength === "fair"
                      ? "50%"
                      : strength === "good"
                        ? "75%"
                        : "100%",
              }}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="pw-length" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Length: {length}
        </label>
        <input
          id="pw-length"
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="mt-2 w-full accent-primary-600"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Character types</legend>
        {[
          { label: "Uppercase (A-Z)", checked: upper, set: setUpper },
          { label: "Lowercase (a-z)", checked: lower, set: setLower },
          { label: "Numbers (0-9)", checked: numbers, set: setNumbers },
          { label: "Symbols (!@#…)", checked: symbols, set: setSymbols },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.set(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <button type="button" onClick={generate} className="btn-primary">
        <RefreshCw className="h-4 w-4" />
        Generate
      </button>
    </div>
  );
}
