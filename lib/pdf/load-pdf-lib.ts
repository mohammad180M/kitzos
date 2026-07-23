/**
 * Central pdf-lib document open. Suppresses known-noisy parse recovery warnings
 * that flood the browser console on imperfect (but still usable) PDFs.
 *
 * pdf-lib logs "Trying to parse invalid object" / "Invalid object ref" when it
 * recovers from non-standard structure — processing usually continues fine.
 *
 * Encrypted PDFs are rethrown as PdfEncryptedError for consistent UI messaging.
 */
import { PDFDocument, type LoadOptions } from "pdf-lib";
import { promotePdfEncryptedError } from "@/lib/pdf/pdf-errors";

const PDF_LIB_NOISE =
  /Trying to parse invalid object|Invalid object ref:|Removing parsed object: 0 0 R/;

export async function loadPdfLibDocument(
  pdf: Uint8Array | ArrayBuffer,
  options: LoadOptions = {}
): Promise<PDFDocument> {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === "string" && PDF_LIB_NOISE.test(first)) return;
    originalWarn.apply(console, args as Parameters<typeof console.warn>);
  };

  try {
    return await PDFDocument.load(pdf, {
      throwOnInvalidObject: false,
      ...options,
    });
  } catch (err) {
    promotePdfEncryptedError(err);
  } finally {
    console.warn = originalWarn;
  }
}
