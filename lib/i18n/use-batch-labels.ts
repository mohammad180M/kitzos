import { useLocale } from "./LocaleProvider";

/** Labels for BatchUploader and ToolModeToggle. */
export function useBatchLabels() {
  const { t } = useLocale();
  const b = t.common.batch;
  return {
    ...b,
    skippedFiles: (count: number) => b.skippedFiles.replace("{count}", String(count)),
    progress: (done: number, total: number) =>
      b.progress.replace("{done}", String(done)).replace("{total}", String(total)),
  };
}
