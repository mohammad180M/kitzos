/**
 * Process items with limited concurrency. Calls `onUpdate` whenever an item's
 * status changes so React state can reflect progress.
 */
export async function runConcurrentQueue<TItem extends { id: string }>(opts: {
  items: TItem[];
  concurrency: number;
  process: (
    item: TItem,
    onProgress: (pct: number) => void
  ) => Promise<void>;
  onItemStart: (id: string) => void;
  onItemProgress: (id: string, pct: number) => void;
  onItemDone: (id: string) => void;
  onItemError: (id: string, message: string) => void;
}): Promise<void> {
  const { items, concurrency, process, onItemStart, onItemProgress, onItemDone, onItemError } =
    opts;
  if (items.length === 0) return;

  let nextIndex = 0;

  const runNext = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      const item = items[index]!;
      onItemStart(item.id);
      try {
        await process(item, (pct) => onItemProgress(item.id, pct));
        onItemDone(item.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Processing failed";
        onItemError(item.id, message);
      }
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runNext());
  await Promise.all(workers);
}
