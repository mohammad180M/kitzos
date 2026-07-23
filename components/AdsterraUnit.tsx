"use client";

import { useEffect, useRef, useState } from "react";
import { ADSTERRA_BASE, shouldShowAds } from "@/lib/ads-config";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

interface AdsterraUnitProps {
  adKey: string;
  width: number;
  height: number;
}

export default function AdsterraUnit({ adKey, width, height }: AdsterraUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adsEnabled, setAdsEnabled] = useState(false);

  useEffect(() => {
    setAdsEnabled(shouldShowAds());
  }, []);

  useEffect(() => {
    if (!adsEnabled || !containerRef.current) return;
    if (containerRef.current.querySelector(`script[data-kitzos-adsterra="${adKey}"]`)) return;

    window.atOptions = {
      key: adKey,
      format: "iframe",
      height,
      width,
      params: {},
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = `${ADSTERRA_BASE}/${adKey}/invoke.js`;
    script.setAttribute("data-kitzos-adsterra", adKey);
    containerRef.current.appendChild(script);

    return () => {
      script.remove();
    };
  }, [adKey, adsEnabled, width, height]);

  if (!adsEnabled) return null;

  return (
    <div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px`, minHeight: `${height}px` }}
      className="overflow-hidden"
    />
  );
}
