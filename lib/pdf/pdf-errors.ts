/**
 * Shared detection for password-protected / encrypted PDFs.
 *
 * pdf-lib throws EncryptedPDFError with message:
 *   "Input document to `PDFDocument.load` is encrypted..."
 * (class name is often just "Error" after transpile — match the message.)
 *
 * pdf.js throws PasswordException (name "PasswordException", code NEED_PASSWORD / INCORRECT_PASSWORD).
 */

export class PdfEncryptedError extends Error {
  readonly code = "PDF_ENCRYPTED" as const;

  constructor() {
    super("PDF_ENCRYPTED");
    this.name = "PdfEncryptedError";
  }
}

const PDF_LIB_ENCRYPTED_MSG =
  /Input document to `PDFDocument\.load` is encrypted/i;

export function isPdfEncryptedError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof PdfEncryptedError) return true;

  if (typeof err === "object") {
    const e = err as { name?: string; message?: string; code?: number | string };
    if (e.name === "PdfEncryptedError" || e.name === "EncryptedPDFError") return true;
    // pdf.js: PasswordException (NEED_PASSWORD / INCORRECT_PASSWORD)
    if (e.name === "PasswordException") return true;
    if (e.code === "PDF_ENCRYPTED") return true;
    if (typeof e.message === "string" && PDF_LIB_ENCRYPTED_MSG.test(e.message)) {
      return true;
    }
  }

  if (typeof err === "string" && PDF_LIB_ENCRYPTED_MSG.test(err)) return true;
  return false;
}

/** Map a caught error to a localized user-facing string. */
export function localizePdfError(
  err: unknown,
  labels: { errEncrypted: string; fallback: string }
): string {
  return isPdfEncryptedError(err) ? labels.errEncrypted : labels.fallback;
}

/** For batch `processFile` — throws Error with the localized message. */
export function rethrowLocalizedPdfError(
  err: unknown,
  labels: { errEncrypted: string; fallback: string }
): never {
  throw new Error(localizePdfError(err, labels));
}

/** Convert known library encryption failures into PdfEncryptedError. */
export function promotePdfEncryptedError(err: unknown): never {
  if (isPdfEncryptedError(err)) throw new PdfEncryptedError();
  throw err;
}
