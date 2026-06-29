"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, shouldShowAds } from "@/lib/ads-config";

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
  const [adsEnabled, setAdsEnabled] = useState(false);

  useEffect(() => {
    setAdsEnabled(shouldShowAds());
  }, []);

  useEffect(() => {
    if (!adsEnabled) return;
    const el = insRef.current;
    if (!el || el.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignored
    }
  }, [slot, adsEnabled]);

  if (!adsEnabled) return null;

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
