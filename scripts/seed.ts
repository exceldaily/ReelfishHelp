/** Seeds species + regulation data into DATABASE_URL (Neon) or local PGlite. */
import path from "path";
import * as schema from "../src/db/schema";
import { ensureSeed } from "../src/db/seed-runtime";
import type { Db } from "../src/db";

async function main() {
  let db: Db;
  let close: () => Promise<void>;
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    db = drizzle(pool, { schema });
    close = () => pool.end();
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
    db = drizzle(client, { schema });
    close = () => client.close();
  }
  await ensureSeed(db);
  await close();
  console.log("✓ seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
