/**
 * Targeted seed: inserts ONLY the Southeast Asia bite boards.
 * Safe for prod (ON CONFLICT DO NOTHING; never touches US boards). Usage:
 *   DATABASE_URL=... npx tsx scripts/seed-sea-boards.ts
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { biteBoards } from "../src/db/schema";
import { seaBiteBoards } from "../src/data/bite-boards";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL");
  const pool = new Pool({ connectionString: url, max: 2 });
  const db = drizzle(pool);

  let inserted = 0;
  for (const b of seaBiteBoards) {
    const res = await db.insert(biteBoards).values(b).onConflictDoNothing();
    if ((res as unknown as { rowCount?: number }).rowCount) inserted++;
    console.log(`  ${b.slug}`);
  }
  console.log(`Done: ${seaBiteBoards.length} SEA boards processed, ${inserted} newly inserted.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
