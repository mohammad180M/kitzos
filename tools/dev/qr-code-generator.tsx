"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Download, Image as ImageIcon } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";
import {
  buildQrPayload,
  type QrContentType,
  type VCardFields,
  type WifiFields,
} from "@/lib/qr/payload";
import {
  ERROR_LEVEL_PCT,
  FINDER_INNERS,
  FINDER_OUTERS,
  FRAME_STYLES,
  MODULE_STYLES,
  canvasToPngBlob,
  renderQrToCanvas,
  renderQrToSvg,
  styleSwatchSvg,
  type ErrorLevel,
  type FinderInner,
  type FinderOuter,
  type FrameStyle,
  type ModuleStyle,
} from "@/lib/qr/stylized-qr";

type DesignTab = "shape" | "logo" | "level" | "frame";

const CONTENT_TYPES: QrContentType[] = [
  "website",
  "text",
  "wifi",
  "email",
  "phone",
  "vcard",
  "pdf",
  "image",
  "video",
];

const DESIGN_TABS: DesignTab[] = ["shape", "logo", "level", "frame"];
const ERROR_LEVELS: ErrorLevel[] = ["L", "M", "Q", "H"];
const PREVIEW_SIZE = 280;
const EXPORT_SIZE = 512;
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const COLOR_PRESETS: { fg: string; bg: string }[] = [
  { fg: "#000000", bg: "#ffffff" },
  { fg: "#ffffff", bg: "#111827" },
  { fg: "#1d4ed8", bg: "#dbeafe" },
  { fg: "#047857", bg: "#d1fae5" },
  { fg: "#c2410c", bg: "#ffedd5" },
  { fg: "#a21caf", bg: "#fae8ff" },
  { fg: "#b45309", bg: "#fef3c7" },
  { fg: "#e11d48", bg: "#ffe4e6" },
  { fg: "#0e7490", bg: "#cffafe" },
  { fg: "#f8fafc", bg: "#0f766e" },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: string, bg: string): number | null {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  if (!fgRgb || !bgRgb) return null;
  const l1 = relativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function StyleSwatch({
  active,
  label,
  svg,
  onClick,
}: {
  active: boolean;
  label: string;
  svg: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-xl border-2 p-1 transition-colors ${
        active
          ? "border-primary-600 bg-primary-50 ring-2 ring-primary-600/30 dark:bg-primary-950/40"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
      }`}
    >
      <span
        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary-600 text-white"
          : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function QrCodeGenerator() {
  const t = useDevToolsExtraLabels("qrCodeGenerator");

  const [contentType, setContentType] = useState<QrContentType>("website");
  const [designTab, setDesignTab] = useState<DesignTab>("shape");

  const [url, setUrl] = useState("https://kitzos.com");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wifi, setWifi] = useState<WifiFields>({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [vcard, setVcard] = useState<VCardFields>({
    name: "",
    phone: "",
    email: "",
    org: "",
    url: "",
  });

  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [moduleStyle, setModuleStyle] = useState<ModuleStyle>("square");
  const [finderOuter, setFinderOuter] = useState<FinderOuter>("square");
  const [finderInner, setFinderInner] = useState<FinderInner>("square");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [frame, setFrame] = useState<FrameStyle>("none");
  const [frameLabel, setFrameLabel] = useState("Scan me");
  const [logoScale, setLogoScale] = useState(0.22);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoHint, setLogoHint] = useState(false);

  const logoObjectUrlRef = useRef<string | null>(null);

  const payload = useMemo(
    () =>
      buildQrPayload(contentType, {
        text,
        url,
        email,
        phone,
        wifi,
        vcard,
      }),
    [contentType, text, url, email, phone, wifi, vcard]
  );

  const effectiveLevel = useMemo((): ErrorLevel => {
    if (!logoImg) return errorLevel;
    if (errorLevel === "L" || errorLevel === "M") return "Q";
    return errorLevel;
  }, [logoImg, errorLevel]);

  const lowContrast = useMemo(() => {
    const ratio = contrastRatio(foreground, background);
    return ratio !== null && ratio < 3;
  }, [foreground, background]);

  const moduleLabel = (s: ModuleStyle) =>
    ({
      square: t.styleSquare,
      rounded: t.styleRounded,
      dots: t.styleDots,
      diamond: t.styleDiamond,
      heart: t.styleHeart,
      triangle: t.styleTriangle,
      hexagon: t.styleHexagon,
      star: t.styleStar,
      drop: t.styleDrop,
      plus: t.stylePlus,
      cross: t.styleCross,
      leaf: t.styleLeaf,
    })[s];

  const finderOuterLabel = (s: FinderOuter) =>
    ({
      square: t.styleSquare,
      rounded: t.styleRounded,
      soft: t.styleSoft,
      circle: t.styleCircle,
      leaf: t.styleLeaf,
    })[s];

  const finderInnerLabel = (s: FinderInner) =>
    ({
      square: t.styleSquare,
      rounded: t.styleRounded,
      circle: t.styleCircle,
      diamond: t.styleDiamond,
      plus: t.stylePlus,
      leaf: t.styleLeaf,
    })[s];

  const frameLabelOf = (f: FrameStyle) =>
    ({
      none: t.frameNone,
      border: t.frameBorder,
      rounded: t.frameRounded,
      thick: t.frameThick,
      dashed: t.frameDashed,
      label: t.frameLabel,
    })[f];

  useEffect(() => {
    if (logoImg && (errorLevel === "L" || errorLevel === "M")) {
      setErrorLevel("Q");
      setLogoHint(true);
    }
  }, [logoImg, errorLevel]);

  useEffect(() => {
    let cancelled = false;
    if (!payload.trim()) {
      setPreviewUrl(null);
      setError(null);
      return;
    }

    (async () => {
      try {
        const canvas = await renderQrToCanvas(payload, {
          errorCorrectionLevel: effectiveLevel,
          size: PREVIEW_SIZE,
          foreground,
          background,
          moduleStyle,
          finderOuter,
          finderInner,
          logo: logoImg,
          logoScale,
          frame,
          frameLabel,
        });
        if (cancelled) return;
        setPreviewUrl(canvas.toDataURL("image/png"));
        setError(null);
      } catch {
        if (!cancelled) {
          setPreviewUrl(null);
          setError(t.errorGenerate);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    payload,
    effectiveLevel,
    foreground,
    background,
    moduleStyle,
    finderOuter,
    finderInner,
    logoImg,
    logoScale,
    frame,
    frameLabel,
    t.errorGenerate,
  ]);

  useEffect(() => {
    return () => {
      if (logoObjectUrlRef.current) URL.revokeObjectURL(logoObjectUrlRef.current);
    };
  }, []);

  const invertColors = () => {
    setForeground(background);
    setBackground(foreground);
  };

  const clearLogo = () => {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current);
      logoObjectUrlRef.current = null;
    }
    setLogoImg(null);
    setLogoName(null);
    setLogoHint(false);
  };

  const onLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setError(t.logoInvalidType);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError(t.logoTooLarge);
      return;
    }
    if (logoObjectUrlRef.current) URL.revokeObjectURL(logoObjectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    logoObjectUrlRef.current = objectUrl;
    const img = new Image();
    img.onload = () => {
      setLogoImg(img);
      setLogoName(file.name);
      setError(null);
    };
    img.onerror = () => {
      setError(t.logoLoadFailed);
      clearLogo();
    };
    img.src = objectUrl;
  };

  const downloadPng = async () => {
    if (!payload.trim()) return;
    try {
      const canvas = await renderQrToCanvas(payload, {
        errorCorrectionLevel: effectiveLevel,
        size: EXPORT_SIZE,
        foreground,
        background,
        moduleStyle,
        finderOuter,
        finderInner,
        logo: logoImg,
        logoScale,
        frame,
        frameLabel,
      });
      const blob = await canvasToPngBlob(canvas);
      downloadBlob(blob, "qrcode.png");
    } catch {
      setError(t.errorGenerate);
    }
  };

  const downloadSvg = () => {
    if (!payload.trim()) return;
    try {
      const svg = renderQrToSvg(payload, {
        errorCorrectionLevel: effectiveLevel,
        size: EXPORT_SIZE,
        foreground,
        background,
        moduleStyle,
        finderOuter,
        finderInner,
        frame,
        frameLabel,
      });
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qrcode.svg");
    } catch {
      setError(t.errorSvgExport);
    }
  };

  const contentTypeLabel = (type: QrContentType) => {
    const map: Record<QrContentType, string> = {
      website: t.typeWebsite,
      text: t.typeText,
      wifi: t.typeWifi,
      email: t.typeEmail,
      phone: t.typePhone,
      vcard: t.typeVcard,
      pdf: t.typePdf,
      image: t.typeImage,
      video: t.typeVideo,
    };
    return map[type];
  };

  const designTabLabel = (tab: DesignTab) => {
    const map: Record<DesignTab, string> = {
      shape: t.tabShape,
      logo: t.tabLogo,
      level: t.tabLevel,
      frame: t.tabFrame,
    };
    return map[tab];
  };

  const urlPlaceholder =
    contentType === "pdf"
      ? t.placeholderPdfUrl
      : contentType === "image"
        ? t.placeholderImageUrl
        : contentType === "video"
          ? t.placeholderVideoUrl
          : t.placeholderUrl;

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <div className="space-y-4">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t.stepContent}</h3>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-1.5 dark:border-gray-700 dark:bg-gray-800/50">
              {CONTENT_TYPES.map((type) => (
                <Chip
                  key={type}
                  active={contentType === type}
                  onClick={() => setContentType(type)}
                >
                  {contentTypeLabel(type)}
                </Chip>
              ))}
            </div>

            {(contentType === "website" ||
              contentType === "pdf" ||
              contentType === "image" ||
              contentType === "video") && (
              <div className="space-y-1.5">
                {(contentType === "pdf" ||
                  contentType === "image" ||
                  contentType === "video") && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.urlOnlyHint}</p>
                )}
                <label htmlFor="qr-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.urlLabel}
                </label>
                <input
                  id="qr-url"
                  type="url"
                  dir="ltr"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={urlPlaceholder}
                  className="input-field ltr-input"
                />
              </div>
            )}

            {contentType === "text" && (
              <div>
                <label htmlFor="qr-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.textLabel}
                </label>
                <textarea
                  id="qr-text"
                  dir="auto"
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.placeholderText}
                  className="input-field mt-1"
                />
              </div>
            )}

            {contentType === "wifi" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="qr-ssid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.wifiSsid}
                  </label>
                  <input
                    id="qr-ssid"
                    dir="auto"
                    value={wifi.ssid}
                    onChange={(e) => setWifi((w) => ({ ...w, ssid: e.target.value }))}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="qr-wifi-pass" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.wifiPassword}
                  </label>
                  <input
                    id="qr-wifi-pass"
                    type="text"
                    dir="ltr"
                    value={wifi.password}
                    onChange={(e) => setWifi((w) => ({ ...w, password: e.target.value }))}
                    disabled={wifi.encryption === "nopass"}
                    className="input-field ltr-input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="qr-wifi-enc" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.wifiEncryption}
                  </label>
                  <select
                    id="qr-wifi-enc"
                    value={wifi.encryption}
                    onChange={(e) =>
                      setWifi((w) => ({
                        ...w,
                        encryption: e.target.value as WifiFields["encryption"],
                      }))
                    }
                    className="input-field mt-1"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">{t.wifiOpen}</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={wifi.hidden}
                    onChange={(e) => setWifi((w) => ({ ...w, hidden: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  {t.wifiHidden}
                </label>
              </div>
            )}

            {contentType === "email" && (
              <div>
                <label htmlFor="qr-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.emailLabel}
                </label>
                <input
                  id="qr-email"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                  className="input-field ltr-input mt-1"
                />
              </div>
            )}

            {contentType === "phone" && (
              <div>
                <label htmlFor="qr-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.phoneLabel}
                </label>
                <input
                  id="qr-phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.placeholderPhone}
                  className="input-field ltr-input mt-1"
                />
              </div>
            )}

            {contentType === "vcard" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="qr-vcard-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.vcardName}
                  </label>
                  <input
                    id="qr-vcard-name"
                    dir="auto"
                    value={vcard.name}
                    onChange={(e) => setVcard((v) => ({ ...v, name: e.target.value }))}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="qr-vcard-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.vcardPhone}
                  </label>
                  <input
                    id="qr-vcard-phone"
                    dir="ltr"
                    value={vcard.phone}
                    onChange={(e) => setVcard((v) => ({ ...v, phone: e.target.value }))}
                    className="input-field ltr-input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="qr-vcard-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.vcardEmail}
                  </label>
                  <input
                    id="qr-vcard-email"
                    dir="ltr"
                    value={vcard.email}
                    onChange={(e) => setVcard((v) => ({ ...v, email: e.target.value }))}
                    className="input-field ltr-input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="qr-vcard-org" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.vcardOrg}
                  </label>
                  <input
                    id="qr-vcard-org"
                    dir="auto"
                    value={vcard.org}
                    onChange={(e) => setVcard((v) => ({ ...v, org: e.target.value }))}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="qr-vcard-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.vcardUrl}
                  </label>
                  <input
                    id="qr-vcard-url"
                    dir="ltr"
                    value={vcard.url}
                    onChange={(e) => setVcard((v) => ({ ...v, url: e.target.value }))}
                    className="input-field ltr-input mt-1"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t.stepDesign}</h3>
            <div className="inline-flex flex-wrap gap-0.5 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
              {DESIGN_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDesignTab(tab)}
                  aria-pressed={designTab === tab}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    designTab === tab
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {designTabLabel(tab)}
                </button>
              ))}
            </div>

            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              {designTab === "shape" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.moduleStyle}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {MODULE_STYLES.map((s) => (
                        <StyleSwatch
                          key={s}
                          active={moduleStyle === s}
                          label={moduleLabel(s)}
                          svg={styleSwatchSvg("module", s, foreground, background)}
                          onClick={() => setModuleStyle(s)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.finderOuter}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {FINDER_OUTERS.map((s) => (
                        <StyleSwatch
                          key={s}
                          active={finderOuter === s}
                          label={finderOuterLabel(s)}
                          svg={styleSwatchSvg("finder-outer", s, foreground, background)}
                          onClick={() => setFinderOuter(s)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.finderInner}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {FINDER_INNERS.map((s) => (
                        <StyleSwatch
                          key={s}
                          active={finderInner === s}
                          label={finderInnerLabel(s)}
                          svg={styleSwatchSvg("finder-inner", s, foreground, background)}
                          onClick={() => setFinderInner(s)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.colorPresets}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((p) => {
                        const active = foreground === p.fg && background === p.bg;
                        return (
                          <button
                            key={`${p.fg}-${p.bg}`}
                            type="button"
                            aria-pressed={active}
                            aria-label={`${p.fg} / ${p.bg}`}
                            title={`${p.fg} / ${p.bg}`}
                            onClick={() => {
                              setForeground(p.fg);
                              setBackground(p.bg);
                            }}
                            className={`relative h-12 w-12 overflow-hidden rounded-xl border-2 ${
                              active
                                ? "border-primary-600 ring-2 ring-primary-600/30"
                                : "border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            <span
                              className="absolute inset-0"
                              style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.fg} 50%)` }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="qr-fg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.foreground}
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="qr-fg"
                          type="color"
                          value={foreground}
                          onChange={(e) => setForeground(e.target.value)}
                          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={foreground}
                          onChange={(e) => setForeground(e.target.value)}
                          className="input-field ltr-input font-mono uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="qr-bg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.background}
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="qr-bg"
                          type="color"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          className="input-field ltr-input font-mono uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={invertColors} className="btn-secondary text-sm">
                    {t.invertColors}
                  </button>
                  {lowContrast && (
                    <p
                      className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300"
                      role="status"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {t.lowContrastWarning}
                    </p>
                  )}
                </>
              )}

              {designTab === "logo" && (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.logoPrivacy}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-secondary cursor-pointer text-sm">
                      <ImageIcon className="h-4 w-4" />
                      {t.logoUpload}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          onLogoFile(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {logoImg && (
                      <button type="button" onClick={clearLogo} className="btn-secondary text-sm">
                        {t.logoRemove}
                      </button>
                    )}
                  </div>
                  {logoName && (
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{logoName}</p>
                  )}
                  {logoImg && (
                    <div>
                      <label htmlFor="qr-logo-scale" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.logoScale}: {Math.round(logoScale * 100)}%
                      </label>
                      <input
                        id="qr-logo-scale"
                        type="range"
                        min={12}
                        max={28}
                        step={1}
                        value={Math.round(logoScale * 100)}
                        onChange={(e) => setLogoScale(Number(e.target.value) / 100)}
                        className="mt-2 w-full accent-primary-600"
                      />
                    </div>
                  )}
                  {(logoHint || logoImg) && (
                    <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
                      {t.logoLevelHint}
                    </p>
                  )}
                </>
              )}

              {designTab === "level" && (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.errorCorrectionHint}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ERROR_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => {
                          setErrorLevel(level);
                          setLogoHint(false);
                        }}
                        aria-pressed={errorLevel === level}
                        className={`rounded-lg border px-3 py-2 text-start transition-colors ${
                          errorLevel === level
                            ? "border-primary-600 bg-primary-50 text-primary-900 dark:bg-primary-950/40 dark:text-primary-100"
                            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="font-semibold">{level}</span>
                        <span className="ms-2 text-sm text-gray-500 dark:text-gray-400">
                          ~{ERROR_LEVEL_PCT[level]}%
                        </span>
                        {logoImg && (level === "L" || level === "M") && (
                          <span className="mt-1 block text-xs text-amber-600 dark:text-amber-400">
                            {t.levelLogoRecommend}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {logoImg && effectiveLevel !== errorLevel && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.levelAutoBoost.replace("{level}", effectiveLevel)}
                    </p>
                  )}
                </>
              )}

              {designTab === "frame" && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {FRAME_STYLES.map((f) => (
                      <StyleSwatch
                        key={f}
                        active={frame === f}
                        label={frameLabelOf(f)}
                        svg={styleSwatchSvg("frame", f, foreground, background)}
                        onClick={() => setFrame(f)}
                      />
                    ))}
                  </div>
                  {frame === "label" && (
                    <div>
                      <label htmlFor="qr-frame-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.frameLabelText}
                      </label>
                      <input
                        id="qr-frame-label"
                        dir="auto"
                        value={frameLabel}
                        maxLength={24}
                        onChange={(e) => setFrameLabel(e.target.value)}
                        className="input-field mt-1"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t.stepDownload}</h3>
          <div className="flex justify-center rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={t.previewAlt}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                decoding="async"
                className="max-w-full"
              />
            ) : (
              <div
                className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, maxWidth: "100%" }}
              >
                {t.previewPlaceholder}
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadPng}
              disabled={!payload.trim()}
              className="btn-primary"
            >
              <Download className="h-4 w-4" />
              {t.downloadPng}
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              disabled={!payload.trim()}
              className="btn-secondary"
            >
              <Download className="h-4 w-4" />
              {t.downloadSvg}
            </button>
          </div>
          {logoImg && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.svgNoLogoHint}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
