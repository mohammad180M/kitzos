"use client";

import { useEffect, useState } from "react";

/**
 * Persist tool input in localStorage. Do not use for sensitive data (e.g. JWT tokens).
 */
export function usePersistedInput(storageKey: string, initial = ""): [string, (value: string) => void] {
  const [value, setValue] = useState(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved != null) setValue(saved);
    } catch {
      // ignored
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (value) {
        localStorage.setItem(storageKey, value);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // ignored
    }
  }, [storageKey, value, hydrated]);

  return [value, setValue];
}
