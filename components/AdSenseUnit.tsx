"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/ads-config";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface AdSenseUnitProps {
  slot: string;
  width: number;
  height: number;
  className?: string;
}

export default function AdSenseUnit({ slot, width, height, className }: AdSenseUnitProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const el = insRef.current;
    if (!el || el.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignored
    }
  }, [slot]);

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "inline-block", width: `${width}px`, height: `${height}px` }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
    />
  );
}
