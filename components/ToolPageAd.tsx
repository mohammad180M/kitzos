"use client";

import AdSenseUnit from "@/components/AdSenseUnit";
import { AD_SLOTS } from "@/lib/ads-config";

export default function ToolPageAd() {
  return (
    <aside
      className="mb-8 flex justify-center overflow-hidden"
      aria-label="Advertisement"
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
