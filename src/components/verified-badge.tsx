import { BadgeCheck } from "lucide-react";
import { titleDef, type VerifiedTitleSlug } from "@/data/verified-titles";

/**
 * The verified-title badge: small, premium, consistent everywhere. Navy chip,
 * teal check, sand ring — never cartoonish, never loud. `compact` renders the
 * check-only version for tight rows (comments, search results).
 */
export function VerifiedTitleBadge({
  slug,
  compact = false,
}: {
  slug: VerifiedTitleSlug | string | null | undefined;
  compact?: boolean;
}) {
  if (!slug) return null;
  const def = titleDef(slug);
  if (!def) return null;
  if (compact) {
    return (
      <span title={def.badgeLabel} aria-label={def.badgeLabel} className="inline-flex shrink-0 items-center">
        <BadgeCheck className="size-4 text-reef-500" />
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sand-400/50 bg-tide-900 py-0.5 pl-1.5 pr-2.5 text-[11px] font-bold text-white"
      title={def.description}
    >
      <BadgeCheck className="size-3.5 text-reef-300" />
      {def.badgeLabel}
    </span>
  );
}

/** Row of badges for a user's active titles (profile header). */
export function VerifiedTitleRow({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {slugs.map((s) => (
        <VerifiedTitleBadge key={s} slug={s} />
      ))}
    </span>
  );
}
