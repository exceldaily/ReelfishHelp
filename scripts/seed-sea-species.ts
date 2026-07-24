/**
 * Targeted seed: inserts ONLY the Southeast Asia species catalog.
 * Safe for prod (ON CONFLICT DO NOTHING; never touches US species or the
 * unapproved additions). Usage:
 *   DATABASE_URL=... npx tsx scripts/seed-sea-species.ts
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { species } from "../src/db/schema";
import { seaSpecies1 } from "../src/data/species/sea-1";
import { seaSpecies2 } from "../src/data/species/sea-2";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL");
  const pool = new Pool({ connectionString: url, max: 2 });
  const db = drizzle(pool);

  const all = [...seaSpecies1, ...seaSpecies2];
  let inserted = 0;
  for (const s of all) {
    const res = await db.insert(species).values(s).onConflictDoNothing();
    // node-postgres reports rowCount on the result
    if ((res as unknown as { rowCount?: number }).rowCount) inserted++;
    console.log(`  ${s.slug}`);
  }
  console.log(`Done: ${all.length} SEA species processed, ${inserted} newly inserted.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
