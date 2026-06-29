"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT, shouldShowAds } from "@/lib/ads-config";

export default function AdSenseLoader() {
  useEffect(() => {
    if (!shouldShowAds()) return;
    if (document.querySelector(`script[data-kitzos-adsense="1"]`)) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-kitzos-adsense", "1");
    document.head.appendChild(script);
  }, []);

  return null;
}
