/** Applies the pre-resolved image map to existing species rows (local or DATABASE_URL). */
import path from "path";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { speciesImages } from "../src/data/species/images";
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
  let n = 0;
  for (const [slug, img] of Object.entries(speciesImages)) {
    await db
      .update(schema.species)
      .set({ imageUrl: img.url, imageCredit: img.credit })
      .where(eq(schema.species.slug, slug));
    n++;
  }
  console.log(`updated ${n} species images`);
  await close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
