import { count } from "drizzle-orm";
import type { Db } from "./index";
import { species, regulationLinks } from "./schema";
import { allSpecies } from "@/data/species";
import { stateRegulations } from "@/data/regulations";

/** Seeds species + regulation links if the database is empty. Idempotent. */
export async function ensureSeed(db: Db) {
  const [{ value: speciesCount }] = await db
    .select({ value: count() })
    .from(species);
  if (speciesCount === 0) {
    for (const s of allSpecies) {
      await db.insert(species).values(s).onConflictDoNothing();
    }
    console.log(`[seed] inserted ${allSpecies.length} species`);
  }

  const [{ value: regCount }] = await db
    .select({ value: count() })
    .from(regulationLinks);
  if (regCount === 0) {
    await db.insert(regulationLinks).values(stateRegulations).onConflictDoNothing();
    console.log(`[seed] inserted ${stateRegulations.length} state regulation links`);
  }
}
