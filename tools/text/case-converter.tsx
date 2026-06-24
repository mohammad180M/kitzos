"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

type CaseType =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "snake";

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toSentenceCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function toSnakeCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

const buttons: { type: CaseType; label: string }[] = [
  { type: "upper", label: "UPPERCASE" },
  { type: "lower", label: "lowercase" },
  { type: "title", label: "Title Case" },
  { type: "sentence", label: "Sentence case" },
  { type: "camel", label: "camelCase" },
  { type: "snake", label: "snake_case" },
];

export default function CaseConverter() {
  const labels = useCommonLabels();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = (type: CaseType) => {
    switch (type) {
      case "upper":
        setText(text.toUpperCase());
        break;
      case "lower":
        setText(text.toLowerCase());
        break;
      case "title":
        setText(toTitleCase(text));
        break;
      case "sentence":
        setText(toSentenceCase(text));
        break;
      case "camel":
        setText(toCamelCase(text));
        break;
      case "snake":
        setText(toSnakeCase(text));
        break;
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback ignored
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to convert…"
        rows={6}
        className="input-field resize-y"
        aria-label="Text to convert"
      />

      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.type}
            type="button"
            onClick={() => convert(btn.type)}
            className="btn-secondary text-xs sm:text-sm"
          >
            {btn.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={copy}
        disabled={!text}
        className="btn-primary"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            {labels.copied}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            {labels.copy}
          </>
        )}
      </button>
    </div>
  );
}
