"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return matches ? matches.filter((s) => s.trim()).length : 0;
}

function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length;
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = countWords(text);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const readingTime = Math.max(1, Math.ceil(words / 200));

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
    };
  }, [text]);

  const statItems = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: `${stats.readingTime} min` },
  ];

  const copyText = useMemo(
    () =>
      statItems
        .map((item) => `${item.label}: ${item.value}`)
        .join("\n"),
    [statItems]
  );

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here…"
        rows={8}
        className="input-field resize-y"
        aria-label="Text to count"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 dark:border-gray-700 text-center"
          >
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{item.value}</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>

      {text.trim() && <CopyButton text={copyText} />}
    </div>
  );
}
