import { count, inArray, eq } from "drizzle-orm";
import type { Db } from "./index";
import { species, regulationLinks, biteBoards } from "./schema";
import { allSpecies } from "@/data/species";
import { stateRegulations } from "@/data/regulations";
import { retiredStarterBiteBoardSlugs, starterBiteBoards, starterBiteBoardSlugs } from "@/data/bite-boards";

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

  // retire generic entries that have been split into per-species profiles
  if (RETIRED_SLUGS.length > 0) {
    await db.update(species).set({ active: false }).where(inArray(species.slug, RETIRED_SLUGS));
  }

  const [{ value: regCount }] = await db.select({ value: count() }).from(regulationLinks);
  if (regCount === 0) {
    await db.insert(regulationLinks).values(stateRegulations).onConflictDoNothing();
    console.log(`[seed] inserted ${stateRegulations.length} state regulation links`);
  }

  await db.insert(biteBoards).values(starterBiteBoards).onConflictDoNothing();
  await db.update(biteBoards).set({ active: true }).where(inArray(biteBoards.slug, starterBiteBoardSlugs));
  await db.update(biteBoards).set({ active: false }).where(inArray(biteBoards.slug, retiredStarterBiteBoardSlugs));
}

/** Count of active species — handy for a post-seed sanity check. */
export async function activeSpeciesCount(db: Db): Promise<number> {
  const [{ value }] = await db.select({ value: count() }).from(species).where(eq(species.active, true));
  return value;
}
