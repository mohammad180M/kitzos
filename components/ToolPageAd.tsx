"use client";

import { useEffect, useState } from "react";
import AdsterraUnit from "@/components/AdsterraUnit";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AD_SLOTS } from "@/lib/ads-config";

const MD_BREAKPOINT = 768;

const frameClassName =
  "w-full max-w-[200px] rounded-xl border border-line bg-surface p-4 md:max-w-[728px]";

/**
 * Device-specific Adsterra units:
 * - Phone (<768px): 160×300
 * - Computer (≥768px): 728×90
 * Only one unit mounts at a time so invoke.js never conflicts.
 */
export default function ToolPageAd() {
  const { t } = useLocale();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="mb-8 flex justify-center">
      <aside aria-label={t.ads.label} className={frameClassName}>
        <p className="label-mono mb-3 text-center text-xs text-muted sm:text-sm">
          {t.ads.supportMessage}
        </p>

        {/* Phone */}
        <div
          className="mx-auto flex w-full items-center justify-center md:hidden"
          style={{
            minHeight: AD_SLOTS.mobile.height,
            maxWidth: AD_SLOTS.mobile.width,
          }}
        >
          {isDesktop === false && (
            <AdsterraUnit
              adKey={AD_SLOTS.mobile.key}
              width={AD_SLOTS.mobile.width}
              height={AD_SLOTS.mobile.height}
            />
          )}
        </div>

        {/* Computer */}
        <div
          className="mx-auto hidden w-full items-center justify-center md:flex"
          style={{
            minHeight: AD_SLOTS.desktop.height,
            maxWidth: AD_SLOTS.desktop.width,
          }}
        >
          {isDesktop === true && (
            <AdsterraUnit
              adKey={AD_SLOTS.desktop.key}
              width={AD_SLOTS.desktop.width}
              height={AD_SLOTS.desktop.height}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
