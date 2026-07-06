"use client";

import { useEffect, useSyncExternalStore } from "react";

let unsavedCount = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let beforeUnloadAttached = false;

function onBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  e.returnValue = "";
}

function syncBeforeUnload() {
  if (typeof window === "undefined") return;

  if (unsavedCount > 0 && !beforeUnloadAttached) {
    window.addEventListener("beforeunload", onBeforeUnload);
    beforeUnloadAttached = true;
  } else if (unsavedCount === 0 && beforeUnloadAttached) {
    window.removeEventListener("beforeunload", onBeforeUnload);
    beforeUnloadAttached = false;
  }
}

export function markUnsaved() {
  unsavedCount += 1;
  syncBeforeUnload();
  notify();
}

export function markSaved() {
  if (unsavedCount > 0) {
    unsavedCount -= 1;
    syncBeforeUnload();
    notify();
  }
}

export function hasUnsavedWork(): boolean {
  return unsavedCount > 0;
}

export function useUnsavedWork(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    markUnsaved();
    return () => {
      markSaved();
    };
  }, [dirty]);
}

export function useHasUnsavedWork(): boolean {
  return useSyncExternalStore(subscribe, () => unsavedCount > 0, () => false);
}
