import exifr from "exifr";

export interface ExifField {
  key: string;
  label: string;
  value: string;
  dangerous: boolean;
}

export interface ExifGroup {
  id: string;
  label: string;
  fields: ExifField[];
}

const DANGEROUS_KEYS = new Set([
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
  "GPSProcessingMethod",
  "GPSAreaInformation",
  "GPSHPositioningError",
  "SerialNumber",
  "LensSerialNumber",
  "BodySerialNumber",
  "CameraSerialNumber",
  "OwnerName",
  "UserComment",
  "ImageUniqueID",
  "DeviceSettingDescription",
]);

const LABELS: Record<string, string> = {
  Make: "Camera make",
  Model: "Camera model",
  Software: "Software",
  Artist: "Artist",
  Copyright: "Copyright",
  DateTimeOriginal: "Date taken",
  DateTimeDigitized: "Date digitized",
  CreateDate: "Create date",
  ModifyDate: "Modify date",
  ExposureTime: "Exposure time",
  FNumber: "Aperture",
  ISO: "ISO",
  FocalLength: "Focal length",
  LensModel: "Lens model",
  Flash: "Flash",
  WhiteBalance: "White balance",
  Orientation: "Orientation",
  ImageWidth: "Image width",
  ImageHeight: "Image height",
  XResolution: "X resolution",
  YResolution: "Y resolution",
  ColorSpace: "Color space",
  latitude: "GPS latitude",
  longitude: "GPS longitude",
  GPSLatitude: "GPS latitude",
  GPSLongitude: "GPS longitude",
  GPSAltitude: "GPS altitude",
  SerialNumber: "Serial number",
  UserComment: "User comment",
};

function formatValue(value: unknown): string {
  if (value == null) return "—";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isDangerous(key: string): boolean {
  const lower = key.toLowerCase();
  if (DANGEROUS_KEYS.has(key)) return true;
  if (lower.includes("gps")) return true;
  if (lower.includes("serial")) return true;
  if (lower.includes("location")) return true;
  return false;
}

function groupForKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.includes("gps") || key === "latitude" || key === "longitude") return "location";
  if (["Make", "Model", "Software", "LensModel", "SerialNumber", "LensSerialNumber", "BodySerialNumber"].includes(key))
    return "device";
  if (lower.includes("date") || lower.includes("time")) return "datetime";
  if (["Artist", "Copyright", "OwnerName", "UserComment", "ImageDescription"].includes(key)) return "identity";
  if (["ExposureTime", "FNumber", "ISO", "FocalLength", "Flash", "WhiteBalance"].includes(key)) return "camera";
  return "other";
}

const GROUP_LABELS: Record<string, string> = {
  location: "GPS & location",
  device: "Device info",
  datetime: "Dates & times",
  identity: "Identity & comments",
  camera: "Camera settings",
  other: "Other metadata",
};

export async function parseExifFields(file: File): Promise<ExifGroup[]> {
  const raw = await exifr.parse(file, {
    tiff: true,
    xmp: true,
    iptc: true,
    mergeOutput: false,
  }).catch(() => null);

  if (!raw || typeof raw !== "object") return [];

  const grouped = new Map<string, ExifField[]>();

  for (const [key, value] of Object.entries(raw)) {
    if (value == null || key.startsWith("_")) continue;
    const groupId = groupForKey(key);
    const fields = grouped.get(groupId) ?? [];
    fields.push({
      key,
      label: LABELS[key] ?? key,
      value: formatValue(value),
      dangerous: isDangerous(key),
    });
    grouped.set(groupId, fields);
  }

  const order = ["location", "identity", "device", "datetime", "camera", "other"];
  return order
    .filter((id) => grouped.has(id))
    .map((id) => ({
      id,
      label: GROUP_LABELS[id],
      fields: grouped.get(id)!.sort((a, b) => a.label.localeCompare(b.label)),
    }));
}

export function defaultSelectedKeys(groups: ExifGroup[]): Set<string> {
  const keys = new Set<string>();
  for (const g of groups) {
    for (const f of g.fields) {
      if (f.dangerous) keys.add(f.key);
    }
  }
  return keys;
}

