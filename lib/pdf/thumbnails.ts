type PdfJsModule = typeof import("pdfjs-dist");
type PDFDocumentProxy = import("pdfjs-dist").PDFDocumentProxy;

let pdfjsPromise: Promise<PdfJsModule> | undefined;

export async function getPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

const docCache = new Map<string, { doc: PDFDocumentProxy }>();

export async function loadPdfDocument(file: File): Promise<PDFDocumentProxy> {
  const key = fileKey(file);
  const cached = docCache.get(key);
  if (cached) return cached.doc;

  const pdfjs = await getPdfjs();
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  docCache.set(key, { doc });
  return doc;
}

function disposePdfDocument(doc: PDFDocumentProxy): void {
  const disposable = doc as PDFDocumentProxy & { destroy?: () => Promise<void> };
  if (typeof disposable.destroy === "function") {
    void disposable.destroy();
  }
}

export function releasePdfDocument(file: File): void {
  const key = fileKey(file);
  const cached = docCache.get(key);
  if (cached) {
    disposePdfDocument(cached.doc);
    docCache.delete(key);
  }
}

export function releaseAllPdfDocuments(): void {
  docCache.forEach(({ doc }) => disposePdfDocument(doc));
  docCache.clear();
}

export async function getPdfPageCount(file: File): Promise<number> {
  const doc = await loadPdfDocument(file);
  return doc.numPages;
}

export interface ThumbOptions {
  scale?: number;
  rotation?: number;
}

export async function renderPdfPageThumb(
  file: File,
  pageIndex: number,
  options: ThumbOptions = {}
): Promise<string> {
  const scale = options.scale ?? 0.35;
  const rotation = options.rotation ?? 0;
  const doc = await loadPdfDocument(file);
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas.toDataURL("image/jpeg", 0.75);
}

export async function renderPdfBytesPageThumb(
  bytes: Uint8Array,
  pageIndex: number,
  options: ThumbOptions = {}
): Promise<string> {
  const scale = options.scale ?? 0.35;
  const rotation = options.rotation ?? 0;
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  const url = canvas.toDataURL("image/jpeg", 0.75);
  disposePdfDocument(doc);
  return url;
}

export async function renderPdfPageToCanvas(
  file: File,
  pageIndex: number,
  options: ThumbOptions = {}
): Promise<HTMLCanvasElement> {
  const scale = options.scale ?? 0.5;
  const rotation = options.rotation ?? 0;
  const doc = await loadPdfDocument(file);
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}
