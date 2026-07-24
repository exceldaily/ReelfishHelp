import type { Region } from "@/lib/regions";

/**
 * Region marker icon. Windows has no emoji flag glyphs (🇺🇸 renders as "US"
 * text), so the USA gets a real inline-SVG flag; the SEA globe emoji renders
 * fine everywhere.
 */
export function RegionFlag({ region, className = "size-4" }: { region: Region; className?: string }) {
  if (region === "us") {
    return (
      <svg viewBox="0 0 190 100" className={`${className} shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]`} aria-hidden>
        <rect width="190" height="100" fill="#b22234" />
        {[1, 3, 5, 7, 9, 11].map((i) => (
          <rect key={i} y={(i * 100) / 13} width="190" height={100 / 13} fill="#fff" />
        ))}
        <rect width="76" height={(7 * 100) / 13} fill="#3c3b6e" />
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <circle key={`${row}-${col}`} cx={9 + col * 15} cy={7.5 + row * 10.5} r="2.6" fill="#fff" />
          ))
        )}
      </svg>
    );
  }
  return (
    <span className="shrink-0 leading-none" aria-hidden>
      🌏
    </span>
  );
}
