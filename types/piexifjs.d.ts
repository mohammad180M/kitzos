declare module "piexifjs" {
  interface ExifObject {
    "0th"?: Record<number, unknown>;
    Exif?: Record<number, unknown>;
    "1st"?: Record<number, unknown>;
    GPS?: Record<number, unknown>;
    thumbnail?: string | null;
  }

  const ImageIFD: Record<string, number>;
  const ExifIFD: Record<string, number>;
  const GPSIFD: Record<string, number>;

  function load(dataUrl: string): ExifObject;
  function dump(exifObj: ExifObject): string;
  function insert(exifBytes: string, dataUrl: string): string;
  function remove(dataUrl: string): string;

  export default {
    ImageIFD,
    ExifIFD,
    GPSIFD,
    load,
    dump,
    insert,
    remove,
  };
}
