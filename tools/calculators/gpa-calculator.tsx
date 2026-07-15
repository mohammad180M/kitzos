"use client";

import { useEffect, useMemo, useState } from "react";
import { useCalcToolLabels } from "@/lib/i18n/use-calc-tool-labels";
import { safeJsonParse } from "@/lib/safe-json";

const STORAGE_KEY = "kitzos-gpa-calculator";

/** Standard 4.0 plus/minus scale (insertion order = dropdown order). */
const GRADE_SCALE = [
  { key: "A+", points: 4.0 },
  { key: "A", points: 4.0 },
  { key: "A-", points: 3.7 },
  { key: "B+", points: 3.3 },
  { key: "B", points: 3.0 },
  { key: "B-", points: 2.7 },
  { key: "C+", points: 2.3 },
  { key: "C", points: 2.0 },
  { key: "C-", points: 1.7 },
  { key: "D+", points: 1.3 },
  { key: "D", points: 1.0 },
  { key: "D-", points: 0.7 },
  { key: "F", points: 0.0 },
] as const;

type GradeKey = (typeof GRADE_SCALE)[number]["key"];

const GRADE_POINTS: Record<GradeKey, number> = Object.fromEntries(
  GRADE_SCALE.map((g) => [g.key, g.points])
) as Record<GradeKey, number>;

const GRADE_KEYS = GRADE_SCALE.map((g) => g.key) as GradeKey[];

function normalizeGrade(raw: unknown): GradeKey {
  if (typeof raw !== "string") return "A";
  const cleaned = raw.trim().replace(/\u2212/g, "-").replace(/\u2013/g, "-");
  if (cleaned in GRADE_POINTS) return cleaned as GradeKey;
  const upper = cleaned.toUpperCase();
  if (upper in GRADE_POINTS) return upper as GradeKey;
  if (/^[ABCDF]$/.test(upper)) return upper as GradeKey;
  return "A";
}

interface CourseRow {
  id: string;
  name: string;
  credits: string;
  grade: GradeKey;
  retake: boolean;
  previousGrade: GradeKey;
}

interface PersistedState {
  cumulative: boolean;
  prevGpa: string;
  prevCredits: string;
  rows: CourseRow[];
}

let rowId = 0;
function nextId(): string {
  return String(++rowId);
}

function newRow(): CourseRow {
  return {
    id: nextId(),
    name: "",
    credits: "3",
    grade: "A",
    retake: false,
    previousGrade: "F",
  };
}

function hydrateRow(raw: unknown): CourseRow {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<CourseRow>;
  const id = typeof r.id === "string" && r.id ? r.id : nextId();
  const n = Number.parseInt(id, 10);
  if (Number.isFinite(n) && n > rowId) rowId = n;
  return {
    id,
    name: typeof r.name === "string" ? r.name : "",
    credits: typeof r.credits === "string" ? r.credits : "3",
    grade: normalizeGrade(r.grade ?? "A"),
    retake: Boolean(r.retake),
    previousGrade: normalizeGrade(r.previousGrade ?? "F"),
  };
}

function loadPersisted(): PersistedState {
  const fallback: PersistedState = {
    cumulative: false,
    prevGpa: "",
    prevCredits: "",
    rows: [newRow(), newRow()],
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeJsonParse<unknown>(raw, null);
    if (!parsed || typeof parsed !== "object") return fallback;
    const data = parsed as Partial<PersistedState> & { rows?: unknown[] };
    const rowsRaw = Array.isArray(data.rows) ? data.rows : null;
    if (!rowsRaw || rowsRaw.length === 0) return fallback;
    return {
      cumulative: Boolean(data.cumulative),
      prevGpa: typeof data.prevGpa === "string" ? data.prevGpa : "",
      prevCredits: typeof data.prevCredits === "string" ? data.prevCredits : "",
      rows: rowsRaw.map(hydrateRow),
    };
  } catch {
    return fallback;
  }
}

function parseCredits(raw: string): number | null {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export default function GpaCalculator() {
  const t = useCalcToolLabels("gpaCalculator");
  const [hydrated, setHydrated] = useState(false);
  const [rows, setRows] = useState<CourseRow[]>(() => [newRow(), newRow()]);
  const [cumulative, setCumulative] = useState(false);
  const [prevGpa, setPrevGpa] = useState("");
  const [prevCredits, setPrevCredits] = useState("");

  useEffect(() => {
    const saved = loadPersisted();
    setRows(saved.rows);
    setCumulative(saved.cumulative);
    setPrevGpa(saved.prevGpa);
    setPrevCredits(saved.prevCredits);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: PersistedState = {
        cumulative,
        prevGpa,
        prevCredits,
        rows,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignored
    }
  }, [hydrated, cumulative, prevGpa, prevCredits, rows]);

  const prevGpaParsed = parseFloat(prevGpa);
  const prevCreditsParsed = parseCredits(prevCredits);
  const prevGpaValid =
    prevGpa.trim() === ""
      ? false
      : Number.isFinite(prevGpaParsed) && prevGpaParsed >= 0 && prevGpaParsed <= 4;
  const prevCreditsValid =
    prevCredits.trim() === ""
      ? false
      : prevCreditsParsed !== null && prevCreditsParsed >= 0;

  const result = useMemo(() => {
    let semesterPoints = 0;
    let semesterCredits = 0;
    let retakeOldPoints = 0;
    let retakeCredits = 0;
    let retakeWarn = false;

    for (const row of rows) {
      const c = parseCredits(row.credits);
      if (c === null || c <= 0) continue;
      const grade = normalizeGrade(row.grade);
      semesterPoints += c * GRADE_POINTS[grade];
      semesterCredits += c;
      if (cumulative && row.retake) {
        const oldPts = GRADE_POINTS[normalizeGrade(row.previousGrade)] * c;
        retakeOldPoints += oldPts;
        retakeCredits += c;
      }
    }

    if (semesterCredits <= 0) return null;

    const semesterGpa = semesterPoints / semesterCredits;

    if (!cumulative) {
      return {
        mode: "semester" as const,
        semesterGpa,
        semesterCredits,
        semesterPoints,
      };
    }

    if (!prevGpaValid || !prevCreditsValid || prevCreditsParsed === null) {
      return {
        mode: "semester" as const,
        semesterGpa,
        semesterCredits,
        semesterPoints,
        waitingPrev: true,
      };
    }

    let adjustedPrevPoints = prevGpaParsed * prevCreditsParsed - retakeOldPoints;
    let denom = prevCreditsParsed + semesterCredits - retakeCredits;

    if (adjustedPrevPoints < 0 || denom <= 0) {
      retakeWarn = true;
      adjustedPrevPoints = Math.max(0, adjustedPrevPoints);
      denom = Math.max(semesterCredits, denom);
    }

    const cumulativeGpa = (adjustedPrevPoints + semesterPoints) / denom;
    const totalCredits = denom;

    return {
      mode: "cumulative" as const,
      semesterGpa,
      semesterCredits,
      semesterPoints,
      cumulativeGpa,
      totalCredits,
      retakeWarn,
    };
  }, [
    rows,
    cumulative,
    prevGpaValid,
    prevCreditsValid,
    prevGpaParsed,
    prevCreditsParsed,
  ]);

  const updateRow = (id: string, patch: Partial<CourseRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-2 text-sm text-[var(--text)]">
        <input
          type="checkbox"
          checked={cumulative}
          onChange={(e) => setCumulative(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--line)] text-[var(--cat-calc)] focus:ring-[var(--cat-calc)]"
        />
        <span>{t.cumulativeToggle}</span>
      </label>

      {cumulative && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="prev-gpa" className="text-sm font-medium text-[var(--text)]">
              {t.prevGpa}
            </label>
            <input
              id="prev-gpa"
              dir="ltr"
              type="number"
              min={0}
              max={4}
              step={0.01}
              value={prevGpa}
              onChange={(e) => setPrevGpa(e.target.value)}
              className="input-field mt-1"
              placeholder="3.20"
            />
            {prevGpa.trim() !== "" && !prevGpaValid && (
              <p className="mt-1 text-xs text-[var(--cat-calc)]">{t.prevGpaHint}</p>
            )}
          </div>
          <div>
            <label htmlFor="prev-credits" className="text-sm font-medium text-[var(--text)]">
              {t.prevCredits}
            </label>
            <input
              id="prev-credits"
              dir="ltr"
              type="number"
              min={0}
              step={0.5}
              value={prevCredits}
              onChange={(e) => setPrevCredits(e.target.value)}
              className="input-field mt-1"
              placeholder="90"
            />
            {prevCredits.trim() !== "" && !prevCreditsValid && (
              <p className="mt-1 text-xs text-[var(--cat-calc)]">{t.prevCreditsHint}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <input
              type="text"
              dir="auto"
              value={row.name}
              onChange={(e) => updateRow(row.id, { name: e.target.value })}
              className="input-field w-full text-start"
              placeholder={t.courseNamePlaceholder(i + 1)}
              aria-label={t.courseName}
            />
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                dir="ltr"
                value={row.credits}
                onChange={(e) => updateRow(row.id, { credits: e.target.value })}
                className="input-field"
                placeholder={t.credits}
                aria-label={t.credits}
              />
              <select
                dir="ltr"
                value={normalizeGrade(row.grade)}
                onChange={(e) => updateRow(row.id, { grade: normalizeGrade(e.target.value) })}
                className="input-field"
                aria-label={t.grade}
              >
                {GRADE_KEYS.map((g) => (
                  <option key={g} value={g} dir="ltr">
                    {t.grades[g]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                className="btn-secondary px-2 text-xs"
                disabled={rows.length <= 1}
              >
                {t.remove}
              </button>
            </div>

            {cumulative && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs text-[var(--text)]">
                  <input
                    type="checkbox"
                    checked={row.retake}
                    onChange={(e) => updateRow(row.id, { retake: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-[var(--line)] text-[var(--cat-calc)] focus:ring-[var(--cat-calc)]"
                  />
                  {t.retake}
                </label>
                {row.retake && (
                  <label className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <span className="shrink-0">{t.previousGrade}</span>
                    <select
                      dir="ltr"
                      value={normalizeGrade(row.previousGrade)}
                      onChange={(e) =>
                        updateRow(row.id, { previousGrade: normalizeGrade(e.target.value) })
                      }
                      className="input-field max-w-[10rem] py-1.5 text-xs"
                    >
                      {GRADE_KEYS.map((g) => (
                        <option key={g} value={g} dir="ltr">
                          {t.grades[g]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, newRow()])}
        className="btn-secondary text-sm"
      >
        {t.addCourse}
      </button>

      {result ? (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-5 text-center">
          {result.mode === "cumulative" ? (
            <>
              <p className="text-sm text-[var(--muted)]">{t.semesterGpa}</p>
              <p className="text-xl font-semibold text-[var(--text)]" dir="ltr">
                {result.semesterGpa.toFixed(2)}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {t.semesterCredits}: <span dir="ltr">{result.semesterCredits}</span>
              </p>

              <div className="my-3 border-t border-[var(--line)]" />

              <p className="text-sm text-[var(--muted)]">{t.cumulativeGpa}</p>
              <p className="text-4xl font-bold text-[var(--cat-calc)]" dir="ltr">
                {result.cumulativeGpa.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {t.totalCredits}: <span dir="ltr">{result.totalCredits}</span>
              </p>
              {result.retakeWarn && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{t.retakeWarn}</p>
              )}
              <p className="mt-3 text-xs text-[var(--muted)]">{t.retakeDisclaimer}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--muted)]">
                {cumulative ? t.semesterGpa : t.gpa}
              </p>
              <p className="text-4xl font-bold text-[var(--cat-calc)]" dir="ltr">
                {result.semesterGpa.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {t.totalCredits}: <span dir="ltr">{result.semesterCredits}</span>
              </p>
              {cumulative && "waitingPrev" in result && result.waitingPrev && (
                <p className="mt-2 text-xs text-[var(--muted)]">{t.enterPreviousHint}</p>
              )}
            </>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">{t.invalid}</p>
      )}
    </div>
  );
}
