/** Runs SQL migrations against DATABASE_URL (Neon) or the local PGlite db. */
import path from "path";

async function main() {
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    await pool.end();
    console.log("✓ migrations applied to Postgres (DATABASE_URL)");
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    await client.close();
    console.log("✓ migrations applied to local PGlite database");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
