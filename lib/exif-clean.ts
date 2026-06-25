import piexif from "piexifjs";
import type { ExifGroup } from "./exif-metadata";

const TAG_MAP: Record<string, { ifd: "0th" | "Exif" | "1st" | "GPS"; tag: number }> = {
  Make: { ifd: "0th", tag: piexif.ImageIFD.Make },
  Model: { ifd: "0th", tag: piexif.ImageIFD.Model },
  Software: { ifd: "0th", tag: piexif.ImageIFD.Software },
  Artist: { ifd: "0th", tag: piexif.ImageIFD.Artist },
  Copyright: { ifd: "0th", tag: piexif.ImageIFD.Copyright },
  DateTime: { ifd: "0th", tag: piexif.ImageIFD.DateTime },
  Orientation: { ifd: "0th", tag: piexif.ImageIFD.Orientation },
  ImageDescription: { ifd: "0th", tag: piexif.ImageIFD.ImageDescription },
  XResolution: { ifd: "0th", tag: piexif.ImageIFD.XResolution },
  YResolution: { ifd: "0th", tag: piexif.ImageIFD.YResolution },
  DateTimeOriginal: { ifd: "Exif", tag: piexif.ExifIFD.DateTimeOriginal },
  DateTimeDigitized: { ifd: "Exif", tag: piexif.ExifIFD.DateTimeDigitized },
  CreateDate: { ifd: "Exif", tag: piexif.ExifIFD.DateTimeOriginal },
  ModifyDate: { ifd: "Exif", tag: piexif.ExifIFD.DateTimeOriginal },
  ExposureTime: { ifd: "Exif", tag: piexif.ExifIFD.ExposureTime },
  FNumber: { ifd: "Exif", tag: piexif.ExifIFD.FNumber },
  ISO: { ifd: "Exif", tag: piexif.ExifIFD.ISOSpeedRatings },
  FocalLength: { ifd: "Exif", tag: piexif.ExifIFD.FocalLength },
  LensModel: { ifd: "Exif", tag: piexif.ExifIFD.LensModel },
  Flash: { ifd: "Exif", tag: piexif.ExifIFD.Flash },
  WhiteBalance: { ifd: "Exif", tag: piexif.ExifIFD.WhiteBalance },
  UserComment: { ifd: "Exif", tag: piexif.ExifIFD.UserComment },
  ColorSpace: { ifd: "Exif", tag: piexif.ExifIFD.ColorSpace },
};

const GPS_KEYS = new Set([
  "latitude",
  "longitude",
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitude",
  "GPSAltitudeRef",
  "GPSTimeStamp",
  "GPSDateStamp",
  "GPSImgDirection",
  "GPSDestLatitude",
  "GPSDestLongitude",
]);

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function canvasStrip(file: File, onProgress: (n: number) => void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    onProgress(20);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      onProgress(50);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      onProgress(85);
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = mime === "image/jpeg" ? 0.92 : undefined;
      canvas.toBlob(
        (blob) => {
          onProgress(100);
          if (blob) resolve(blob);
          else reject(new Error("Export failed"));
        },
        mime,
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

function cleanJpeg(dataUrl: string, selected: Set<string>): string {
  let exifObj: ReturnType<typeof piexif.load>;
  try {
    exifObj = piexif.load(dataUrl);
  } catch {
    return dataUrl;
  }

  const hasGps = Array.from(selected).some(
    (k) => GPS_KEYS.has(k) || k.toLowerCase().includes("gps")
  );
  if (hasGps && exifObj.GPS) delete exifObj.GPS;

  Array.from(selected).forEach((key) => {
    const mapping = TAG_MAP[key];
    if (!mapping) return;
    const ifd = exifObj[mapping.ifd];
    if (ifd && mapping.tag in ifd) delete ifd[mapping.tag];
  });

  const isEmpty = (ifd: Record<string, unknown> | undefined) => !ifd || Object.keys(ifd).length === 0;
  if (isEmpty(exifObj["0th"]) && isEmpty(exifObj.Exif) && isEmpty(exifObj["1st"]) && !exifObj.GPS) {
    return piexif.remove(dataUrl);
  }

  try {
    return piexif.insert(piexif.dump(exifObj), dataUrl);
  } catch {
    return piexif.remove(dataUrl);
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function cleanImage(
  file: File,
  groups: ExifGroup[],
  selected: Set<string>,
  onProgress: (n: number) => void
): Promise<Blob> {
  onProgress(5);

  const allKeys = groups.flatMap((g) => g.fields.map((f) => f.key));
  const stripAll = selected.size === 0 || selected.size >= allKeys.length;
  const isJpeg = file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name);

  if (!isJpeg || stripAll) {
    return canvasStrip(file, onProgress);
  }

  onProgress(25);
  const dataUrl = await fileToDataUrl(file);
  onProgress(60);
  const cleaned = cleanJpeg(dataUrl, selected);
  onProgress(100);
  return dataUrlToBlob(cleaned);
}

export function outputFilename(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, "");
  const ext = file.type === "image/png" ? "png" : "jpg";
  return `clean-${base}.${ext}`;
}
