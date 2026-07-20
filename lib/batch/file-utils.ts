/** Format byte size for display in batch file lists. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extMatches(file: File, ext: string): boolean {
  const normalized = ext.startsWith(".") ? ext.slice(1).toLowerCase() : ext.toLowerCase();
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  return fileExt === normalized;
}

/** Match a File against accept tokens (MIME types, wildcards, extensions). */
export function fileMatchesAccept(file: File, acceptedTypes: string[]): boolean {
  if (acceptedTypes.length === 0) return true;

  for (const token of acceptedTypes) {
    const t = token.trim().toLowerCase();
    if (!t) continue;

    if (t.startsWith(".")) {
      if (extMatches(file, t)) return true;
      continue;
    }

    if (t.endsWith("/*")) {
      const prefix = t.slice(0, -1);
      if (file.type && file.type.toLowerCase().startsWith(prefix)) return true;
      continue;
    }

    if (file.type && file.type.toLowerCase() === t) return true;
  }

  return false;
}

async function readFileEntry(entry: FileSystemFileEntry): Promise<File | null> {
  return new Promise((resolve) => {
    entry.file(
      (file) => resolve(file),
      () => resolve(null)
    );
  });
}

async function readDirectoryEntry(entry: FileSystemDirectoryEntry): Promise<File[]> {
  const reader = entry.createReader();
  const files: File[] = [];

  const readBatch = (): Promise<FileSystemEntry[]> =>
    new Promise((resolve, reject) => {
      reader.readEntries(
        (entries) => resolve(entries),
        (err) => reject(err)
      );
    });

  let entries = await readBatch();
  while (entries.length > 0) {
    for (const child of entries) {
      if (child.isFile) {
        const file = await readFileEntry(child as FileSystemFileEntry);
        if (file) files.push(file);
      } else if (child.isDirectory) {
        const nested = await readDirectoryEntry(child as FileSystemDirectoryEntry);
        files.push(...nested);
      }
    }
    entries = await readBatch();
  }

  return files;
}

async function entryToFiles(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    const file = await readFileEntry(entry as FileSystemFileEntry);
    return file ? [file] : [];
  }
  if (entry.isDirectory) {
    return readDirectoryEntry(entry as FileSystemDirectoryEntry);
  }
  return [];
}

export interface CollectedFiles {
  accepted: File[];
  skipped: number;
}

export function filterAcceptedFiles(files: File[], acceptedTypes: string[]): CollectedFiles {
  const accepted: File[] = [];
  let skipped = 0;
  for (const file of files) {
    if (fileMatchesAccept(file, acceptedTypes)) {
      accepted.push(file);
    } else {
      skipped += 1;
    }
  }
  return { accepted, skipped };
}

export async function collectFilesFromDataTransfer(
  dataTransfer: DataTransfer,
  acceptedTypes: string[]
): Promise<CollectedFiles> {
  const items = dataTransfer.items;
  const allFiles: File[] = [];

  if (items && items.length > 0) {
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry?.();
        if (entry) entries.push(entry);
        else {
          const file = item.getAsFile();
          if (file) allFiles.push(file);
        }
      }
    }
    for (const entry of entries) {
      allFiles.push(...(await entryToFiles(entry)));
    }
  } else if (dataTransfer.files.length > 0) {
    allFiles.push(...Array.from(dataTransfer.files));
  }

  return filterAcceptedFiles(allFiles, acceptedTypes);
}

export function collectFilesFromFileList(
  fileList: FileList | File[],
  acceptedTypes: string[]
): CollectedFiles {
  return filterAcceptedFiles(Array.from(fileList), acceptedTypes);
}

export function newBatchFileId(file: File): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`;
}

export function supportsFolderUpload(): boolean {
  if (typeof window === "undefined") return false;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return false;
  const input = document.createElement("input");
  return "webkitdirectory" in input;
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(file.name);
}

export function imageThumbnailUrl(file: File): string | undefined {
  if (isImageFile(file)) return URL.createObjectURL(file);
  return undefined;
}
