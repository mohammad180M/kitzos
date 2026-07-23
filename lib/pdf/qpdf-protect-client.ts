/**
 * Main-thread client for the qpdf protect Web Worker.
 * Pool size matches BatchUploader concurrency (2) so parallel jobs don't
 * serialize onto one worker while still keeping the UI thread free.
 */

import { PdfEncryptedError } from "@/lib/pdf/pdf-errors";
import type { QpdfProtectRequest, QpdfProtectResponse } from "@/workers/qpdf-protect.worker";

const POOL_SIZE = 2;

type Pending = {
  resolve: (bytes: Uint8Array) => void;
  reject: (err: Error) => void;
};

type PooledWorker = {
  worker: Worker;
  busy: boolean;
  currentJobId: string | null;
};

let pool: PooledWorker[] | null = null;
const waiters: Array<(slot: PooledWorker) => void> = [];
const pendingById = new Map<string, Pending>();
let jobSeq = 0;

function wasmUrl(): string {
  if (typeof window === "undefined") {
    throw new Error("qpdf protect requires a browser");
  }
  return new URL("/qpdf.wasm", window.location.origin).href;
}

function releaseSlot(slot: PooledWorker) {
  slot.busy = false;
  slot.currentJobId = null;
  const next = waiters.shift();
  if (next) {
    slot.busy = true;
    next(slot);
  }
}

function rejectForMessage(message: string): Error {
  if (message === "PDF_ENCRYPTED") return new PdfEncryptedError();
  return new Error(message || "qpdf failed");
}

function createWorker(): PooledWorker {
  const worker = new Worker(
    new URL("../../workers/qpdf-protect.worker.ts", import.meta.url)
  );
  const slot: PooledWorker = { worker, busy: false, currentJobId: null };

  worker.onmessage = (event: MessageEvent<QpdfProtectResponse>) => {
    const msg = event.data;
    const pending = pendingById.get(msg.id);
    if (!pending) return;
    pendingById.delete(msg.id);
    releaseSlot(slot);

    if (msg.type === "ok") {
      pending.resolve(new Uint8Array(msg.pdfBytes));
    } else {
      pending.reject(rejectForMessage(msg.message));
    }
  };

  worker.onerror = (event) => {
    const message = event.message || "qpdf worker crashed";
    const jobId = slot.currentJobId;
    if (jobId) {
      const pending = pendingById.get(jobId);
      if (pending) {
        pendingById.delete(jobId);
        pending.reject(new Error(message));
      }
    }
    releaseSlot(slot);
  };

  return slot;
}

function ensurePool(): PooledWorker[] {
  if (!pool) {
    pool = Array.from({ length: POOL_SIZE }, () => createWorker());
  }
  return pool;
}

function acquireSlot(): Promise<PooledWorker> {
  const slots = ensurePool();
  const free = slots.find((s) => !s.busy);
  if (free) {
    free.busy = true;
    return Promise.resolve(free);
  }
  return new Promise((resolve) => {
    waiters.push((slot) => resolve(slot));
  });
}

/** Own a transferable ArrayBuffer without an extra full copy when possible. */
function toTransferableBuffer(pdfBytes: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = pdfBytes;
  if (
    buffer instanceof ArrayBuffer &&
    byteOffset === 0 &&
    byteLength === buffer.byteLength
  ) {
    return buffer;
  }
  return pdfBytes.slice().buffer.slice(0) as ArrayBuffer;
}

/**
 * Encrypt PDF bytes with a password off the main thread.
 * Throws PdfEncryptedError if the PDF is already encrypted.
 * Throws on non-zero qpdf exit / worker crash. Warnings are silenced in-worker.
 */
export async function encryptPdfBytesInWorker(
  pdfBytes: Uint8Array,
  password: string
): Promise<Uint8Array> {
  const id = `qpdf-${++jobSeq}-${Math.random().toString(36).slice(2, 9)}`;
  const slot = await acquireSlot();
  const buffer = toTransferableBuffer(pdfBytes);

  return new Promise<Uint8Array>((resolve, reject) => {
    pendingById.set(id, { resolve, reject });
    slot.currentJobId = id;

    const request: QpdfProtectRequest = {
      id,
      type: "encrypt",
      pdfBytes: buffer,
      password,
      wasmUrl: wasmUrl(),
    };

    try {
      slot.worker.postMessage(request, [buffer]);
    } catch (err) {
      pendingById.delete(id);
      releaseSlot(slot);
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
