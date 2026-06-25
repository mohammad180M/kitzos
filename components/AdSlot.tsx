"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  ADSTERRA_INVOKE_BASE,
  DESKTOP_AD_MIN_WIDTH,
  DESKTOP_BANNER,
  MOBILE_BANNER,
  type AdsterraUnit,
} from "@/lib/ads-config";

interface AdSlotProps {
  className?: string;
}

function loadAdsterra(container: HTMLElement, unit: AdsterraUnit) {
  container.replaceChildren();

  const optionsScript = document.createElement("script");
  optionsScript.textContent = `atOptions = {
    'key' : '${unit.key}',
    'format' : 'iframe',
    'height' : ${unit.height},
    'width' : ${unit.width},
    'params' : {}
  };`;

  const invokeScript = document.createElement("script");
  invokeScript.src = `${ADSTERRA_INVOKE_BASE}/${unit.key}/invoke.js`;
  invokeScript.async = true;

  container.appendChild(optionsScript);
  container.appendChild(invokeScript);
}

export default function AdSlot({ className = "" }: AdSlotProps) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_AD_MIN_WIDTH}px)`);

    const render = () => {
      const unit = mediaQuery.matches ? DESKTOP_BANNER : MOBILE_BANNER;
      loadAdsterra(container, unit);
    };

    render();
    mediaQuery.addEventListener("change", render);

    return () => {
      mediaQuery.removeEventListener("change", render);
      container.replaceChildren();
    };
  }, []);

  return (
    <div
      className={`flex w-full items-center justify-center overflow-hidden ${className}`}
      role="complementary"
      aria-label={t.common.ad}
      data-ad-slot="tool-banner"
    >
      <div
        ref={containerRef}
        className="flex min-h-[50px] w-full items-center justify-center md:min-h-[90px]"
      />
    </div>
  );
}
