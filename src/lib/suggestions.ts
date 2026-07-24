import { eq } from "drizzle-orm";
import { getDb, species, type Species } from "@/db";

export type SpeciesSuggestion = {
  id: string;
  slug: string;
  commonName: string;
  water: string;
  difficulty: number;
  beginnerFriendly: boolean;
  imageUrl: string | null;
  bestBaitNow: string;
  whyNow: string;
};

const SEASON_BY_MONTH = ["winter", "winter", "spring", "spring", "spring", "summer", "summer", "summer", "fall", "fall", "fall", "winter"];

const STATE_REGION: Record<string, string[]> = {
  ME: ["Northeast"], NH: ["Northeast"], VT: ["Northeast"], MA: ["Northeast"], RI: ["Northeast"],
  CT: ["Northeast"], NY: ["Northeast"], NJ: ["Northeast", "Atlantic Coast"], PA: ["Northeast"],
  DE: ["Atlantic Coast", "Northeast"], MD: ["Atlantic Coast", "Northeast"], VA: ["Atlantic Coast", "Southeast"],
  NC: ["Southeast", "Atlantic Coast"], SC: ["Southeast", "Atlantic Coast"], GA: ["Southeast", "Atlantic Coast"],
  FL: ["Florida", "Southeast", "Gulf Coast", "Atlantic Coast"],
  AL: ["Southeast", "Gulf Coast"], MS: ["Southeast", "Gulf Coast"], LA: ["South Central", "Gulf Coast"],
  TX: ["South Central", "Gulf Coast"], OK: ["South Central"], AR: ["South Central"], TN: ["Southeast"],
  KY: ["Southeast", "Midwest"], WV: ["Southeast", "Northeast"], OH: ["Midwest"], IN: ["Midwest"],
  IL: ["Midwest"], MI: ["Midwest"], WI: ["Midwest"], MN: ["Midwest"], IA: ["Midwest"], MO: ["Midwest", "South Central"],
  ND: ["Midwest"], SD: ["Midwest"], NE: ["Midwest"], KS: ["Midwest", "South Central"],
  MT: ["West"], WY: ["West"], CO: ["West", "Southwest"], NM: ["Southwest"], AZ: ["Southwest"],
  UT: ["West", "Southwest"], NV: ["West", "Southwest"], ID: ["West", "Pacific Northwest"],
  WA: ["Pacific Northwest", "Pacific Coast"], OR: ["Pacific Northwest", "Pacific Coast"],
  CA: ["West", "Pacific Coast"], AK: ["Pacific Northwest"], HI: ["Pacific Coast"],
};

export function regionsForState(state: string | null): string[] {
  if (!state) return [];
  return STATE_REGION[state] ?? [];
}

export function seasonForMonth(month: number): string {
  return SEASON_BY_MONTH[month];
}

function matchesLocation(s: Species, state: string | null): boolean {
  if (s.regions.includes("Nationwide")) return true;
  if (!state) return true;
  if (s.states.length > 0 && s.states.includes(state)) return true;
  const regions = regionsForState(state);
  return s.regions.some((r) => regions.includes(r));
}

/** Species worth targeting for a location + month, ranked (in-season, nearby, easier first). */
export async function suggestSpecies(opts: {
  environment: "coastal" | "freshwater";
  state: string | null;
  month: number;
  limit?: number;
  /** app market: "us" (default) or "sea" — never suggest the other region's fish */
  region?: "us" | "sea";
}): Promise<SpeciesSuggestion[]> {
  const db = await getDb();
  const region = opts.region ?? "us";
  const all = await db.query.species.findMany({ where: eq(species.active, true) });
  const season = seasonForMonth(opts.month);

  const scored = all
    .map((s) => {
      if (s.region !== region) return null;
      let score = 0;
      const inWater =
        s.water === "both" ||
        (opts.environment === "coastal" ? s.water === "saltwater" : s.water === "freshwater");
      // coastal users still have freshwater nearby, but prioritize salt
      if (inWater) score += 10;
      else if (opts.environment === "coastal" && s.water === "freshwater") score += 2;
      else return null;

      // states/US-regions only mean anything in the US market
      if (region === "us") {
        if (!matchesLocation(s, opts.state)) return null;
        if (s.states.length > 0 && opts.state && s.states.includes(opts.state)) score += 6;
        if (s.regions.includes("Nationwide")) score += 2;
      }
      if (s.seasons.includes(season)) score += 8;
      if (s.beginnerFriendly) score += 3;
      score += 5 - s.difficulty;
      return { s, score };
    })
    .filter((x): x is { s: Species; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 8);

  return scored.map(({ s }) => ({
    id: s.id,
    slug: s.slug,
    commonName: s.commonName,
    water: s.water,
    difficulty: s.difficulty,
    beginnerFriendly: s.beginnerFriendly,
    imageUrl: s.imageUrl,
    bestBaitNow: s.guide.quickPlan.bestBaitNow,
    whyNow: s.seasons.includes(season)
      ? `In season now (${season}) in your area`
      : `Available in your area — best in ${s.seasons.join("/") || "warm months"}`,
  }));
}
