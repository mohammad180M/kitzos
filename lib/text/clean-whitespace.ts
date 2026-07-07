export interface CleanWhitespaceOptions {
  /** Join line breaks into one block (toggle 1). */
  removeLineBreaks: boolean;
  /** When joining breaks, insert a space instead of concatenating directly. */
  joinWithSpace: boolean;
  /** Collapse runs of spaces and tabs within each line (toggle 2). */
  collapseSpaces: boolean;
  /** Drop lines that are empty after optional trim (toggle 3). */
  removeBlankLines: boolean;
  /** Trim leading/trailing whitespace on each line (toggle 4). */
  trimLines: boolean;
}

/** Normalize CR/LF to LF before processing. */
function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Clean text using independent toggles. Line-based steps run first while structure
 * remains; line-break removal runs last.
 */
export function cleanWhitespace(text: string, opts: CleanWhitespaceOptions): string {
  if (!text) return "";

  let result = normalizeNewlines(text);

  let lines = result.split("\n");

  if (opts.collapseSpaces) {
    lines = lines.map((line) => line.replace(/[ \t]+/g, " "));
  }

  if (opts.trimLines) {
    lines = lines.map((line) => line.trim());
  }

  if (opts.removeBlankLines) {
    lines = lines.filter((line) => line.length > 0);
  }

  result = lines.join("\n");

  if (opts.removeLineBreaks) {
    if (opts.joinWithSpace) {
      result = result.replace(/\n+/g, " ");
      if (opts.collapseSpaces) {
        result = result.replace(/[ \t]+/g, " ").trim();
      } else {
        result = result.trim();
      }
    } else {
      result = result.replace(/\n/g, "");
    }
  }

  return result;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return normalizeNewlines(text).split("\n").length;
}
