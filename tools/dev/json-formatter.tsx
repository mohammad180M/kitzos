"use client";

import { useRef, useState } from "react";
import { Check, Copy, MapPin, Minimize2, Wand2 } from "lucide-react";

const LINE_HEIGHT_PX = 20;

interface JsonError {
  message: string;
  line: number;
  column: number;
  position: number;
  lineStart: number;
  lineEnd: number;
  previousLine: number | null;
  showPriorLineHint: boolean;
}

function positionToLineColumn(
  input: string,
  position: number
): { line: number; column: number; lineStart: number; lineEnd: number } {
  const safePos = Math.max(0, Math.min(position, input.length));
  const before = input.substring(0, safePos);
  const line = before.split("\n").length;
  const column = (before.split("\n").pop() ?? "").length + 1;
  const lineStart = safePos - column + 1;
  const nextNewline = input.indexOf("\n", lineStart);
  const lineEnd = nextNewline === -1 ? input.length : nextNewline;
  return { line, column, lineStart, lineEnd };
}

function getPreviousNonEmptyLine(input: string, errorLine: number): number | null {
  const lines = input.split("\n");
  for (let i = errorLine - 2; i >= 0; i--) {
    if (lines[i].trim()) return i + 1;
  }
  return null;
}

function isLikelyPriorLineSyntaxError(rawMessage: string): boolean {
  const msg = rawMessage.toLowerCase();
  return (
    /expected\s+['"`]/.test(msg) ||
    msg.includes("unexpected token") ||
    msg.includes("unexpected string") ||
    msg.includes("unexpected end") ||
    msg.includes("after property") ||
    msg.includes("expected ','") ||
    msg.includes("expected }") ||
    msg.includes("expected ]")
  );
}

function formatErrorMessage(
  rawMessage: string,
  line: number,
  column: number,
  showPriorLineHint: boolean
): string {
  const withoutPosition = rawMessage.replace(/\s*in JSON at position \d+/i, "").trim();
  const cleaned = withoutPosition.replace(/^JSON\.parse:\s*/i, "").trim();
  const base = cleaned || "Invalid JSON";
  let message = `${base} at line ${line}, column ${column}`;
  if (showPriorLineHint) {
    message +=
      " — the missing comma or syntax issue is often on the line just before this one.";
  }
  return message;
}

function parseJsonError(err: unknown, input: string): JsonError {
  const rawMessage = err instanceof Error ? err.message : "Invalid JSON";
  const posMatch = rawMessage.match(/position (\d+)/i);
  const position = posMatch ? parseInt(posMatch[1], 10) : 0;
  const { line, column, lineStart, lineEnd } = positionToLineColumn(input, position);
  const previousLine = getPreviousNonEmptyLine(input, line);
  const showPriorLineHint = isLikelyPriorLineSyntaxError(rawMessage) && previousLine !== null;

  return {
    message: formatErrorMessage(rawMessage, line, column, showPriorLineHint),
    line,
    column,
    position,
    lineStart,
    lineEnd,
    previousLine,
    showPriorLineHint,
  };
}

function LineHighlightOverlay({
  errorLine,
  previousLine,
  active,
}: {
  errorLine: number;
  previousLine: number | null;
  active: boolean;
}) {
  if (!active) return null;

  const paddingTop = 10;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
      aria-hidden="true"
    >
      {previousLine !== null && (
        <div
          className="absolute inset-x-0 bg-amber-50/90 dark:bg-amber-950/50"
          style={{
            top: paddingTop + (previousLine - 1) * LINE_HEIGHT_PX,
            height: LINE_HEIGHT_PX,
          }}
        />
      )}
      <div
        className="absolute inset-x-0 bg-red-100/90 dark:bg-red-950/50"
        style={{
          top: paddingTop + (errorLine - 1) * LINE_HEIGHT_PX,
          height: LINE_HEIGHT_PX,
        }}
      />
    </div>
  );
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<JsonError | null>(null);
  const [copied, setCopied] = useState(false);
  const [highlightError, setHighlightError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const format = (minify = false) => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = minify
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
      setHighlightError(false);
    } catch (err) {
      setOutput("");
      setError(parseJsonError(err, input));
    }
  };

  const goToError = () => {
    if (!error || !inputRef.current) return;

    const textarea = inputRef.current;
    textarea.focus();
    textarea.setSelectionRange(error.lineStart, error.lineEnd);
    const scrollLine = error.previousLine ?? error.line;
    textarea.scrollTop = Math.max(
      0,
      (scrollLine - 1) * LINE_HEIGHT_PX - textarea.clientHeight / 2
    );

    setHighlightError(true);
    window.setTimeout(() => setHighlightError(false), 2000);
  };

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

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="json-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          JSON input
        </label>
        <div
          className={`relative mt-1 rounded-lg transition-colors ${
            highlightError ? "ring-2 ring-red-200" : ""
          }`}
        >
          <LineHighlightOverlay
            errorLine={error?.line ?? 1}
            previousLine={error?.previousLine ?? null}
            active={highlightError}
          />
          <textarea
            ref={inputRef}
            id="json-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (highlightError) setHighlightError(false);
            }}
            placeholder='{"key": "value"}'
            rows={8}
            className={`input-field resize-y font-mono text-sm leading-5 transition-colors ${
              highlightError
                ? "relative border-red-400 bg-transparent ring-0 focus:border-red-400 focus:ring-red-200"
                : ""
            }`}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => format(false)} className="btn-primary">
          <Wand2 className="h-4 w-4" />
          Format
        </button>
        <button type="button" onClick={() => format(true)} className="btn-secondary">
          <Minimize2 className="h-4 w-4" />
          Minify
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">Invalid JSON</p>
              <p className="mt-1">{error.message}</p>
            </div>
            <button
              type="button"
              onClick={goToError}
              className="btn-secondary shrink-0 border-red-200 bg-white text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-gray-800 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              <MapPin className="h-4 w-4" />
              Go to error
            </button>
          </div>
        </div>
      )}

      {output && (
        <div>
          <label htmlFor="json-output" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Output
          </label>
          <textarea
            id="json-output"
            value={output}
            readOnly
            rows={8}
            className="input-field mt-1 resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50 dark:bg-gray-800/80"
          />
          <button type="button" onClick={copy} className="btn-secondary mt-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
