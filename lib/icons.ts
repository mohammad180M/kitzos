import {
  Binary,
  Braces,
  CaseSensitive,
  Code,
  FileText,
  Files,
  Hash,
  Image,
  KeyRound,
  Minimize2,
  Palette,
  QrCode,
  Scaling,
  Type,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Binary,
  Braces,
  CaseSensitive,
  Code,
  FileText,
  Files,
  Hash,
  Image,
  KeyRound,
  Minimize2,
  Palette,
  QrCode,
  Scaling,
  Type,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? FileText;
}
