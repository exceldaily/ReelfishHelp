"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Award, Check, X } from "lucide-react";
import { BADGES } from "@/data/badges";
import { setBadge } from "@/lib/actions/badge-actions";

/**
 * Per-user badge editor for the admin Users table. Shows the user's stored
 * grants as mini badge icons; the editor popover toggles any of the 12 badges.
 * Derived badges are marked "auto" — they also appear on profiles whenever the
 * activity threshold is met, whether or not a grant exists.
 */
export function AdminBadgeManager({
  userId,
  granted,
}: {
  userId: string;
  granted: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  // fixed positioning so the popover escapes the table's overflow-x-auto clipping
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function openPanel() {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, left: Math.max(8, Math.min(r.right - 288, window.innerWidth - 296)) });
    setOpen(true);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const grantedSet = new Set(granted);

  function toggle(slug: string) {
    setBusySlug(slug);
    start(async () => {
      await setBadge({ userId, slug, grant: !grantedSet.has(slug) });
      setBusySlug(null);
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 py-1 hover:bg-sand-100"
        aria-expanded={open}
        aria-label="Manage badges"
      >
        {granted.length === 0 ? (
          <Award className="size-4 text-ink-300" />
        ) : (
          granted.slice(0, 3).map((slug) => (
            <Image key={slug} src={`/badges/${slug}.png`} alt={slug} width={24} height={24} className="size-6 object-contain" />
          ))
        )}
        <span className="text-xs font-bold text-ink-500">{granted.length > 3 ? `+${granted.length - 3}` : granted.length === 0 ? "Add" : ""}</span>
      </button>

      {open && pos && (
        <div style={{ position: "fixed", top: pos.top, left: pos.left }} className="z-40 w-72 rounded-xl border border-sand-200 bg-white p-2 shadow-lift">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-500">Badges</span>
            <button type="button" onClick={() => setOpen(false)} className="grid size-7 place-items-center rounded-lg hover:bg-sand-100" aria-label="Close">
              <X className="size-3.5 text-ink-500" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {BADGES.map((b) => {
              const has = grantedSet.has(b.slug);
              const busy = busySlug === b.slug && pending;
              return (
                <button
                  key={b.slug}
                  type="button"
                  disabled={pending}
                  onClick={() => toggle(b.slug)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sand-100 ${busy ? "opacity-50" : ""}`}
                >
                  <Image src={`/badges/${b.slug}.png`} alt="" width={28} height={28} className={`size-7 object-contain ${has ? "" : "opacity-35 grayscale"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{b.name}</span>
                    {b.kind === "derived" && (
                      <span className="block text-[10px] text-ink-500">auto-earned by activity; grant to force</span>
                    )}
                  </span>
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${has ? "border-moss-500 bg-moss-500 text-white" : "border-sand-300 text-transparent"}`}>
                    <Check className="size-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
