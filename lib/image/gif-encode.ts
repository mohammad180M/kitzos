export async function encodeGifFromCanvases(
  frames: HTMLCanvasElement[],
  delayMs: number,
  loop: boolean,
  onProgress?: (pct: number) => void
): Promise<Uint8Array> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const gif = GIFEncoder();
  const delayCs = Math.max(1, Math.round(delayMs / 10));

  for (let i = 0; i < frames.length; i++) {
    const canvas = frames[i];
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, {
      palette,
      delay: delayCs,
      dispose: 2,
    });
    onProgress?.(Math.round(((i + 1) / frames.length) * 100));
    if (i % 3 === 0) await new Promise((r) => setTimeout(r, 0));
  }

  gif.finish();
  const bytes = gif.bytes();
  if (!loop && bytes.length > 13) {
    bytes[11] = 1;
  }
  return bytes;
}
