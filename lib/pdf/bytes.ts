/**
 * pdf-lib may detach an ArrayBuffer passed to PDFDocument.load().
 * Always keep an independent copy for re-load / download, and pass .slice() into load().
 */

export async function readPdfFileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/** Independent copy safe to store after pdf-lib has loaded other views. */
export function clonePdfBytes(bytes: Uint8Array): Uint8Array {
  return bytes.slice();
}

/** Bytes to pass into PDFDocument.load without invalidating the stored original. */
export function bytesForPdfLoad(bytes: Uint8Array): Uint8Array {
  return bytes.slice();
}

/** Blob from pdf-lib save() — avoids RangeError on detached or subarray backing buffers. */
export function pdfBytesToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes.slice()], { type: "application/pdf" });
}
