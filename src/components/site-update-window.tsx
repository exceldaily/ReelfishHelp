"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Star, X } from "lucide-react";

// Change this when there is a new release worth showing every angler once.
const UPDATE_VERSION = "2026-07-gear-and-pro-updates";
const SEEN_KEY = `rfh-site-update-seen-${UPDATE_VERSION}`;

export function SiteUpdateWindow() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) return;
    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tide-950/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-update-title"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-tide-200 bg-card shadow-lift animate-fade-up"
      >
        <div className="water-gradient topo-lines px-5 pb-7 pt-8 text-white sm:px-8">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close updates"
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="size-5" />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
            <Sparkles className="size-3.5" /> Just added
          </span>
          <h2 id="site-update-title" className="mt-4 font-sans text-3xl font-extrabold leading-tight tracking-tight">
            New gear and community updates
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/80">
            We have made it easier to show your fishing style, plan a rig, and find trusted local insight.
          </p>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-8 sm:py-6">
          <UpdateItem
            icon={<Star className="size-5 text-sand-500" />}
            title="Pick a go-to setup"
            description="Star your favorite saved rig and keep it at the top of your Gear Locker."
          />
          <UpdateItem
            icon={<Sparkles className="size-5 text-bait-500" />}
            title="Share your tackle favorites"
            description="Add favorite rods, reels, lures, and clothing brands to your profile."
          />
          <UpdateItem
            icon={<ShieldCheck className="size-5 text-reef-600" />}
            title="Spot trusted pros"
            description="Verified guides, captains, tackle shops, and tournament anglers now stand out across ReelFishHelp."
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-edge bg-sand-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 rounded-xl px-4 text-sm font-bold text-ink-500 transition-colors hover:bg-sand-100 hover:text-ink-900"
          >
            Got it
          </button>
          <Link
            href="/my-gear"
            onClick={dismiss}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-bait-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-bait-600"
          >
            Explore my gear <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function UpdateItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-edge bg-white px-4 py-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tide-50">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-ink-900">{title}</h3>
        <p className="mt-0.5 text-sm leading-5 text-ink-500">{description}</p>
      </div>
    </div>
  );
}
