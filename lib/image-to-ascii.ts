/** Dark → light charset for ASCII art (luminance mapping). */
const CHARSET = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

/** Monospace chars are ~2× taller than wide — compensate row sampling. */
const CHAR_ASPECT = 0.5;

export function imageToAsciiArt(
  img: HTMLImageElement,
  cols: number,
  invert: boolean
): string {
  const safeCols = Math.max(20, Math.min(200, cols));
  const rows = Math.max(
    10,
    Math.round((img.naturalHeight / img.naturalWidth) * safeCols * CHAR_ASPECT)
  );

  const canvas = document.createElement("canvas");
  canvas.width = safeCols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, safeCols, rows);
  ctx.drawImage(img, 0, 0, safeCols, rows);

  const data = ctx.getImageData(0, 0, safeCols, rows).data;
  const lines: string[] = [];

  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < safeCols; x++) {
      const i = (y * safeCols + x) * 4;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      let idx = Math.floor((lum / 255) * (CHARSET.length - 1));
      if (invert) idx = CHARSET.length - 1 - idx;
      line += CHARSET[idx];
    }
    lines.push(line);
  }

  return lines.join("\n");
}
