import { and, desc, eq } from "drizzle-orm";
import {
  getDb,
  species,
  gearSetups,
  knots,
  crews,
  catches,
  profiles,
  type Db,
} from "@/db";

/** US-centric season from a date (northern hemisphere). */
export function seasonFor(date = new Date()): "spring" | "summer" | "fall" | "winter" {
  const m = date.getMonth(); // 0-11
  if (m <= 1 || m === 11) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "fall";
}

export function monthName(date = new Date()): string {
  return date.toLocaleString("en-US", { month: "long" });
}

export type StudioContext = {
  today: string;
  month: string;
  season: string;
  popularSpecies: { slug: string; name: string; water: string; category: string }[];
  recentGuides: { slug: string; name: string }[];
  setups: { slug: string; name: string; summary: string; species: string[] }[];
  knots: { slug: string; name: string; bestUse: string }[];
  activeCrews: { slug: string; name: string; members: number }[];
  featurableCatches: {
    id: string;
    species: string | null;
    lengthIn: number | null;
    weightLb: number | null;
    method: string | null;
    bait: string | null;
    handle: string;
    displayName: string;
  }[];
};

/**
 * Gather real ReelFishHelp content to ground content generation. Everything
 * here is already-public or admin-owned; the only user catches included are
 * public AND from anglers who opted in to social featuring (profiles.allowFeature).
 */
export async function gatherStudioContext(dbArg?: Db): Promise<StudioContext> {
  const db = dbArg ?? (await getDb());
  const now = new Date();

  const [allSpecies, setupRows, knotRows, crewRows, catchRows] = await Promise.all([
    db.query.species.findMany({ where: eq(species.active, true) }),
    db.query.gearSetups.findMany({ where: eq(gearSetups.status, "published") }),
    db.query.knots.findMany({ where: eq(knots.status, "published") }),
    db.query.crews.findMany({ orderBy: [desc(crews.memberCount), desc(crews.createdAt)], limit: 8 }),
    // public catches from opted-in anglers, newest first
    db
      .select({
        id: catches.id,
        speciesId: catches.speciesId,
        customSpeciesName: catches.customSpeciesName,
        lengthIn: catches.lengthIn,
        weightLb: catches.weightLb,
        method: catches.method,
        bait: catches.bait,
        handle: profiles.username,
        displayName: profiles.displayName,
      })
      .from(catches)
      .innerJoin(profiles, eq(profiles.userId, catches.userId))
      .where(and(eq(catches.visibility, "public"), eq(profiles.allowFeature, true)))
      .orderBy(desc(catches.caughtAt))
      .limit(24),
  ]);

  const bySlug = new Map(allSpecies.map((s) => [s.id, s.commonName] as const));

  // "popular" = a spread across beginner-friendly + varied categories, capped
  const popular = [...allSpecies]
    .sort((a, b) => Number(b.beginnerFriendly) - Number(a.beginnerFriendly) || a.difficulty - b.difficulty)
    .slice(0, 24)
    .map((s) => ({ slug: s.slug, name: s.commonName, water: s.water, category: s.category }));

  const recentGuides = [...allSpecies]
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    .slice(0, 8)
    .map((s) => ({ slug: s.slug, name: s.commonName }));

  return {
    today: now.toISOString().slice(0, 10),
    month: monthName(now),
    season: seasonFor(now),
    popularSpecies: popular,
    recentGuides,
    setups: setupRows.slice(0, 16).map((s) => ({
      slug: s.slug,
      name: s.name,
      summary: s.summary,
      species: s.relatedSpecies,
    })),
    knots: knotRows.slice(0, 20).map((k) => ({ slug: k.slug, name: k.name, bestUse: k.bestUse })),
    activeCrews: crewRows.map((c) => ({ slug: c.slug, name: c.name, members: c.memberCount })),
    featurableCatches: catchRows.map((c) => ({
      id: c.id,
      species: c.speciesId ? bySlug.get(c.speciesId) ?? null : c.customSpeciesName,
      lengthIn: c.lengthIn,
      weightLb: c.weightLb,
      method: c.method,
      bait: c.bait,
      handle: c.handle,
      displayName: c.displayName,
    })),
  };
}

/** Compact plain-text version of the context for a model prompt. */
export function contextToPromptBlock(ctx: StudioContext): string {
  const lines: string[] = [];
  lines.push(`Today: ${ctx.today} (${ctx.month}, ${ctx.season})`);
  lines.push(
    `Popular species: ${ctx.popularSpecies.map((s) => `${s.name} (${s.water})`).join(", ")}`
  );
  if (ctx.recentGuides.length)
    lines.push(`Recently added fish guides: ${ctx.recentGuides.map((s) => s.name).join(", ")}`);
  if (ctx.setups.length)
    lines.push(`Gear setups available: ${ctx.setups.map((s) => s.name).join(", ")}`);
  if (ctx.knots.length)
    lines.push(`Knots covered: ${ctx.knots.map((k) => k.name).join(", ")}`);
  if (ctx.activeCrews.length)
    lines.push(`Active crews: ${ctx.activeCrews.map((c) => `${c.name} (${c.members} members)`).join(", ")}`);
  return lines.join("\n");
}
