/** Build QR payloads for local content types (no cloud hosting). */

export type QrContentType =
  | "website"
  | "text"
  | "wifi"
  | "email"
  | "phone"
  | "vcard"
  | "pdf"
  | "image"
  | "video";

export interface WifiFields {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface VCardFields {
  name: string;
  phone: string;
  email: string;
  org: string;
  url: string;
}

function escapeWifi(s: string) {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

export function buildQrPayload(
  type: QrContentType,
  fields: {
    text?: string;
    url?: string;
    wifi?: WifiFields;
    email?: string;
    phone?: string;
    vcard?: VCardFields;
  }
): string {
  switch (type) {
    case "text":
      return (fields.text ?? "").trim();
    case "website":
    case "pdf":
    case "image":
    case "video": {
      const u = (fields.url ?? "").trim();
      if (!u) return "";
      if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u) || /^tel:/i.test(u)) return u;
      return `https://${u}`;
    }
    case "wifi": {
      const w = fields.wifi;
      if (!w?.ssid.trim()) return "";
      const T = w.encryption === "nopass" ? "nopass" : w.encryption;
      const pass = w.encryption === "nopass" ? "" : escapeWifi(w.password);
      return `WIFI:T:${T};S:${escapeWifi(w.ssid)};P:${pass};H:${w.hidden ? "true" : "false"};;`;
    }
    case "email": {
      const e = (fields.email ?? "").trim();
      return e ? `mailto:${e}` : "";
    }
    case "phone": {
      const p = (fields.phone ?? "").trim().replace(/\s+/g, "");
      return p ? `tel:${p}` : "";
    }
    case "vcard": {
      const v = fields.vcard;
      if (!v?.name.trim()) return "";
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${v.name.trim()}`,
        v.org.trim() ? `ORG:${v.org.trim()}` : "",
        v.phone.trim() ? `TEL:${v.phone.trim()}` : "",
        v.email.trim() ? `EMAIL:${v.email.trim()}` : "",
        v.url.trim() ? `URL:${v.url.trim()}` : "",
        "END:VCARD",
      ];
      return lines.filter(Boolean).join("\n");
    }
    default:
      return "";
  }
}
