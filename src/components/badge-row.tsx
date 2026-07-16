import Image from "next/image";
import type { BadgeDef } from "@/data/badges";

/**
 * Earned-badge strip shown at the top of a profile, under the avatar. Pure
 * CSS hover/focus tooltip (name + how it's earned) — no client JS. The native
 * title attribute is skipped in favor of the styled tooltip; screen readers
 * get the same text via aria-label.
 */
export function BadgeRow({ badges }: { badges: BadgeDef[] }) {
  if (badges.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Earned badges">
      {badges.map((b) => (
        <li key={b.slug} className="relative group">
          <span tabIndex={0} aria-label={`${b.name}: ${b.blurb}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-tide-500 rounded-lg">
            <Image
              src={`/badges/${b.slug}.png`}
              alt=""
              width={56}
              height={56}
              className="size-12 sm:size-14 object-contain drop-shadow-sm transition-transform group-hover:scale-110"
            />
          </span>
          {/* tooltip — edge badges pin to their side so it never runs off-screen */}
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-52 -translate-x-1/2 rounded-xl bg-tide-950 px-3.5 py-2.5 text-center opacity-0 shadow-lift transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 group-first:left-0 group-first:translate-x-0 group-[:last-child:not(:only-child)]:left-auto group-[:last-child:not(:only-child)]:right-0 group-[:last-child:not(:only-child)]:translate-x-0"
          >
            <span className="block text-xs font-bold text-white">{b.name}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-tide-200">{b.blurb}</span>
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rotate-45 bg-tide-950 group-first:left-6 group-[:last-child:not(:only-child)]:left-auto group-[:last-child:not(:only-child)]:right-6 group-[:last-child:not(:only-child)]:translate-x-1/2" />
          </span>
        </li>
      ))}
    </ul>
  );
}
