import Link from "next/link";

/**
 * USA tile-grid map ("cartogram") of the 50 state bite boards. Each state is a
 * square tile placed on an 11x8 grid that approximates the shape of the USA
 * (Alaska top-left, Maine top-right, Hawaii bottom-left, Florida bottom-right).
 * Tiles show the state code and its public bite-report count and link to that
 * state's board. Pure CSS grid — no client JS, no map libraries.
 */

// [code, gridRow, gridCol] — 1-based CSS grid coordinates
const STATE_TILES: [string, number, number][] = [
  ["AK", 1, 1],
  ["ME", 1, 11],
  ["VT", 2, 9],
  ["NH", 2, 10],
  ["WA", 3, 1],
  ["ID", 3, 2],
  ["MT", 3, 3],
  ["ND", 3, 4],
  ["MN", 3, 5],
  ["WI", 3, 6],
  ["MI", 3, 8],
  ["NY", 3, 9],
  ["MA", 3, 10],
  ["RI", 3, 11],
  ["OR", 4, 1],
  ["NV", 4, 2],
  ["WY", 4, 3],
  ["SD", 4, 4],
  ["IA", 4, 5],
  ["IL", 4, 6],
  ["IN", 4, 7],
  ["OH", 4, 8],
  ["PA", 4, 9],
  ["NJ", 4, 10],
  ["CT", 4, 11],
  ["CA", 5, 1],
  ["UT", 5, 2],
  ["CO", 5, 3],
  ["NE", 5, 4],
  ["MO", 5, 5],
  ["KY", 5, 6],
  ["WV", 5, 7],
  ["VA", 5, 8],
  ["MD", 5, 9],
  ["DE", 5, 10],
  ["AZ", 6, 2],
  ["NM", 6, 3],
  ["KS", 6, 4],
  ["AR", 6, 5],
  ["TN", 6, 6],
  ["NC", 6, 7],
  ["SC", 6, 8],
  ["OK", 7, 4],
  ["LA", 7, 5],
  ["MS", 7, 6],
  ["AL", 7, 7],
  ["GA", 7, 8],
  ["HI", 8, 1],
  ["TX", 8, 4],
  ["FL", 8, 9],
];

/** Heat classes by public report count — busier boards read darker. */
function heat(count: number): string {
  if (count >= 6) return "bg-tide-700 border-tide-700 text-white hover:bg-tide-600";
  if (count >= 3) return "bg-tide-500 border-tide-500 text-white hover:bg-tide-400";
  if (count >= 1) return "bg-tide-200 border-tide-300 text-tide-900 hover:bg-tide-300";
  return "bg-white border-sand-200 text-ink-500 hover:bg-tide-50 hover:text-tide-800";
}

export type StateBoardStat = { name: string; count: number };

export function UsaBiteMap({ stats }: { stats: Record<string, StateBoardStat> }) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <div
        className="grid gap-1.5 min-w-[590px]"
        style={{ gridTemplateColumns: "repeat(11, minmax(0, 1fr))" }}
        role="list"
        aria-label="Bite boards by state, arranged as a map of the United States"
      >
        {STATE_TILES.map(([code, row, col]) => {
          const slug = code.toLowerCase();
          const stat = stats[slug];
          const count = stat?.count ?? 0;
          return (
            <Link
              key={code}
              role="listitem"
              href={`/boards/${slug}`}
              style={{ gridRow: row, gridColumn: col }}
              aria-label={`${stat?.name ?? code} — ${count} public bite report${count === 1 ? "" : "s"}`}
              title={`${stat?.name ?? code}: ${count} public report${count === 1 ? "" : "s"}`}
              className={`aspect-square min-w-10 rounded-lg border shadow-card flex flex-col items-center justify-center gap-0.5 transition-colors ${heat(count)}`}
            >
              <span className="text-[10px] font-bold leading-none tracking-wide">{code}</span>
              <span className="font-display text-sm font-extrabold leading-none">{count}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
        <span className="font-semibold">Public reports:</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded border border-sand-200 bg-white" /> 0</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-tide-200" /> 1–2</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-tide-500" /> 3–5</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-tide-700" /> 6+</span>
      </div>
    </div>
  );
}
