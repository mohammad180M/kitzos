"use client";

import AdSenseUnit from "@/components/AdSenseUnit";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AD_SLOTS } from "@/lib/ads-config";

export default function ToolPageAd() {
  const { t } = useLocale();

  return (
    <aside
      className="mb-8 flex justify-center overflow-hidden"
      aria-label={t.tool.advertisementAria}
    >
      <div className="md:hidden">
        <AdSenseUnit slot={AD_SLOTS.mobileBanner} width={320} height={100} />
      </div>
      <div className="hidden md:block">
        <AdSenseUnit slot={AD_SLOTS.leaderboard} width={728} height={90} />
      </div>
    </aside>
  );
}
