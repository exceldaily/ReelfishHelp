"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Lightbulb,
  Fish,
  Waves,
  Anchor,
  Wind,
  LifeBuoy,
  Compass,
  Ship,
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  ArrowRight,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { toggleTipHelpful, toggleSavedTip, recordTipShare } from "@/lib/actions/tip-actions";

/** Icon keys stored on tips; anything unknown falls back to the lightbulb. */
const TIP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  fish: Fish,
  waves: Waves,
  anchor: Anchor,
  wind: Wind,
  lifebuoy: LifeBuoy,
  compass: Compass,
  ship: Ship,
};

export type TipCardData = {
  id: string;
  slug: string;
  title: string;
  tipText: string;
  category: string;
  icon: string | null;
  helpfulCount: number;
  viewerHelpful: boolean;
  viewerSaved: boolean;
};

export function DailyTipCard({
  tip,
  signedIn,
  heading = "Daily Angler Tip",
  showMoreLink = true,
}: {
  tip: TipCardData;
  signedIn: boolean;
  heading?: string;
  showMoreLink?: boolean;
}) {
  const router = useRouter();
  const [helpful, setHelpful] = useState(tip.viewerHelpful);
  const [count, setCount] = useState(tip.helpfulCount);
  const [saved, setSaved] = useState(tip.viewerSaved);
  const [shared, setShared] = useState(false);
  const [, start] = useTransition();

  const Icon = TIP_ICONS[tip.icon ?? ""] ?? Lightbulb;

  function onHelpful() {
    if (!signedIn) return router.push("/login");
    // optimistic; server result reconciles
    setHelpful((v) => !v);
    setCount((c) => (helpful ? Math.max(0, c - 1) : c + 1));
    start(async () => {
      const res = await toggleTipHelpful(tip.id);
      if ("signIn" in res) return router.push("/login");
      setHelpful(res.helpful);
      setCount(res.count);
    });
  }

  function onSave() {
    if (!signedIn) return router.push("/login");
    setSaved((v) => !v);
    start(async () => {
      const res = await toggleSavedTip(tip.id);
      if ("signIn" in res) return router.push("/login");
      setSaved(res.saved);
    });
  }

  async function onShare() {
    const url = `${window.location.origin}/tips/${tip.slug}`;
    const payload = { title: `ReelFishHelp — ${tip.title}`, text: tip.tipText, url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1600);
      start(async () => recordTipShare(tip.id));
    } catch {
      /* user closed the share sheet — nothing to do */
    }
  }

  const btn =
    "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-500";

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tide-100">
          <Icon className="size-5 text-tide-700" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tide-700">{heading}</span>
            <Badge variant="neutral">{tip.category}</Badge>
          </div>
          <h2 className="mt-1 font-display font-bold text-ink-900 leading-snug">{tip.title}</h2>
          <p className="mt-1.5 text-sm text-ink-700 leading-relaxed">{tip.tipText}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onHelpful}
              aria-pressed={helpful}
              aria-label={helpful ? `Remove helpful mark (${count} found this helpful)` : `Mark helpful (${count} found this helpful)`}
              className={`${btn} ${helpful ? "bg-tide-700 text-white" : "bg-tide-50 text-tide-800 hover:bg-tide-100"}`}
            >
              <ThumbsUp className="size-3.5" />
              Helpful{count > 0 ? ` · ${count}` : ""}
            </button>
            <button
              type="button"
              onClick={onSave}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved tips" : "Save this tip"}
              className={`${btn} ${saved ? "bg-tide-700 text-white" : "bg-tide-50 text-tide-800 hover:bg-tide-100"}`}
            >
              {saved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
              {saved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={onShare}
              aria-label="Share this tip"
              className={`${btn} bg-tide-50 text-tide-800 hover:bg-tide-100`}
            >
              {shared ? <Check className="size-3.5 text-moss-600" /> : <Share2 className="size-3.5" />}
              {shared ? "Link copied" : "Share"}
            </button>
            {showMoreLink && (
              <Link
                href="/tips"
                className={`${btn} ml-auto text-tide-700 hover:bg-tide-50`}
                aria-label="Browse all angler tips"
              >
                More Tips <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
