import { count, inArray, eq, and, ne, like, isNull } from "drizzle-orm";
import type { Db } from "./index";
import { species, regulationLinks, biteBoards, gearArticles, knots, gearSetups, gearBrands, fishGearRequirements } from "./schema";
import { allSpecies } from "@/data/species";
import { stateRegulations } from "@/data/regulations";
import { retiredStarterBiteBoardSlugs, starterBiteBoards, starterBiteBoardSlugs } from "@/data/bite-boards";
import { allGearArticles, knotData, setupData, brandData, fishRequirementData } from "@/data/gear";

/**
 * Slugs that were split into individual species and should be hidden from the
 * Fish Finder. The rows are kept (not deleted) so existing catches that
 * reference them still resolve — they're just marked inactive.
 */
const RETIRED_SLUGS = ["tuna", "snapper", "grouper"];

/**
 * Seeds species + regulation links. Idempotent and ADDITIVE: it inserts any
 * species/regulations that don't exist yet (so newly added species show up on
 * the next seed/boot) without overwriting existing rows or admin edits.
 */
export async function ensureSeed(db: Db) {
  // insert-missing: onConflictDoNothing skips species already in the table,
  // so admin edits are preserved and only genuinely-new species are added.
  for (const s of allSpecies) {
    await db.insert(species).values(s).onConflictDoNothing();
  }

  // self-heal curated photos: a species whose stored image_url is a self-hosted
  // /species/* path that no longer matches the curated file (e.g. the extension
  // changed from .png/.webp to .jpg) is stale seed data — onConflictDoNothing
  // above can't fix it, so re-point it here. Only touches mismatched /species/*
  // paths, so external "https://…" admin overrides (and intentionally-blank
  // image_url that falls back to Wikipedia auto-resolve) are left untouched.
  for (const s of allSpecies) {
    if (!s.imageUrl) continue;
    await db
      .update(species)
      .set({ imageUrl: s.imageUrl, imageCredit: s.imageCredit })
      .where(
        and(
          eq(species.slug, s.slug),
          like(species.imageUrl, "/species/%"),
          ne(species.imageUrl, s.imageUrl),
        ),
      );
  }

  // retire generic entries that have been split into per-species profiles
  if (RETIRED_SLUGS.length > 0) {
    await db.update(species).set({ active: false }).where(inArray(species.slug, RETIRED_SLUGS));
  }

  const [{ value: regCount }] = await db.select({ value: count() }).from(regulationLinks);
  if (regCount === 0) {
    await db.insert(regulationLinks).values(stateRegulations).onConflictDoNothing();
    console.log(`[seed] inserted ${stateRegulations.length} state regulation links`);
  }

  // self-heal: agencies moved these pages (found via July 2026 link audit). Only
  // rows still pointing at the known-stale URL are rewritten, so any URL an
  // admin has hand-edited is left alone.
  const REG_URL_FIXES: { state: string; from: string; to: string }[] = [
    { state: "IL", from: "https://dnr.illinois.gov/fishing.html", to: "https://ifishillinois.org/" },
    { state: "IA", from: "https://www.iowadnr.gov/things-to-do/fishing", to: "https://www.iowadnr.gov/things-do/fishing" },
    { state: "KS", from: "https://ksoutdoors.com/Fishing", to: "https://www.ksoutdoors.gov/Fishing" },
    { state: "LA", from: "https://www.wlf.louisiana.gov/page/fishing", to: "https://www.wlf.louisiana.gov/page/recreational-fishing" },
    { state: "RI", from: "https://dem.ri.gov/natural-resources-bureau/fish-wildlife/fishing", to: "https://dem.ri.gov/natural-resources-bureau/fish-wildlife" },
    { state: "UT", from: "https://wildlife.utah.gov/fishing-in-utah.html", to: "https://wildlife.utah.gov/fishing" },
    { state: "MS", from: "https://www.mdwfp.com/fishing-boating/", to: "https://www.mdwfp.com/fishing-boating" },
  ];
  for (const fix of REG_URL_FIXES) {
    await db
      .update(regulationLinks)
      .set({ url: fix.to })
      .where(and(eq(regulationLinks.state, fix.state), eq(regulationLinks.url, fix.from)));
  }

  await db.insert(biteBoards).values(starterBiteBoards).onConflictDoNothing();
  await db.update(biteBoards).set({ active: true }).where(inArray(biteBoards.slug, starterBiteBoardSlugs));
  await db.update(biteBoards).set({ active: false }).where(inArray(biteBoards.slug, retiredStarterBiteBoardSlugs));

  // gear education content — additive (onConflictDoNothing on unique slug / pk)
  for (const a of allGearArticles) await db.insert(gearArticles).values(a).onConflictDoNothing();
  for (const k of knotData) await db.insert(knots).values(k).onConflictDoNothing();
  for (const su of setupData) await db.insert(gearSetups).values(su).onConflictDoNothing();
  for (const b of brandData) await db.insert(gearBrands).values(b).onConflictDoNothing();
  for (const r of fishRequirementData) await db.insert(fishGearRequirements).values(r).onConflictDoNothing();

  // give each knot a default "how to tie it" video link where none is set yet.
  // YouTube search URLs never 404 and return relevant tutorials; admins can
  // replace any with a specific curated video. Only fills nulls (preserves edits).
  for (const k of knotData) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(`how to tie the ${k.name} fishing knot`)}`;
    await db.update(knots).set({ videoUrl: url }).where(and(eq(knots.slug, k.slug), isNull(knots.videoUrl)));
  }
}

/** Count of active species — handy for a post-seed sanity check. */
export async function activeSpeciesCount(db: Db): Promise<number> {
  const [{ value }] = await db.select({ value: count() }).from(species).where(eq(species.active, true));
  return value;
}
