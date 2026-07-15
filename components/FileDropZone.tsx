"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Upload } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

/** Module-level: prevent browser from opening dropped files when no zone handles them. */
let windowDropGuardCount = 0;
let windowDropGuardInstalled = false;

function ensureWindowDropGuard() {
  if (typeof window === "undefined" || windowDropGuardInstalled) return;
  windowDropGuardInstalled = true;
  const block = (e: Event) => {
    if (windowDropGuardCount <= 0) return;
    e.preventDefault();
  };
  window.addEventListener("dragover", block);
  window.addEventListener("drop", block);
}

function retainWindowDropGuard() {
  ensureWindowDropGuard();
  windowDropGuardCount += 1;
  return () => {
    windowDropGuardCount = Math.max(0, windowDropGuardCount - 1);
  };
}

export interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  /** Called with the raw FileList from the picker or OS drop — same pipeline for both. */
  onFiles: (files: FileList) => void;
  /** Primary label under the icon (tool-specific upload hint). */
  label: string;
  /** Optional secondary line (e.g. "Multiple files supported"). */
  hint?: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  /** Compact variant for inline / secondary surfaces. */
  compact?: boolean;
}

/**
 * Shared click + OS file drop zone for workbench tools.
 * Click and drop both call `onFiles` with the same FileList shape.
 */
export default function FileDropZone({
  accept,
  multiple = false,
  onFiles,
  label,
  hint,
  disabled = false,
  className = "",
  icon,
  compact = false,
}: FileDropZoneProps) {
  const common = useCommonLabels();
  const inputRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef(0);
  const [active, setActive] = useState(false);
  const inputId = useId();

  useEffect(() => retainWindowDropGuard(), []);

  const resetDepth = useCallback(() => {
    depthRef.current = 0;
    setActive(false);
  }, []);

  const onDragEnter = (e: DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    depthRef.current += 1;
    setActive(true);
  };

  const onDragLeave = (e: DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    depthRef.current = Math.max(0, depthRef.current - 1);
    if (depthRef.current === 0) setActive(false);
  };

  const onDragOver = (e: DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    resetDepth();
    if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-describedby={hint ? `${inputId}-hint` : undefined}
      onClick={openPicker}
      onKeyDown={onKeyDown}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        compact ? "px-4 py-6" : "px-6 py-10"
      } ${
        active
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-2))]"
          : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)]"
      } ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
    >
      {icon ?? <Upload className="h-8 w-8 text-[var(--muted)]" aria-hidden="true" />}
      <p className="mt-2 text-sm font-medium text-[var(--text)]">
        {active ? common.dropFilesHere : label}
      </p>
      {hint && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-[var(--muted)]">
          {hint}
        </p>
      )}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
