"use client";

import { ADS_ENABLED } from "@/lib/ads-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const frameClassName =
  "w-full max-w-[300px] rounded-xl border border-line bg-surface p-4 md:max-w-[728px]";

/**
 * Reusable tool-page ad slot. Renders nothing when ads are disabled
 * (NEXT_PUBLIC_ADS_ENABLED unset/false) — zero layout gap, zero network.
 * Flip the env flag and wire a provider inside `#kitzos-ad-slot` later.
 */
export default function AdSlot() {
  const { t } = useLocale();

  if (!ADS_ENABLED) return null;

  return (
    <div className="mb-8 flex justify-center">
      <aside aria-label={t.ads.label} className={frameClassName}>
        <p className="label-mono mb-3 text-center text-xs text-muted sm:text-sm">
          {t.ads.supportMessage}
        </p>
        {/* Provider mount point — inject network scripts / components here when re-enabling ads. */}
        <div
          id="kitzos-ad-slot"
          className="mx-auto flex w-full max-w-[300px] items-center justify-center md:max-w-[728px]"
        />
      </aside>
    </div>
  );
}
