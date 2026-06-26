export type CsvDelimiter = "," | ";" | "\t";

export type CsvJsonError = "EMPTY_CSV" | "INVALID_JSON" | "NOT_ARRAY" | "NOT_OBJECTS";

export function parseCsv(text: string, delimiter: CsvDelimiter): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") {
        rows.push(row);
      }
      row = [];
      if (char === "\r") i++;
    } else if (char !== "\r") {
      field += char;
    }
  }

  row.push(field);
  if (row.length > 1 || row[0] !== "") {
    rows.push(row);
  }

  return rows;
}

export function csvToJson(
  csv: string,
  delimiter: CsvDelimiter
): { data: Record<string, string>[] } | { error: CsvJsonError } {
  const trimmed = csv.trim();
  if (!trimmed) return { data: [] };

  const rows = parseCsv(trimmed, delimiter);
  if (rows.length === 0) return { error: "EMPTY_CSV" };

  const headers = rows[0].map((h) => h.trim());
  if (headers.length === 0 || headers.every((h) => !h)) {
    return { error: "EMPTY_CSV" };
  }

  const data = rows
    .slice(1)
    .filter((cells) => cells.some((cell) => cell.trim() !== ""))
    .map((cells) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = cells[index] ?? "";
      });
      return obj;
    });

  return { data };
}

function escapeCsvValue(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function jsonToCsv(
  jsonText: string
): { csv: string } | { error: CsvJsonError } {
  const trimmed = jsonText.trim();
  if (!trimmed) return { csv: "" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { error: "INVALID_JSON" };
  }

  if (!Array.isArray(parsed)) {
    return { error: "NOT_ARRAY" };
  }

  if (parsed.length === 0) {
    return { csv: "" };
  }

  if (!parsed.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
    return { error: "NOT_OBJECTS" };
  }

  const records = parsed as Record<string, unknown>[];
  const keys = Array.from(new Set(records.flatMap((record) => Object.keys(record))));
  const lines = [
    keys.map(escapeCsvValue).join(","),
    ...records.map((record) => keys.map((key) => escapeCsvValue(record[key])).join(",")),
  ];

  return { csv: lines.join("\n") };
}
