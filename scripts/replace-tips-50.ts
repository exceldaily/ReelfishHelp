/**
 * One-time swap: removes the original 18 starter tips and inserts the owner's
 * 50 tips from src/data/tips.ts. Targeted on purpose — a full db:seed would
 * also publish the amberjack/black-sea-bass species that are still awaiting
 * image approval.
 *
 * Local PGlite:  npx tsx scripts/replace-tips-50.ts
 * Prod (Neon):   npx tsx scripts/replace-tips-50.ts <path-to-env-file>
 */
import fs from "fs";
import path from "path";
import { inArray } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { starterTips } from "../src/data/tips";
import type { Db } from "../src/db";

const OLD_SLUGS = [
  "rain-runoff-creek-mouths",
  "match-the-hatch-size-first",
  "wet-hands-before-release",
  "retie-after-every-big-fish",
  "falling-tide-drains",
  "sun-in-your-face",
  "storm-front-bite-window",
  "kayak-drift-sock",
  "circle-hooks-set-themselves",
  "first-cast-counts",
  "drag-check-before-trip",
  "birds-mean-bait",
  "shore-anglers-fish-close-first",
  "leader-in-clear-water",
  "file-a-float-plan",
  "revive-fish-facing-current",
  "fly-line-management",
  "idle-speed-over-structure",
];

async function main() {
  const envFile = process.argv[2];
  let databaseUrl = process.env.DATABASE_URL;
  if (envFile) {
    const raw = fs.readFileSync(envFile, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^DATABASE_URL="?(.*?)"?$/);
      if (m) databaseUrl = m[1];
    }
    if (!databaseUrl) throw new Error(`no DATABASE_URL in ${envFile}`);
  }

  let db: Db;
  let close: () => Promise<void>;
  if (databaseUrl) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: databaseUrl, max: 1 });
    db = drizzle(pool, { schema });
    close = () => pool.end();
    console.log("target: Neon (prod)");
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
    db = drizzle(client, { schema });
    close = () => client.close();
    console.log("target: local PGlite");
  }

  const removed = await db
    .delete(schema.anglerTips)
    .where(inArray(schema.anglerTips.slug, OLD_SLUGS))
    .returning();
  const inserted = await db
    .insert(schema.anglerTips)
    .values(starterTips)
    .onConflictDoNothing({ target: schema.anglerTips.slug })
    .returning();
  const total = await db.query.anglerTips.findMany({ columns: { slug: true } });
  console.log(`removed ${removed.length} old tips, inserted ${inserted.length} new, ${total.length} total in table`);
  await close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
