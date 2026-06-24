"use client";

import React, { useCallback, useState } from "react";
import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

type Unit = "paragraphs" | "sentences" | "words";

/** Classic design-mockup Lorem Ipsum vocabulary (canonical passage; no odd late-paragraph terms). */
const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "eu", "fugiat", "nulla", "pariatur",
];

const CANONICAL_OPENING =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(): string {
  const len = 5 + Math.floor(Math.random() * 11);
  const words = Array.from({ length: len }, () => randomWord());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return `${words.join(" ")}.`;
}

function generateParagraph(includeOpening: boolean): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 4);
  const sentences: string[] = [];

  if (includeOpening) {
    sentences.push(CANONICAL_OPENING);
    for (let i = 1; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
  } else {
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
  }

  return sentences.join(" ");
}

function generateWords(count: number, includeOpening: boolean): string {
  if (!includeOpening) {
    return Array.from({ length: count }, () => randomWord()).join(" ");
  }

  const openingWords = CANONICAL_OPENING.replace(/\.$/, "").split(/\s+/);
  if (count <= openingWords.length) {
    return openingWords.slice(0, count).join(" ");
  }

  const extra = Array.from({ length: count - openingWords.length }, () => randomWord());
  return [...openingWords, ...extra].join(" ");
}

export default function LoremIpsumGenerator() {
  const labels = useCommonLabels();
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithCanonical, setStartWithCanonical] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const n = Math.max(1, Math.min(count, unit === "words" ? 500 : 50));

    if (unit === "paragraphs") {
      const paragraphs = Array.from({ length: n }, (_, i) =>
        generateParagraph(startWithCanonical && i === 0)
      );
      setOutput(paragraphs.join("\n\n"));
    } else if (unit === "sentences") {
      const sentences = Array.from({ length: n }, (_, i) => {
        if (startWithCanonical && i === 0) return CANONICAL_OPENING;
        return generateSentence();
      });
      setOutput(sentences.join(" "));
    } else {
      setOutput(generateWords(n, startWithCanonical));
    }
  }, [unit, count, startWithCanonical]);

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "lorem-ipsum.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const maxCount = unit === "words" ? 500 : 50;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate</p>
        <div className="mt-2 inline-flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
          {(["paragraphs", "sentences", "words"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                unit === u
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="lorem-count" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Count: {count}
        </label>
        <input
          id="lorem-count"
          type="range"
          min={1}
          max={maxCount}
          value={Math.min(count, maxCount)}
          onChange={(e) => setCount(Number(e.target.value))}
          className="mt-2 w-full accent-primary-600"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <input
          type="checkbox"
          checked={startWithCanonical}
          onChange={(e) => setStartWithCanonical(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
        />
        <span>Start with &ldquo;Lorem ipsum dolor sit amet&hellip;&rdquo;</span>
      </label>

      <button type="button" onClick={generate} className="btn-primary">
        <RefreshCw className="h-4 w-4" />
        {labels.generate}
      </button>

      {output && (
        <div>
          <label htmlFor="lorem-output" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Output
          </label>
          <textarea
            id="lorem-output"
            value={output}
            readOnly
            rows={8}
            className="input-field mt-1 resize-y bg-gray-50 text-sm dark:bg-gray-800/50"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="btn-secondary">
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
            <button type="button" onClick={download} className="btn-secondary">
              <Download className="h-4 w-4" />
              Download .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
