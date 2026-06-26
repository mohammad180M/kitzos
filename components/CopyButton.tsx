"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";

interface CopyButtonProps {
  text: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export default function CopyButton({
  text,
  label,
  disabled,
  className = "",
  size = "sm",
}: CopyButtonProps) {
  const labels = useCommonLabels();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!text || disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  const sizeClass = size === "sm" ? "py-1.5 text-xs" : "py-2 text-sm";

  return (
    <button
      type="button"
      onClick={() => void copy()}
      disabled={disabled || !text}
      className={`btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50 ${sizeClass} ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {labels.copied}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label ?? labels.copy}
        </>
      )}
    </button>
  );
}
