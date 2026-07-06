"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface UnsavedWorkDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  dir: "ltr" | "rtl";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UnsavedWorkDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  dir,
  onConfirm,
  onCancel,
}: UnsavedWorkDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const previousFocus = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  const buttonRowClassName =
    dir === "rtl"
      ? "mt-6 flex flex-wrap flex-row-reverse justify-start gap-2"
      : "mt-6 flex flex-wrap justify-end gap-2";

  return createPortal(
    <div
      className="unsaved-dialog-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-work-title"
        aria-describedby="unsaved-work-body"
        dir={dir}
        className="unsaved-dialog-panel card w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="unsaved-work-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p id="unsaved-work-body" className="mt-2 text-sm text-muted">
          {body}
        </p>
        <div className={buttonRowClassName}>
          <button ref={cancelRef} type="button" onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
