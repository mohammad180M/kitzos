export type TemplateId =
  | "royal-gold"
  | "classic-ivory"
  | "modern-minimal"
  | "tech-gradient";

export const TEMPLATE_IDS: TemplateId[] = [
  "royal-gold",
  "classic-ivory",
  "modern-minimal",
  "tech-gradient",
];

export type LogoPosition = "top-center" | "top-left" | "top-right" | "watermark";
export type PageSize = "a4" | "letter" | "square";
export type Orientation = "landscape" | "portrait";
export type FontSize = "sm" | "md" | "lg";
export type FontChoice = "sans" | "serif" | "arabic";

export const DRAGGABLE_ELEMENT_IDS = [
  "logo",
  "seal",
  "sigRight",
  "sigLeft",
  "title",
  "recipientName",
  "date",
] as const;

export type DraggableElementId = (typeof DRAGGABLE_ELEMENT_IDS)[number];

export interface ElementLayout {
  dx: number;
  dy: number;
  scale: number;
}

export type CertificateElementLayout = Partial<Record<DraggableElementId, ElementLayout>>;

export const DEFAULT_ELEMENT_LAYOUT: ElementLayout = { dx: 0, dy: 0, scale: 1 };

export function getElementLayout(
  config: CertificateConfig,
  id: DraggableElementId
): ElementLayout {
  return config.elementLayout?.[id] ?? DEFAULT_ELEMENT_LAYOUT;
}

export interface CertificateAssets {
  logo: HTMLImageElement | null;
  sigLeft: HTMLImageElement | null;
  sigRight: HTMLImageElement | null;
}

export const EMPTY_CERTIFICATE_ASSETS: CertificateAssets = {
  logo: null,
  sigLeft: null,
  sigRight: null,
};

export interface SignatureSlotConfig {
  imageDataUrl: string | null;
  signerName: string;
  signerTitle: string;
  imageHeight: number;
}

export const DEFAULT_SIGNATURE_SLOT: SignatureSlotConfig = {
  imageDataUrl: null,
  signerName: "",
  signerTitle: "",
  imageHeight: 48,
};

export interface CertificateConfig {
  templateId: TemplateId;
  title: string;
  recipientName: string;
  achievement: string;
  description: string;
  date: string;
  sigLeft: SignatureSlotConfig;
  sigRight: SignatureSlotConfig;
  enableLeftSignature: boolean;
  accentColor: string;
  bgColor: string;
  textColor: string;
  titleSize: FontSize;
  nameSize: FontSize;
  fontChoice: FontChoice;
  orientation: Orientation;
  pageSize: PageSize;
  logoDataUrl: string | null;
  logoWidth: number;
  logoOpacity: number;
  logoPosition: LogoPosition;
  elementLayout: CertificateElementLayout;
}

export interface CertificateDefaults {
  title: string;
  recipientName: string;
  achievement: string;
  description: string;
  date: string;
  sigRightName: string;
  sigRightTitle: string;
}

export const TEMPLATE_PRESETS: Record<
  TemplateId,
  { accentColor: string; bgColor: string; textColor: string }
> = {
  "royal-gold": {
    accentColor: "#d4af37",
    bgColor: "#121212",
    textColor: "#f8f4e8",
  },
  "classic-ivory": {
    accentColor: "#7c5c2b",
    bgColor: "#faf6ee",
    textColor: "#3d2b1f",
  },
  "modern-minimal": {
    accentColor: "#2563eb",
    bgColor: "#ffffff",
    textColor: "#111827",
  },
  "tech-gradient": {
    accentColor: "#22d3ee",
    bgColor: "#1e1b4b",
    textColor: "#f1f5f9",
  },
};

const BASE_SIZES: Record<Exclude<PageSize, "square">, { w: number; h: number }> = {
  a4: { w: 1123, h: 794 },
  letter: { w: 1056, h: 816 },
};

export function getCanvasDimensions(pageSize: PageSize, orientation: Orientation): {
  width: number;
  height: number;
} {
  if (pageSize === "square") {
    return { width: 1080, height: 1080 };
  }
  const base = BASE_SIZES[pageSize];
  if (orientation === "landscape") {
    return { width: base.w, height: base.h };
  }
  return { width: base.h, height: base.w };
}

export function getPdfDimensions(pageSize: PageSize, orientation: Orientation): {
  width: number;
  height: number;
} {
  const pt = {
    a4: { w: 842, h: 595 },
    letter: { w: 792, h: 612 },
    square: { w: 612, h: 612 },
  };
  const base = pt[pageSize];
  if (pageSize === "square") return { width: base.w, height: base.h };
  if (orientation === "landscape") return { width: base.w, height: base.h };
  return { width: base.h, height: base.w };
}

export const SIZE_SCALE: Record<FontSize, number> = { sm: 0.85, md: 1, lg: 1.2 };

export function buildDefaultConfig(defaults: CertificateDefaults): CertificateConfig {
  const preset = TEMPLATE_PRESETS["royal-gold"];
  return {
    templateId: "royal-gold",
    title: defaults.title,
    recipientName: defaults.recipientName,
    achievement: defaults.achievement,
    description: defaults.description,
    date: defaults.date,
    sigLeft: { ...DEFAULT_SIGNATURE_SLOT },
    sigRight: {
      ...DEFAULT_SIGNATURE_SLOT,
      signerName: defaults.sigRightName,
      signerTitle: defaults.sigRightTitle,
      imageHeight: 52,
    },
    enableLeftSignature: false,
    accentColor: preset.accentColor,
    bgColor: preset.bgColor,
    textColor: preset.textColor,
    titleSize: "md",
    nameSize: "lg",
    fontChoice: "serif",
    orientation: "landscape",
    pageSize: "a4",
    logoDataUrl: null,
    logoWidth: 88,
    logoOpacity: 100,
    logoPosition: "top-center",
    elementLayout: {},
  };
}

export function buildPreviewConfig(
  templateId: TemplateId,
  defaults: CertificateDefaults
): CertificateConfig {
  const preset = TEMPLATE_PRESETS[templateId];
  return {
    ...buildDefaultConfig(defaults),
    templateId,
    accentColor: preset.accentColor,
    bgColor: preset.bgColor,
    textColor: preset.textColor,
    logoDataUrl: null,
    fontChoice: templateId === "modern-minimal" || templateId === "tech-gradient" ? "sans" : "serif",
  };
}

export const THUMB_WIDTH = 280;
export const THUMB_HEIGHT = 198;

export const DUAL_SIGNATURE_TEMPLATES: TemplateId[] = ["royal-gold", "classic-ivory"];

export function templateSupportsDualSignatures(templateId: TemplateId): boolean {
  return DUAL_SIGNATURE_TEMPLATES.includes(templateId);
}
