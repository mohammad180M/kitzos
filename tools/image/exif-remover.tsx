"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import { Download, Loader2, ShieldAlert, Upload } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import {
  parseExifFields,
  defaultSelectedKeys,
  type ExifGroup,
} from "@/lib/exif-metadata";
import { cleanImage, outputFilename } from "@/lib/exif-clean";
import {
  useImageToolsExtraLabels,
  useImageToolsSharedLabels,
} from "@/lib/i18n/use-image-tools-extra-labels";

interface FileEntry {
  file: File;
  preview: string;
  groups: ExifGroup[];
  selected: Set<string>;
}

export default function ExifRemover() {
  const shared = useImageToolsSharedLabels();
  const t = useImageToolsExtraLabels("exifRemover");
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const active = entries[activeIndex] ?? null;

  const loadFiles = async (files: FileList | File[]) => {
    setLoading(true);
    setError(null);
    setDone(false);

    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setError(t.errInvalidFiles);
      setLoading(false);
      return;
    }

    try {
      const loaded: FileEntry[] = [];
      for (const f of list) {
        const parsed = await parseExifFields(f).catch(() => [] as ExifGroup[]);
        loaded.push({
          file: f,
          preview: URL.createObjectURL(f),
          groups: parsed,
          selected: defaultSelectedKeys(parsed),
        });
      }
      setEntries(loaded);
      setActiveIndex(0);
    } catch {
      setError(t.errReadMetadata);
    } finally {
      setLoading(false);
    }
  };

  const updateActive = (patch: Partial<FileEntry>) => {
    setEntries((prev) =>
      prev.map((e, i) => (i === activeIndex ? { ...e, ...patch } : e))
    );
    setDone(false);
  };

  const toggle = (key: string) => {
    if (!active) return;
    const next = new Set(active.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateActive({ selected: next });
  };

  const toggleGroup = (group: ExifGroup, checked: boolean) => {
    if (!active) return;
    const next = new Set(active.selected);
    for (const field of group.fields) {
      if (checked) next.add(field.key);
      else next.delete(field.key);
    }
    updateActive({ selected: next });
  };

  const handleClean = async () => {
    if (entries.length === 0) return;
    setCleaning(true);
    setProgress(0);
    setError(null);
    setDone(false);

    try {
      const cleaned: { name: string; blob: Blob }[] = [];
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const blob = await cleanImage(entry.file, entry.groups, entry.selected, (p) => {
          setProgress(Math.round(((i + p / 100) / entries.length) * 100));
        });
        cleaned.push({ name: outputFilename(entry.file), blob });
      }

      if (cleaned.length === 1) {
        downloadBlob(cleaned[0].blob, cleaned[0].name);
      } else {
        const zip = new JSZip();
        for (const c of cleaned) zip.file(c.name, c.blob);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "cleaned-images.zip");
      }
      setDone(true);
    } catch {
      setError(t.errCleanFailed);
    } finally {
      setCleaning(false);
    }
  };

  const totalFields = active?.groups.reduce((n, g) => n + g.fields.length, 0) ?? 0;

  return (
    <div className="space-y-4" dir="ltr">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) void loadFiles(files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading || cleaning}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-8 text-gray-500 hover:border-primary-400 dark:border-gray-600"
      >
        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
        <span>{t.uploadHint}</span>
        <span className="text-xs text-gray-400">{t.uploadSubHint}</span>
      </button>

      {entries.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {entries.map((entry, i) => (
            <button
              key={`${entry.file.name}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                i === activeIndex
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950/40"
                  : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              {entry.file.name}
            </button>
          ))}
        </div>
      )}

      {active?.preview && (
        <img
          src={active.preview}
          alt={shared.preview}
          loading="lazy"
          decoding="async"
          className="max-h-48 rounded-lg border object-contain dark:border-gray-700"
        />
      )}

      {active && active.groups.length > 0 && (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t.metadataFound(totalFields)}
            </h3>
            <button
              type="button"
              className="text-xs text-primary-600 hover:underline dark:text-primary-400"
              onClick={() => {
                const all = new Set(active.groups.flatMap((g) => g.fields.map((f) => f.key)));
                updateActive({
                  selected: active.selected.size === totalFields ? new Set() : all,
                });
              }}
            >
              {active.selected.size === totalFields ? t.deselectAll : t.selectAll}
            </button>
          </div>

          {active.groups.map((group) => {
            const groupKeys = group.fields.map((f) => f.key);
            const allChecked = groupKeys.every((k) => active.selected.has(k));
            const someChecked = groupKeys.some((k) => active.selected.has(k));

            return (
              <div key={group.id} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked && !allChecked;
                    }}
                    onChange={(e) => toggleGroup(group, e.target.checked)}
                  />
                  {group.label}
                </label>
                <ul className="space-y-1.5 pl-6">
                  {group.fields.map((field) => (
                    <li
                      key={field.key}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        field.dangerous
                          ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                          : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={active.selected.has(field.key)}
                          onChange={() => toggle(field.key)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                            {field.label}
                            {field.dangerous && (
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                            )}
                          </span>
                          <span className="mt-0.5 block break-all font-mono text-xs text-gray-500 dark:text-gray-400">
                            {field.value}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {active && active.groups.length === 0 && !loading && !error && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          {t.noExif}
        </p>
      )}

      {entries.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => void handleClean()}
            disabled={cleaning || entries.length === 0}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            {cleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {cleaning
              ? t.cleaning
              : entries.length > 1
                ? t.cleanZip(entries.length)
                : t.removeSelected(active?.selected.size ?? 0)}
          </button>

          {cleaning && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{progress}%</p>
            </div>
          )}
        </div>
      )}

      {done && (
        <p className="text-sm text-green-600 dark:text-green-400">
          {entries.length > 1 ? t.doneMultiple : t.doneSingle}
        </p>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-xs text-gray-400">
        {t.privacyNote}
      </p>
    </div>
  );
}
