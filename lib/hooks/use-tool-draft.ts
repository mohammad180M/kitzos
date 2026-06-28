"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DRAFT_PREFIX = "kitzos:tool-draft:";

export function getToolSlugFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const toolsIdx = segments.indexOf("tools");
  if (toolsIdx >= 0 && segments[toolsIdx + 1]) {
    return segments[toolsIdx + 1];
  }
  return null;
}

export function toolDraftKey(toolSlug: string, field: string): string {
  return `${DRAFT_PREFIX}${toolSlug}:${field}`;
}

export function toolImageSessionKey(toolSlug: string): string {
  return `kitzos:tool-image:${toolSlug}`;
}

/** Persist text tool input across locale switches (sessionStorage, locale-agnostic key). */
export function useToolDraft(field: string, initial = ""): [string, (value: string) => void] {
  const pathname = usePathname();
  const toolSlug = getToolSlugFromPath(pathname) ?? "unknown";
  const storageKey = toolDraftKey(toolSlug, field);
  const [value, setValue] = useState(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved != null) setValue(saved);
    } catch {
      // ignored
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (value) sessionStorage.setItem(storageKey, value);
      else sessionStorage.removeItem(storageKey);
    } catch {
      // ignored
    }
  }, [storageKey, value, hydrated]);

  return [value, setValue];
}
