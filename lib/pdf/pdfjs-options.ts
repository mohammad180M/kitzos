/**
 * Shared PDF.js document open options.
 * cMaps + standard fonts must be served from /public/pdfjs (synced by generate-assets).
 */
export const PDFJS_CMAP_URL = "/pdfjs/cmaps/";
export const PDFJS_STANDARD_FONT_DATA_URL = "/pdfjs/standard_fonts/";

export function pdfjsGetDocumentParams(data: ArrayBuffer | Uint8Array) {
  return {
    data,
    cMapUrl: PDFJS_CMAP_URL,
    cMapPacked: true as const,
    standardFontDataUrl: PDFJS_STANDARD_FONT_DATA_URL,
  };
}
