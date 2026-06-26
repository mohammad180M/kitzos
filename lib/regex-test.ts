export interface RegexMatchResult {
  index: number;
  match: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string>;
}

export interface RegexTestOutcome {
  matches: RegexMatchResult[];
  error: string | null;
}

const MAX_MATCHES = 1000;

function pushMatch(matches: RegexMatchResult[], match: RegExpExecArray): void {
  const namedGroups: Record<string, string> = {};
  if (match.groups) {
    for (const [key, value] of Object.entries(match.groups)) {
      if (value != null) namedGroups[key] = value;
    }
  }

  matches.push({
    index: match.index,
    match: match[0],
    groups: match.slice(1),
    namedGroups,
  });
}

export function testRegex(pattern: string, flags: string, text: string): RegexTestOutcome {
  if (!pattern.trim()) {
    return { matches: [], error: null };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatchResult[] = [];

    if (flags.includes("g")) {
      let guard = 0;
      while (guard < MAX_MATCHES) {
        const match = regex.exec(text);
        if (!match) break;

        pushMatch(matches, match);
        guard++;

        if (match[0].length === 0) {
          regex.lastIndex = match.index + 1;
        }
      }
    } else {
      const match = regex.exec(text);
      if (match) pushMatch(matches, match);
    }

    return { matches, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid regular expression";
    return { matches: [], error: message };
  }
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export function buildHighlightSegments(
  text: string,
  matches: RegexMatchResult[]
): HighlightSegment[] {
  if (matches.length === 0) {
    return [{ text, highlighted: false }];
  }

  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const { index, match } of sorted) {
    if (index < cursor) continue;
    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index), highlighted: false });
    }
    segments.push({ text: match, highlighted: true });
    cursor = index + match.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments;
}
