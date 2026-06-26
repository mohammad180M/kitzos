"use client";

import { useRef, useState } from "react";
import { Download, Loader2, ShieldAlert, Upload } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import {
  parseExifFields,
  defaultSelectedKeys,
  type ExifGroup,
} from "@/lib/exif-metadata";
import { cleanImage, outputFilename } from "@/lib/exif-clean";

export default function ExifRemover() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [groups, setGroups] = useState<ExifGroup[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const loadFile = async (f: File) => {
    setLoading(true);
    setError(null);
    setDone(false);
    setFile(f);
    setPreview(URL.createObjectURL(f));

    try {
      const parsed = await parseExifFields(f);
      setGroups(parsed);
      setSelected(defaultSelectedKeys(parsed));
    } catch {
      setGroups([]);
      setSelected(new Set());
      setError("Could not read metadata from this file.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setDone(false);
  };

  const toggleGroup = (group: ExifGroup, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const field of group.fields) {
        if (checked) next.add(field.key);
        else next.delete(field.key);
      }
      return next;
    });
    setDone(false);
  };

  const handleClean = async () => {
    if (!file) return;
    setCleaning(true);
    setProgress(0);
    setError(null);
    setDone(false);

    try {
      const blob = await cleanImage(file, groups, selected, setProgress);
      downloadBlob(blob, outputFilename(file));
      setDone(true);
    } catch {
      setError("Could not clean image. Try another file.");
    } finally {
      setCleaning(false);
    }
  };

  const totalFields = groups.reduce((n, g) => n + g.fields.length, 0);

  return (
    <div className="space-y-4" dir="ltr">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void loadFile(f);
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
        <span>Upload image to inspect EXIF metadata</span>
      </button>

      {preview && (
        <img
          src={preview}
          alt="Preview"
          loading="lazy"
          decoding="async"
          width={800}
          height={480}
          className="max-h-48 rounded-lg border object-contain dark:border-gray-700"
        />
      )}

      {groups.length > 0 && (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Metadata found ({totalFields} fields)
            </h3>
            <button
              type="button"
              className="text-xs text-primary-600 hover:underline dark:text-primary-400"
              onClick={() => {
                const all = new Set(groups.flatMap((g) => g.fields.map((f) => f.key)));
                setSelected(selected.size === totalFields ? new Set() : all);
                setDone(false);
              }}
            >
              {selected.size === totalFields ? "Deselect all" : "Select all"}
            </button>
          </div>

          {groups.map((group) => {
            const groupKeys = group.fields.map((f) => f.key);
            const allChecked = groupKeys.every((k) => selected.has(k));
            const someChecked = groupKeys.some((k) => selected.has(k));

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
                          checked={selected.has(field.key)}
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

      {file && groups.length === 0 && !loading && !error && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          No EXIF metadata detected. Image is already clean.
        </p>
      )}

      {file && groups.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => void handleClean()}
            disabled={cleaning || selected.size === 0}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            {cleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {cleaning ? "Cleaning…" : `Remove selected (${selected.size}) & download`}
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
          Clean image downloaded successfully.
        </p>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-xs text-gray-400">
        Sensitive fields (GPS, serial numbers, comments) are pre-selected. JPEG files keep unchecked
        metadata; PNG/WebP are re-encoded without all metadata.
      </p>
    </div>
  );
}
