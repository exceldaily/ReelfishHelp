import Link from "next/link";
import { SEA_MAP_VIEWBOX, SEA_REGION_PATHS } from "@/data/sea-map-paths";

/**
 * Geographic Southeast Asia map of the SEA bite boards, generated from
 * public-domain Natural Earth coastlines (scripts/build-sea-map-paths.ts) —
 * same pattern as UsaBiteMap: every region is clickable, heats up with public
 * reports, and carries its count. Labels use a white halo so they stay
 * readable over land, sea, and every heat tier; the two smallest regions
 * (Singapore, Brunei) get offset labels with leader lines.
 */

/** fill tiers by public report count — matches UsaBiteMap */
function heat(count: number): string {
  if (count >= 6) return "#164556"; // tide-800
  if (count >= 3) return "#22829b"; // tide-500
  if (count >= 1) return "#abd9e4"; // tide-200
  return "#e8e1cf"; // sand-200
}

/** tiny regions: label floats in open water with a leader line back to the land */
const OFFSET_LABELS: Record<string, { lx: number; ly: number }> = {
  "sea-singapore": { lx: 132, ly: 566 },
  "sea-brunei": { lx: 420, ly: 462 },
};

export type SeaBoardStat = { name: string; count: number };

export function SeaBiteMap({ stats }: { stats: Record<string, SeaBoardStat> }) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <svg
        viewBox={SEA_MAP_VIEWBOX}
        role="list"
        aria-label="Bite boards on a map of Southeast Asia"
        className="w-full h-auto min-w-[560px]"
      >
        {/* the sea itself */}
        <rect x="0" y="0" width="760" height="850" rx="14" fill="#eef6f8" />
        {SEA_REGION_PATHS.map((r) => {
          const stat = stats[r.slug];
          const count = stat?.count ?? 0;
          const offset = OFFSET_LABELS[r.slug];
          const lx = offset?.lx ?? r.x;
          const ly = offset?.ly ?? r.y;
          return (
            <Link
              key={r.slug}
              role="listitem"
              href={`/boards/${r.slug}`}
              aria-label={`${stat?.name ?? r.label} — ${count} public bite report${count === 1 ? "" : "s"}`}
              className="group cursor-pointer focus-visible:outline-2 focus-visible:outline-tide-500"
            >
              <title>{`${stat?.name ?? r.label}: ${count} public report${count === 1 ? "" : "s"}`}</title>
              <path
                d={r.d}
                fill={heat(count)}
                stroke="#ffffff"
                strokeWidth="1"
                className="transition-[filter] group-hover:brightness-95"
              />
              {offset && <line x1={r.x} y1={r.y} x2={lx} y2={ly - 4} stroke="#8ba0aa" strokeWidth="1" />}
              {/* white-halo labels stay readable over land, water, and dark heat fills */}
              <text x={lx} y={ly} textAnchor="middle" pointerEvents="none" paintOrder="stroke" stroke="#ffffff" strokeWidth="3">
                <tspan x={lx} dy="-2" fontSize="11" fontWeight="700" fill="#2b3d47">
                  {r.label}
                </tspan>
                <tspan x={lx} dy="14" fontSize="13" fontWeight="800" fill="#175468">
                  {count}
                </tspan>
              </text>
            </Link>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
        <span className="font-semibold">Public reports:</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-sand-200" /> 0</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-tide-200" /> 1–2</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-tide-500" /> 3–5</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-tide-800" /> 6+</span>
      </div>
    </div>
  );
}
