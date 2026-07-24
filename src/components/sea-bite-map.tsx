import Link from "next/link";

/**
 * Southeast Asia bite-board map. Unlike the US map (which has clean
 * public-domain state outlines), SEA coastlines are archipelagos — so this is
 * a deliberately stylized tile map: rounded blocks arranged geographically
 * (mainland up top, Borneo center, the Indonesian arc south, the Philippine
 * column east). Same heat scale and interaction as UsaBiteMap.
 */

/** fill / label-color tiers by public report count — matches UsaBiteMap */
function heat(count: number): { fill: string; text: string } {
  if (count >= 6) return { fill: "#164556", text: "#ffffff" }; // tide-800
  if (count >= 3) return { fill: "#22829b", text: "#ffffff" }; // tide-500
  if (count >= 1) return { fill: "#abd9e4", text: "#123847" }; // tide-200
  return { fill: "#e8e1cf", text: "#2b3d47" }; // sand-200
}

type Tile = { slug: string; label: string; x: number; y: number; w: number; h: number };

/** Geographic-ish tile layout, viewBox 0 0 960 560. */
const TILES: Tile[] = [
  // mainland
  { slug: "sea-myanmar", label: "Myanmar", x: 40, y: 40, w: 120, h: 150 },
  { slug: "sea-thailand", label: "Thailand", x: 170, y: 90, w: 130, h: 170 },
  { slug: "sea-laos", label: "Laos", x: 310, y: 40, w: 110, h: 110 },
  { slug: "sea-vietnam", label: "Vietnam", x: 430, y: 40, w: 100, h: 215 },
  { slug: "sea-cambodia", label: "Cambodia", x: 310, y: 160, w: 110, h: 95 },
  { slug: "sea-peninsular-malaysia", label: "Pen. Malaysia", x: 195, y: 285, w: 125, h: 105 },
  { slug: "sea-singapore", label: "Singapore", x: 230, y: 402, w: 90, h: 44 },
  // borneo
  { slug: "sea-malaysian-borneo", label: "Sabah / Sarawak", x: 430, y: 300, w: 150, h: 66 },
  { slug: "sea-brunei", label: "Brunei", x: 590, y: 300, w: 74, h: 44 },
  { slug: "sea-kalimantan", label: "Kalimantan", x: 430, y: 376, w: 150, h: 90 },
  // indonesian arc
  { slug: "sea-sumatra", label: "Sumatra", x: 55, y: 380, w: 130, h: 88 },
  { slug: "sea-java", label: "Java", x: 195, y: 480, w: 150, h: 56 },
  { slug: "sea-bali-nusa-tenggara", label: "Bali & Nusa Tenggara", x: 355, y: 480, w: 185, h: 56 },
  { slug: "sea-sulawesi", label: "Sulawesi", x: 600, y: 376, w: 115, h: 90 },
  // philippine column
  { slug: "sea-luzon", label: "Luzon", x: 650, y: 55, w: 115, h: 78 },
  { slug: "sea-visayas", label: "Visayas", x: 672, y: 143, w: 115, h: 68 },
  { slug: "sea-mindanao", label: "Mindanao", x: 694, y: 221, w: 115, h: 78 },
];

export type SeaBoardStat = { name: string; count: number };

export function SeaBiteMap({ stats }: { stats: Record<string, SeaBoardStat> }) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <svg
        viewBox="0 0 840 560"
        role="list"
        aria-label="Bite boards across Southeast Asia"
        className="w-full h-auto min-w-[620px]"
      >
        {TILES.map((t) => {
          const stat = stats[t.slug];
          const count = stat?.count ?? 0;
          const { fill, text } = heat(count);
          const cx = t.x + t.w / 2;
          const cy = t.y + t.h / 2;
          const small = t.h < 50;
          return (
            <Link
              key={t.slug}
              role="listitem"
              href={`/boards/${t.slug}`}
              aria-label={`${stat?.name ?? t.label} — ${count} public bite report${count === 1 ? "" : "s"}`}
              className="group cursor-pointer focus-visible:outline-2 focus-visible:outline-tide-500"
            >
              <title>{`${stat?.name ?? t.label}: ${count} public report${count === 1 ? "" : "s"}`}</title>
              <rect
                x={t.x}
                y={t.y}
                width={t.w}
                height={t.h}
                rx="12"
                fill={fill}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-[filter] group-hover:brightness-95"
              />
              {small ? (
                <text x={cx} y={cy + 4} textAnchor="middle" pointerEvents="none" fontSize="11" fontWeight="700" fill={text}>
                  {t.label} <tspan fontWeight="800">{count}</tspan>
                </text>
              ) : (
                <text x={cx} y={cy} textAnchor="middle" pointerEvents="none">
                  <tspan x={cx} dy="-3" fontSize="12" fontWeight="700" fill={text} opacity="0.9">
                    {t.label}
                  </tspan>
                  <tspan x={cx} dy="17" fontSize="15" fontWeight="800" fill={text}>
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
