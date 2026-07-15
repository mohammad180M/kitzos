"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { renderPdfPageThumb } from "@/lib/pdf/thumbnails";

export interface MergeOrderFile {
  id: string;
  name: string;
  sizeLabel: string;
  pageCountLabel: string;
  file: File;
}

interface MergePdfOrderListProps {
  files: MergeOrderFile[];
  listAriaLabel: string;
  removeLabel: (name: string) => string;
  moveUpLabel: string;
  moveDownLabel: string;
  dragHandleLabel: string;
  fileMovedAnnounce: (position: number) => string;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  onAnnounce: (message: string) => void;
  onFilesDrop?: (fileList: FileList) => void;
  dropActiveHint?: string;
}

const MOVE_THRESHOLD_PX = 5;
const HOLD_MS = 200;
const HOLD_MOVE_CANCEL_PX = 10;
const EDGE_ZONE = 48;
const EDGE_SPEED = 14;
const SETTLE_MS = 150;
const FLASH_MS = 300;

/** First-page thumbs keyed by stable file id — never cleared by reorder. */
const thumbById = new Map<string, string>();

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const ctrlBtn =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-40 md:h-8 md:w-8";

function FileThumb({ id, file, name }: { id: string; file: File; name: string }) {
  const [src, setSrc] = useState<string | null>(() => thumbById.get(id) ?? null);

  useEffect(() => {
    const cached = thumbById.get(id);
    if (cached) {
      setSrc(cached);
      return;
    }
    let cancelled = false;
    void renderPdfPageThumb(file, 0, { scale: 0.22 })
      .then((url) => {
        if (cancelled) return;
        thumbById.set(id, url);
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, file]);

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--line)] bg-[var(--surface-2)] md:h-14 md:w-14">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- data-URL thumb from pdfjs
        <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
      ) : (
        <span className="px-1 text-center font-mono text-[10px] text-[var(--muted)]" aria-hidden="true">
          PDF
        </span>
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
}

interface DragSession {
  pointerId: number;
  fromIndex: number;
  /** Single source for placeholder position AND drop commit. */
  dropIndex: number;
  grabOffsetY: number;
  listLeft: number;
  rowWidth: number;
  rowHeight: number;
  pointerY: number;
  originTop: number;
}

interface SettleSession {
  file: MergeOrderFile;
  fromTop: number;
  toTop: number;
  left: number;
  width: number;
  commit: { from: number; to: number } | null;
}

type RowView =
  | { kind: "row"; file: MergeOrderFile; index: number }
  | { kind: "slot" };

export default function MergePdfOrderList({
  files,
  listAriaLabel,
  removeLabel,
  moveUpLabel,
  moveDownLabel,
  dragHandleLabel,
  fileMovedAnnounce,
  onReorder,
  onRemove,
  onAnnounce,
  onFilesDrop,
  dropActiveHint,
}: MergePdfOrderListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const slotRef = useRef<HTMLLIElement | null>(null);
  const pendingRef = useRef<{
    pointerId: number;
    fromIndex: number;
    startX: number;
    startY: number;
    grabOffsetY: number;
    listLeft: number;
    rowWidth: number;
    rowHeight: number;
    originTop: number;
  } | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const pointerYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const holdIntentRef = useRef<{
    pointerId: number;
    fromIndex: number;
    startX: number;
    startY: number;
    grabOffsetY: number;
    listLeft: number;
    rowWidth: number;
    rowHeight: number;
    originTop: number;
    target: HTMLButtonElement;
  } | null>(null);

  const [drag, setDrag] = useState<DragSession | null>(null);
  const [settle, setSettle] = useState<SettleSession | null>(null);
  const [settleArmed, setSettleArmed] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [osDropActive, setOsDropActive] = useState(false);
  const osDropDepth = useRef(0);

  const canReorder = files.length > 1;

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    const live = new Set(files.map((f) => f.id));
    Array.from(thumbById.keys()).forEach((id) => {
      if (!live.has(id)) thumbById.delete(id);
    });
  }, [files]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (settleTimerRef.current != null) window.clearTimeout(settleTimerRef.current);
      if (flashTimerRef.current != null) window.clearTimeout(flashTimerRef.current);
      if (holdTimerRef.current != null) window.clearTimeout(holdTimerRef.current);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const clearHold = () => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdIntentRef.current = null;
  };

  const armPending = (opts: NonNullable<typeof pendingRef.current>, target: HTMLButtonElement) => {
    pendingRef.current = opts;
    try {
      target.setPointerCapture(opts.pointerId);
    } catch {
      // capture may fail if pointer already released
    }
  };

  const clearBodyChrome = () => {
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const flashRow = useCallback((id: string) => {
    if (flashTimerRef.current != null) window.clearTimeout(flashTimerRef.current);
    setFlashId(id);
    flashTimerRef.current = window.setTimeout(() => {
      flashTimerRef.current = null;
      setFlashId(null);
    }, FLASH_MS);
  }, []);

  const computeDropIndex = useCallback(
    (pointerY: number, fromIndex: number) => {
      const remaining = files.length - 1;
      if (remaining <= 0) return 0;
      const mids: number[] = [];
      for (let i = 0; i < files.length; i++) {
        if (i === fromIndex) continue;
        const el = rowRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.height < 4) continue;
        mids.push(r.top + r.height / 2);
      }
      for (let k = 0; k < mids.length; k++) {
        if (pointerY < mids[k]) return k;
      }
      return remaining;
    },
    [files.length]
  );

  const autoScroll = useCallback((y: number) => {
    let scrolled = false;
    if (y < EDGE_ZONE) {
      window.scrollBy(0, -EDGE_SPEED);
      scrolled = true;
    } else if (y > window.innerHeight - EDGE_ZONE) {
      window.scrollBy(0, EDGE_SPEED);
      scrolled = true;
    }
    let node: HTMLElement | null = listRef.current;
    while (node) {
      const style = getComputedStyle(node);
      const scrollable =
        /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
      if (scrollable) {
        const r = node.getBoundingClientRect();
        if (y < r.top + EDGE_ZONE) {
          node.scrollTop -= EDGE_SPEED;
          scrolled = true;
        } else if (y > r.bottom - EDGE_ZONE) {
          node.scrollTop += EDGE_SPEED;
          scrolled = true;
        }
        break;
      }
      node = node.parentElement;
    }
    return scrolled;
  }, []);

  const finishSettle = useCallback(
    (commit: { from: number; to: number } | null) => {
      setSettle(null);
      setSettleArmed(false);
      dragRef.current = null;
      pendingRef.current = null;
      setDrag(null);
      clearBodyChrome();
      if (commit && commit.from !== commit.to) {
        onReorder(commit.from, commit.to);
        onAnnounce(fileMovedAnnounce(commit.to + 1));
        const moved = files[commit.from];
        if (moved) flashRow(moved.id);
      }
    },
    [fileMovedAnnounce, files, flashRow, onAnnounce, onReorder]
  );

  const beginSettle = useCallback(
    (session: SettleSession, freezeDropIndex: number) => {
      dragRef.current = null;
      pendingRef.current = null;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setDrag((prev) =>
        prev
          ? {
              ...prev,
              dropIndex: freezeDropIndex,
              pointerY: session.fromTop + prev.grabOffsetY,
            }
          : null
      );
      clearBodyChrome();
      setSettleArmed(false);
      setSettle(session);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSettleArmed(true));
      });
      if (settleTimerRef.current != null) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        finishSettle(session.commit);
      }, SETTLE_MS + 16);
    },
    [finishSettle]
  );

  const cancelDrag = useCallback(() => {
    const d = dragRef.current;
    if (!d) {
      pendingRef.current = null;
      return;
    }
    const file = files[d.fromIndex];
    if (!file) {
      dragRef.current = null;
      setDrag(null);
      clearBodyChrome();
      return;
    }
    const fromTop = d.pointerY - d.grabOffsetY;
    dragRef.current = null;
    setDrag({ ...d, dropIndex: d.fromIndex });
    requestAnimationFrame(() => {
      const slot = slotRef.current?.getBoundingClientRect();
      beginSettle(
        {
          file,
          fromTop,
          toTop: slot?.top ?? d.originTop,
          left: d.listLeft,
          width: d.rowWidth,
          commit: null,
        },
        d.fromIndex
      );
    });
  }, [beginSettle, files]);

  const dropDrag = useCallback(() => {
    const d = dragRef.current;
    if (!d) return;
    const file = files[d.fromIndex];
    if (!file) {
      cancelDrag();
      return;
    }
    const to = clamp(d.dropIndex, 0, files.length - 1);
    const slot = slotRef.current?.getBoundingClientRect();
    beginSettle(
      {
        file,
        fromTop: d.pointerY - d.grabOffsetY,
        toTop: slot?.top ?? d.originTop,
        left: d.listLeft,
        width: d.rowWidth,
        commit: { from: d.fromIndex, to },
      },
      to
    );
  }, [beginSettle, cancelDrag, files]);

  const tick = useCallback(() => {
    rafRef.current = null;
    const d = dragRef.current;
    if (!d) return;
    const y = pointerYRef.current;
    const scrolled = autoScroll(y);
    const dropIndex = computeDropIndex(y, d.fromIndex);
    const next: DragSession = { ...d, pointerY: y, dropIndex };
    dragRef.current = next;
    setDrag(next);
    if (scrolled) rafRef.current = requestAnimationFrame(tick);
  }, [autoScroll, computeDropIndex]);

  const scheduleTick = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      clearHold();
      if (dragRef.current) {
        e.preventDefault();
        cancelDrag();
      } else {
        pendingRef.current = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      const hold = holdIntentRef.current;
      if (hold && hold.pointerId === e.pointerId) {
        const dx = e.clientX - hold.startX;
        const dy = e.clientY - hold.startY;
        if (dx * dx + dy * dy >= HOLD_MOVE_CANCEL_PX * HOLD_MOVE_CANCEL_PX) {
          clearHold();
        }
      }

      const pending = pendingRef.current;
      if (pending && pending.pointerId === e.pointerId && !dragRef.current) {
        const dx = e.clientX - pending.startX;
        const dy = e.clientY - pending.startY;
        if (dx * dx + dy * dy >= MOVE_THRESHOLD_PX * MOVE_THRESHOLD_PX) {
          const session: DragSession = {
            pointerId: pending.pointerId,
            fromIndex: pending.fromIndex,
            dropIndex: pending.fromIndex,
            grabOffsetY: pending.grabOffsetY,
            listLeft: pending.listLeft,
            rowWidth: pending.rowWidth,
            rowHeight: pending.rowHeight,
            pointerY: e.clientY,
            originTop: pending.originTop,
          };
          pendingRef.current = null;
          dragRef.current = session;
          pointerYRef.current = e.clientY;
          setDrag(session);
          document.body.style.cursor = "grabbing";
          document.body.style.userSelect = "none";
        }
      }

      if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
      pointerYRef.current = e.clientY;
      scheduleTick();
    };

    const onUp = (e: PointerEvent) => {
      if (holdIntentRef.current?.pointerId === e.pointerId) {
        clearHold();
      }
      if (pendingRef.current?.pointerId === e.pointerId && !dragRef.current) {
        pendingRef.current = null;
        return;
      }
      if (dragRef.current?.pointerId !== e.pointerId) return;
      // Keep dropIndex as currently shown on the placeholder — do not recompute.
      dragRef.current.pointerY = e.clientY;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      dropDrag();
    };

    const onCancel = (e: PointerEvent) => {
      if (holdIntentRef.current?.pointerId === e.pointerId) clearHold();
      if (pendingRef.current?.pointerId === e.pointerId) pendingRef.current = null;
      if (dragRef.current?.pointerId === e.pointerId) cancelDrag();
    };

    const onBlur = () => {
      clearHold();
      if (dragRef.current) cancelDrag();
      pendingRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onBlur);
    };
  }, [cancelDrag, dropDrag, scheduleTick]);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (!canReorder || e.button !== 0 || settle) return;
    e.stopPropagation();
    const row = rowRefs.current[index];
    const list = listRef.current;
    if (!row || !list) return;
    const rowRect = row.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const geometry = {
      pointerId: e.pointerId,
      fromIndex: index,
      startX: e.clientX,
      startY: e.clientY,
      grabOffsetY: e.clientY - rowRect.top,
      listLeft: listRect.left,
      rowWidth: listRect.width,
      rowHeight: rowRect.height,
      originTop: rowRect.top,
    };
    const target = e.currentTarget;

    // Touch: press-and-hold so list scrolling never starts a drag. Mouse/pen: immediate.
    if (e.pointerType === "touch") {
      clearHold();
      holdIntentRef.current = { ...geometry, target };
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null;
        const intent = holdIntentRef.current;
        if (!intent || intent.pointerId !== geometry.pointerId) return;
        holdIntentRef.current = null;
        armPending(
          {
            pointerId: intent.pointerId,
            fromIndex: intent.fromIndex,
            startX: intent.startX,
            startY: intent.startY,
            grabOffsetY: intent.grabOffsetY,
            listLeft: intent.listLeft,
            rowWidth: intent.rowWidth,
            rowHeight: intent.rowHeight,
            originTop: intent.originTop,
          },
          intent.target
        );
      }, HOLD_MS);
      return;
    }

    e.preventDefault();
    clearHold();
    armPending(geometry, target);
  };

  const moveBy = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= files.length) return;
    const id = files[index]?.id;
    onReorder(index, to);
    onAnnounce(fileMovedAnnounce(to + 1));
    if (id) flashRow(id);
  };

  const views: RowView[] = [];
  if (drag) {
    let among = 0;
    for (let i = 0; i < files.length; i++) {
      if (i === drag.fromIndex) continue;
      if (among === drag.dropIndex) views.push({ kind: "slot" });
      views.push({ kind: "row", file: files[i], index: i });
      among += 1;
    }
    if (drag.dropIndex >= among) views.push({ kind: "slot" });
  }

  const draggingFile = drag ? files[drag.fromIndex] : null;

  const renderRowChrome = (
    file: MergeOrderFile,
    index: number,
    opts: { interactive: boolean; elevated?: boolean; orderNumber: number }
  ) => {
    const flashing = flashId === file.id;
    return (
      <div
        className={`flex flex-col gap-2 rounded-lg border border-[var(--line)] px-2.5 py-3 md:min-h-[3.75rem] md:flex-row md:items-center md:gap-2 md:px-2 md:py-2 ${
          flashing ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]"
        } ${
          opts.elevated
            ? "shadow-[0_16px_40px_color-mix(in_srgb,var(--bg)_75%,transparent)]"
            : ""
        } transition-colors duration-300 ease-out motion-reduce:transition-none`}
      >
        {/* Content: badge + thumb | name + meta (mirrors in RTL via flex) */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-2">
          <span
            className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] px-1.5 font-mono text-sm font-bold text-[var(--accent-ink)]"
            aria-hidden="true"
          >
            {opts.orderNumber}
          </span>
          <FileThumb id={file.id} file={file.file} name={file.name} />
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-medium text-[var(--text)]"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="truncate text-[11px] leading-snug text-[var(--muted)] md:text-xs">
              {file.pageCountLabel}
              <span aria-hidden="true"> · </span>
              {file.sizeLabel}
            </p>
          </div>
        </div>

        {/* Controls: 44×44 on mobile; extra gap before delete */}
        <div className="flex shrink-0 items-center justify-end gap-0.5 self-stretch md:gap-0 md:self-auto">
          {canReorder && (
            <>
              <button
                type="button"
                className={ctrlBtn}
                aria-label={moveUpLabel}
                disabled={!opts.interactive || index === 0}
                onClick={() => moveBy(index, -1)}
              >
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={ctrlBtn}
                aria-label={moveDownLabel}
                disabled={!opts.interactive || index === files.length - 1}
                onClick={() => moveBy(index, 1)}
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${ctrlBtn} touch-none ${
                  opts.interactive ? "cursor-grab" : "cursor-grabbing"
                }`}
                style={{ touchAction: "none" }}
                aria-label={dragHandleLabel}
                disabled={!opts.interactive}
                onPointerDown={
                  opts.interactive ? (ev) => onHandlePointerDown(ev, index) : undefined
                }
              >
                <GripVertical className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            className={`${ctrlBtn} ms-2 hover:text-[var(--cat-pdf)] md:ms-1`}
            aria-label={removeLabel(file.name)}
            disabled={!opts.interactive}
            onClick={() => onRemove(file.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg transition-colors ${
        osDropActive
          ? "bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
          : ""
      }`}
      onDragEnter={
        onFilesDrop
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              osDropDepth.current += 1;
              setOsDropActive(true);
            }
          : undefined
      }
      onDragLeave={
        onFilesDrop
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              osDropDepth.current = Math.max(0, osDropDepth.current - 1);
              if (osDropDepth.current === 0) setOsDropActive(false);
            }
          : undefined
      }
      onDragOver={
        onFilesDrop
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
            }
          : undefined
      }
      onDrop={
        onFilesDrop
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              osDropDepth.current = 0;
              setOsDropActive(false);
              if (e.dataTransfer.files.length > 0) onFilesDrop(e.dataTransfer.files);
            }
          : undefined
      }
    >
      {osDropActive && dropActiveHint && (
        <p className="mb-2 text-center text-xs font-medium text-[var(--accent)]">{dropActiveHint}</p>
      )}

      <ul ref={listRef} className="space-y-2" aria-label={listAriaLabel}>
        {!drag &&
          files.map((file, index) => (
            <li
              key={file.id}
              ref={(el) => {
                rowRefs.current[index] = el;
              }}
              className="transition-[margin,transform] duration-150 ease-out motion-reduce:transition-none"
            >
              {renderRowChrome(file, index, {
                interactive: !settle,
                orderNumber: index + 1,
              })}
            </li>
          ))}

        {drag &&
          (() => {
            let nextNumber = 1;
            return views.map((view) => {
              if (view.kind === "slot") {
                nextNumber += 1; // reserved for the dragged row
                return (
                  <li
                    key="__drop-slot__"
                    ref={slotRef}
                    className="box-border list-none rounded-lg border-2 border-dashed border-[var(--success)] bg-[var(--success-tint)] transition-[height,margin] duration-150 ease-out motion-reduce:transition-none"
                    style={{ height: drag.rowHeight }}
                    aria-hidden="true"
                  />
                );
              }
              const orderNumber = nextNumber;
              nextNumber += 1;
              return (
                <li
                  key={view.file.id}
                  ref={(el) => {
                    rowRefs.current[view.index] = el;
                  }}
                  className="transition-[margin,transform] duration-150 ease-out motion-reduce:transition-none"
                >
                  {renderRowChrome(view.file, view.index, {
                    interactive: false,
                    orderNumber,
                  })}
                </li>
              );
            });
          })()}
      </ul>

      {portalReady &&
        draggingFile &&
        drag &&
        !settle &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] will-change-transform"
            style={{
              left: 0,
              top: 0,
              width: drag.rowWidth,
              transform: `translate3d(${drag.listLeft}px, ${drag.pointerY - drag.grabOffsetY}px, 0) scale(1.02)`,
            }}
            aria-hidden="true"
          >
            {renderRowChrome(draggingFile, drag.fromIndex, {
              interactive: false,
              elevated: true,
              orderNumber: drag.dropIndex + 1,
            })}
          </div>,
          document.body
        )}

      {portalReady &&
        settle &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] will-change-transform"
            style={{
              left: 0,
              top: 0,
              width: settle.width,
              transform: settleArmed
                ? `translate3d(${settle.left}px, ${settle.toTop}px, 0) scale(1)`
                : `translate3d(${settle.left}px, ${settle.fromTop}px, 0) scale(1.02)`,
              transition: settleArmed ? `transform ${SETTLE_MS}ms ease-out` : "none",
            }}
            aria-hidden="true"
          >
            {renderRowChrome(settle.file, 0, {
              interactive: false,
              elevated: true,
              orderNumber: settle.commit ? settle.commit.to + 1 : 1,
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
