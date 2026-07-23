/// <reference lib="webworker" />

/**
 * Off-main-thread PDF password encryption via qpdf-wasm.
 *
 * This qpdf build hard-binds stdout/stderr to console.log/error at init
 * (Module.print / printErr are ignored). Flooding DevTools with
 * "object has offset 0" warnings freezes the browser even from a Worker
 * because Chrome reconstructs async stacks across postMessage. We silence
 * console for init + callMain so warnings never reach DevTools.
 */

import createQpdf from "@neslinesli93/qpdf-wasm";

export type QpdfProtectRequest = {
  id: string;
  type: "encrypt";
  /** Transferable PDF bytes */
  pdfBytes: ArrayBuffer;
  password: string;
  /** Absolute URL to /qpdf.wasm */
  wasmUrl: string;
};

export type QpdfProtectResponse =
  | { id: string; type: "ok"; pdfBytes: ArrayBuffer }
  | { id: string; type: "error"; message: string };

type QpdfFs = {
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string, opts?: { encoding: "binary" }) => Uint8Array;
  unlink: (path: string) => void;
};

type QpdfInstance = {
  callMain: (args: string[]) => number;
  FS: QpdfFs;
};

const ENCRYPT_NEEDLE = new Uint8Array([
  0x2f, 0x45, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, // /Encrypt
]);

let qpdfPromise: Promise<QpdfInstance> | null = null;
let wasmUrlCached: string | null = null;

/** Mute console for the duration of fn (sync or async). */
function withSilencedConsole<T>(fn: () => T): T {
  const log = console.log;
  const warn = console.warn;
  const error = console.error;
  const info = console.info;
  const debug = console.debug;
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
  console.debug = noop;
  try {
    return fn();
  } finally {
    console.log = log;
    console.warn = warn;
    console.error = error;
    console.info = info;
    console.debug = debug;
  }
}

/**
 * Fast /Encrypt scan near trailer + header. Avoids pulling pdf-lib into the
 * worker and avoids a second full qpdf parse just for the encrypted check.
 */
function pdfBytesLookEncrypted(bytes: Uint8Array): boolean {
  const n = bytes.length;
  if (n < ENCRYPT_NEEDLE.length) return false;

  const findIn = (start: number, end: number): boolean => {
    const last = end - ENCRYPT_NEEDLE.length;
    outer: for (let i = start; i <= last; i++) {
      for (let j = 0; j < ENCRYPT_NEEDLE.length; j++) {
        if (bytes[i + j] !== ENCRYPT_NEEDLE[j]) continue outer;
      }
      return true;
    }
    return false;
  };

  if (findIn(Math.max(0, n - 131072), n)) return true;
  if (findIn(0, Math.min(n, 16384))) return true;
  return false;
}

function runQpdf(qpdf: QpdfInstance, args: string[]): number {
  try {
    return qpdf.callMain(args);
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      return Number((err as { status: number }).status);
    }
    const msg = err instanceof Error ? err.message : String(err);
    const m = /exit\((\d+)\)/i.exec(msg);
    if (m) return Number(m[1]);
    throw err;
  }
}

function getQpdf(wasmUrl: string): Promise<QpdfInstance> {
  if (!qpdfPromise || wasmUrlCached !== wasmUrl) {
    wasmUrlCached = wasmUrl;
    // Silence BEFORE createQpdf so console.log/error.bind capture no-ops.
    qpdfPromise = withSilencedConsole(
      () =>
        createQpdf({
          locateFile: () => wasmUrl,
        }) as unknown as Promise<QpdfInstance>
    );
  }
  return qpdfPromise;
}

function encryptWithQpdf(
  qpdf: QpdfInstance,
  pdfBytes: Uint8Array,
  password: string,
  jobId: string
): Uint8Array {
  if (pdfBytesLookEncrypted(pdfBytes)) {
    throw new Error("PDF_ENCRYPTED");
  }

  const inputPath = `/in-${jobId}.pdf`;
  const outputPath = `/out-${jobId}.pdf`;
  const fs = qpdf.FS;

  return withSilencedConsole(() => {
    try {
      fs.writeFile(inputPath, pdfBytes);
      // --warning-exit-0 / --no-warn: PDFs with recoverable issues
      // ("object has offset 0") still encrypt successfully but qpdf
      // would otherwise exit 3 — which we used to treat as failure.
      const code = runQpdf(qpdf, [
        "--warning-exit-0",
        "--no-warn",
        inputPath,
        "--encrypt",
        password,
        password,
        "256",
        "--",
        outputPath,
      ]);
      // 0 = clean success; 3 = warnings only (output still valid).
      // 2 = hard error (no usable output).
      if (code !== 0 && code !== 3) {
        throw new Error(`qpdf failed with exit code ${code}`);
      }
      return fs.readFile(outputPath);
    } finally {
      try {
        fs.unlink(inputPath);
      } catch {
        /* ignore */
      }
      try {
        fs.unlink(outputPath);
      } catch {
        /* ignore */
      }
    }
  });
}

self.onmessage = (event: MessageEvent<QpdfProtectRequest>) => {
  const msg = event.data;
  if (!msg || msg.type !== "encrypt") return;

  void (async () => {
    try {
      const qpdf = await getQpdf(msg.wasmUrl);
      const input = new Uint8Array(msg.pdfBytes);
      const out = encryptWithQpdf(qpdf, input, msg.password, msg.id);
      const transferable = out.buffer.slice(
        out.byteOffset,
        out.byteOffset + out.byteLength
      ) as ArrayBuffer;
      const response: QpdfProtectResponse = {
        id: msg.id,
        type: "ok",
        pdfBytes: transferable,
      };
      (self as DedicatedWorkerGlobalScope).postMessage(response, [transferable]);
    } catch (err) {
      const response: QpdfProtectResponse = {
        id: msg.id,
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      };
      (self as DedicatedWorkerGlobalScope).postMessage(response);
    }
  })();
};

export {};
