"use client";

import { useEffect, useState } from "react";
import AdsterraUnit from "@/components/AdsterraUnit";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AD_SLOTS } from "@/lib/ads-config";

const MD_BREAKPOINT = 768;

const frameClassName =
  "w-full max-w-[300px] rounded-xl border border-line bg-surface p-4 md:max-w-[728px]";

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
        <div className="mx-auto flex w-full max-w-[300px] min-h-[100px] items-center justify-center md:hidden">
          {isDesktop === false && (
            <AdsterraUnit
              adKey={AD_SLOTS.mobileBanner.key}
              width={AD_SLOTS.mobileBanner.width}
              height={AD_SLOTS.mobileBanner.height}
            />
          )}
        </div>
        <div className="mx-auto hidden w-full max-w-[728px] min-h-[90px] items-center justify-center md:flex">
          {isDesktop === true && (
            <AdsterraUnit
              adKey={AD_SLOTS.leaderboard.key}
              width={AD_SLOTS.leaderboard.width}
              height={AD_SLOTS.leaderboard.height}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
