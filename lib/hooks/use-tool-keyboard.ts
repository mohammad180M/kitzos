"use client";

import { useEffect } from "react";

interface UseToolKeyboardOptions {
  onRun?: () => void;
  onClear?: () => void;
  enabled?: boolean;
}

/** Ctrl/Cmd+Enter to run, Escape to clear — for developer-style tools. */
export function useToolKeyboard({ onRun, onClear, enabled = true }: UseToolKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (!inField) return;

      if (event.key === "Escape" && onClear) {
        event.preventDefault();
        onClear();
        return;
      }

      if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && onRun) {
        event.preventDefault();
        onRun();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRun, onClear, enabled]);
}
