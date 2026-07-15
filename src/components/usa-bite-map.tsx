import Link from "next/link";
import { US_MAP_VIEWBOX, US_STATE_PATHS } from "@/data/us-map-paths";

/**
 * Geographic USA map of the 50 state bite boards, rendered as inline SVG from
 * public-domain state outlines (no map library, works offline under the strict
 * CSP). Every state is clickable and carries its code + public bite-report
 * count on top; states heat up as public reports come in. Six small Northeast
 * states get offset labels with leader lines so their counts stay readable.
 */

/** fill / label-color tiers by public report count */
function heat(count: number): { fill: string; text: string } {
  if (count >= 6) return { fill: "#164556", text: "#ffffff" }; // tide-800
  if (count >= 3) return { fill: "#22829b", text: "#ffffff" }; // tide-500
  if (count >= 1) return { fill: "#abd9e4", text: "#123847" }; // tide-200
  return { fill: "#e8e1cf", text: "#2b3d47" }; // sand-200
}

/** offset-label column (small Northeast states), ordered north to south */
const OFFSET_COLUMN: Record<string, number> = { ma: 150, ri: 174, ct: 198, nj: 222, de: 246, md: 270 };
const OFFSET_X = 912;

export type StateBoardStat = { name: string; count: number };

export function UsaBiteMap({ stats }: { stats: Record<string, StateBoardStat> }) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <svg
        viewBox={US_MAP_VIEWBOX}
        role="list"
        aria-label="Bite boards on a map of the United States"
        className="w-full h-auto min-w-[620px]"
      >
        {US_STATE_PATHS.map((s) => {
          const stat = stats[s.code];
          const count = stat?.count ?? 0;
          const { fill, text } = heat(count);
          const offsetY = OFFSET_COLUMN[s.code];
          return (
            <Link
              key={s.code}
              role="listitem"
              href={`/boards/${s.code}`}
              aria-label={`${stat?.name ?? s.code.toUpperCase()} — ${count} public bite report${count === 1 ? "" : "s"}`}
              className="group cursor-pointer focus-visible:outline-2 focus-visible:outline-tide-500"
            >
              <title>{`${stat?.name ?? s.code.toUpperCase()}: ${count} public report${count === 1 ? "" : "s"}`}</title>
              <path
                d={s.d}
                fill={fill}
                stroke="#ffffff"
                strokeWidth="1"
                className="transition-[filter] group-hover:brightness-95"
              />
              {offsetY != null ? (
                <>
                  {/* leader line from the state to its offset label */}
                  <line x1={s.x} y1={s.y} x2={OFFSET_X - 4} y2={offsetY} stroke="#8ba0aa" strokeWidth="1" />
                  <text
                    x={OFFSET_X}
                    y={offsetY + 4}
                    fontSize="13"
                    fontWeight="700"
                    fill="#2b3d47"
                    className="group-hover:fill-tide-700"
                  >
                    {s.code.toUpperCase()} <tspan fontWeight="800" fill="#175468">{count}</tspan>
                  </text>
                </>
              ) : (
                <text x={s.x} y={s.y} textAnchor="middle" pointerEvents="none">
                  <tspan x={s.x} dy="-2" fontSize="10" fontWeight="700" fill={text} opacity="0.85">
                    {s.code.toUpperCase()}
                  </tspan>
                  <tspan x={s.x} dy="13" fontSize="13" fontWeight="800" fill={text}>
                    {count}
                  </tspan>
                </text>
              )}
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
