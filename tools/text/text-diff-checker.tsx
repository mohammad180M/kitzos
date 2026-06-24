"use client";

import { useMemo, useState } from "react";
import * as Diff from "diff";

const CONTEXT_LINES = 3;
const MIN_LINES_FOR_CONTEXT = 24;

type DiffRow =
  | {
      kind: "unchanged" | "removed" | "added";
      originalLineNum: number | null;
      changedLineNum: number | null;
      content: string;
    }
  | {
      kind: "modified";
      originalLineNum: number;
      changedLineNum: number;
      wordParts: Diff.Change[];
    };

type DisplayRow = DiffRow | { kind: "ellipsis" };

function splitLines(value: string): string[] {
  if (!value) return [];
  const lines = value.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "" && value.endsWith("\n")) {
    lines.pop();
  }
  return lines;
}

function buildDiffRows(original: string, changed: string): DiffRow[] {
  const parts = Diff.diffLines(original, changed);
  const rows: DiffRow[] = [];
  let originalLineNum = 1;
  let changedLineNum = 1;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.removed) {
      const removedLines = splitLines(part.value);
      const next = parts[i + 1];

      if (next?.added) {
        const addedLines = splitLines(next.value);
        const pairCount = Math.max(removedLines.length, addedLines.length);

        for (let j = 0; j < pairCount; j++) {
          const removed = removedLines[j];
          const added = addedLines[j];

          if (removed !== undefined && added !== undefined) {
            rows.push({
              kind: "modified",
              originalLineNum: originalLineNum++,
              changedLineNum: changedLineNum++,
              wordParts: Diff.diffWords(removed, added),
            });
          } else if (removed !== undefined) {
            rows.push({
              kind: "removed",
              originalLineNum: originalLineNum++,
              changedLineNum: null,
              content: removed,
            });
          } else if (added !== undefined) {
            rows.push({
              kind: "added",
              originalLineNum: null,
              changedLineNum: changedLineNum++,
              content: added,
            });
          }
        }

        i++;
      } else {
        for (const line of removedLines) {
          rows.push({
            kind: "removed",
            originalLineNum: originalLineNum++,
            changedLineNum: null,
            content: line,
          });
        }
      }
    } else if (part.added) {
      for (const line of splitLines(part.value)) {
        rows.push({
          kind: "added",
          originalLineNum: null,
          changedLineNum: changedLineNum++,
          content: line,
        });
      }
    } else {
      for (const line of splitLines(part.value)) {
        rows.push({
          kind: "unchanged",
          originalLineNum: originalLineNum++,
          changedLineNum: changedLineNum++,
          content: line,
        });
      }
    }
  }

  return rows;
}

function foldWithContext(rows: DiffRow[]): DisplayRow[] {
  if (rows.length < MIN_LINES_FOR_CONTEXT) return rows;

  const changedIndices = rows
    .map((row, index) => (row.kind !== "unchanged" ? index : -1))
    .filter((index) => index >= 0);

  if (changedIndices.length === 0) return rows;

  const keep = new Set<number>();
  for (const index of changedIndices) {
    for (
      let i = Math.max(0, index - CONTEXT_LINES);
      i <= Math.min(rows.length - 1, index + CONTEXT_LINES);
      i++
    ) {
      keep.add(i);
    }
  }

  const sorted = Array.from(keep).sort((a, b) => a - b);
  const result: DisplayRow[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] > sorted[i - 1] + 1) {
      result.push({ kind: "ellipsis" });
    }
    result.push(rows[sorted[i]]);
  }

  return result;
}

function rowBackground(kind: DiffRow["kind"]): string {
  switch (kind) {
    case "added":
      return "bg-green-100 dark:bg-green-900/40";
    case "removed":
      return "bg-red-100 dark:bg-red-900/40";
    case "modified":
      return "bg-amber-50 dark:bg-amber-950/30";
    default:
      return "";
  }
}

function WordDiff({ parts }: { parts: Diff.Change[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.added) {
          return (
            <span
              key={index}
              className="bg-green-200 text-green-900 dark:bg-green-800/60 dark:text-green-100"
            >
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span
              key={index}
              className="bg-red-200 text-red-900 line-through dark:bg-red-800/60 dark:text-red-100"
            >
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
}

function DiffLine({ row }: { row: DiffRow }) {
  return (
    <div className={`flex min-w-0 ${rowBackground(row.kind)}`}>
      <div
        className="w-10 shrink-0 select-none border-e border-gray-200 py-0.5 pr-2 text-right text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500"
        aria-hidden="true"
      >
        {row.originalLineNum ?? ""}
      </div>
      <div
        className="w-10 shrink-0 select-none border-e border-gray-200 py-0.5 pr-2 text-right text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500"
        aria-hidden="true"
      >
        {row.changedLineNum ?? ""}
      </div>
      <div className="min-w-0 flex-1 whitespace-pre-wrap break-words px-3 py-0.5 text-gray-900 dark:text-gray-100">
        {row.kind === "modified" ? (
          <WordDiff parts={row.wordParts} />
        ) : (
          <span
            className={
              row.kind === "removed"
                ? "text-red-900 line-through dark:text-red-200"
                : row.kind === "added"
                  ? "text-green-900 dark:text-green-200"
                  : ""
            }
          >
            {row.content || "\u00a0"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TextDiffChecker() {
  const [original, setOriginal] = useState("The quick brown fox\njumps over the lazy dog.");
  const [changed, setChanged] = useState("The quick brown fox\nleaps over the lazy dog.");

  const displayRows = useMemo(() => {
    if (!original && !changed) return [];
    const rows = buildDiffRows(original, changed);
    return foldWithContext(rows);
  }, [original, changed]);

  const hasChanges = displayRows.some(
    (row) => row.kind !== "unchanged" && row.kind !== "ellipsis"
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="diff-original" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Original
          </label>
          <textarea
            id="diff-original"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={10}
            className="input-field mt-1 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
        <div>
          <label htmlFor="diff-changed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Changed
          </label>
          <textarea
            id="diff-changed"
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            rows={10}
            className="input-field mt-1 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Diff</p>
        <div className="max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white font-mono text-sm leading-relaxed dark:border-gray-700 dark:bg-gray-900">
          {displayRows.length === 0 ? (
            <p className="p-4 text-gray-400 dark:text-gray-500">Enter text in both fields to compare.</p>
          ) : !hasChanges ? (
            <p className="p-4 text-gray-500 dark:text-gray-400">No differences found.</p>
          ) : (
            <div>
              <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                <div className="w-10 shrink-0 border-e border-gray-200 py-1.5 pr-2 text-right dark:border-gray-700">
                  #
                </div>
                <div className="w-10 shrink-0 border-e border-gray-200 py-1.5 pr-2 text-right dark:border-gray-700">
                  #
                </div>
                <div className="flex-1 px-3 py-1.5">Line</div>
              </div>
              {displayRows.map((row, index) =>
                row.kind === "ellipsis" ? (
                  <div
                    key={`ellipsis-${index}`}
                    className="border-y border-dashed border-gray-200 bg-gray-50 px-3 py-1 text-center text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-500"
                  >
                    ··· unchanged lines hidden ···
                  </div>
                ) : (
                  <DiffLine key={`${row.kind}-${row.originalLineNum}-${row.changedLineNum}-${index}`} row={row} />
                )
              )}
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          <span className="inline-block rounded bg-red-100 px-1 text-red-800 dark:bg-red-900/40 dark:text-red-300">
            Removed
          </span>
          {" · "}
          <span className="inline-block rounded bg-green-100 px-1 text-green-800 dark:bg-green-900/40 dark:text-green-300">
            Added
          </span>
          {" · "}
          <span className="inline-block rounded bg-amber-50 px-1 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            Modified (word highlight)
          </span>
        </p>
      </div>
    </div>
  );
}
