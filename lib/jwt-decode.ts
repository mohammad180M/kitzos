export type JwtDecodeError = "INVALID_PARTS" | "INVALID_BASE64" | "INVALID_JSON";

export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  headerFormatted: string;
  payloadFormatted: string;
}

export interface TimeClaimInfo {
  unix: number;
  readable: string;
  expired: boolean;
}

const TIME_CLAIMS = ["exp", "iat", "nbf"] as const;

export function decodeBase64Url(segment: string): string {
  let base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = base64.length % 4;
  if (remainder) base64 += "=".repeat(4 - remainder);

  try {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("INVALID_BASE64" satisfies JwtDecodeError);
  }
}

export function decodeJwt(token: string): JwtDecoded {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("INVALID_PARTS" satisfies JwtDecodeError);
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3 || parts.some((p) => !p)) {
    throw new Error("INVALID_PARTS" satisfies JwtDecodeError);
  }

  const [headerPart, payloadPart, signature] = parts;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(decodeBase64Url(headerPart)) as Record<string, unknown>;
    payload = JSON.parse(decodeBase64Url(payloadPart)) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_BASE64") throw err;
    throw new Error("INVALID_JSON" satisfies JwtDecodeError);
  }

  return {
    header,
    payload,
    signature,
    headerFormatted: JSON.stringify(header, null, 2),
    payloadFormatted: JSON.stringify(payload, null, 2),
  };
}

export function getTimeClaims(
  payload: Record<string, unknown>,
  locale: string
): { key: string; info: TimeClaimInfo }[] {
  const result: { key: string; info: TimeClaimInfo }[] = [];

  for (const key of TIME_CLAIMS) {
    const value = payload[key];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    const date = new Date(value * 1000);
    result.push({
      key,
      info: {
        unix: value,
        readable: date.toLocaleString(locale === "ar" ? "ar" : undefined),
        expired: key === "exp" && value * 1000 < Date.now(),
      },
    });
  }

  return result;
}
