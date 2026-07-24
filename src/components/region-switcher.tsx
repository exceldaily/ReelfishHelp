"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { setRegion } from "@/lib/actions/profile-actions";
import { REGION_LIST, type Region } from "@/lib/regions";
import { RegionFlag } from "@/components/region-flag";
import { t } from "@/lib/i18n";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/languages";

/**
 * Compact region toggle for the nav avatar menu. Switches the whole app between
 * the USA and Southeast Asia versions (different fish, units, tides, regs).
 */
export function RegionSwitcher({ current, lang = DEFAULT_LANGUAGE }: { current: Region; lang?: LanguageCode }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(region: Region) {
    if (region === current || pending) return;
    start(async () => {
      await setRegion(region);
      router.refresh();
    });
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1.5 px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-300">
        <Globe className="size-3" /> {t(lang, "nav.region")}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {REGION_LIST.map((r) => {
          const active = r.id === current;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => choose(r.id)}
              disabled={pending}
              aria-pressed={active}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition-colors disabled:opacity-60 ${
                active
                  ? "border-tide-500 bg-tide-50 text-tide-800"
                  : "border-sand-200 bg-white text-ink-500 hover:border-sand-300"
              }`}
            >
              <RegionFlag region={r.id} className="h-3 w-[22px]" />
              {r.short}
              {active && <Check className="size-3 text-tide-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
