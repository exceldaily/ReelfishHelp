import path from "path";
import * as schema from "./schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";

export type Db = NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>;

/**
 * Dual-driver database client.
 * - DATABASE_URL set  → Neon / any Postgres (production)
 * - DATABASE_URL unset → embedded PGlite in .data/pglite (local development).
 *   Local mode auto-runs migrations and seeds the species database so the
 *   whole app works with zero configuration. The UI shows a "local dev
 *   database" banner in this mode.
 */

const globalForDb = globalThis as unknown as {
  __db?: Promise<Db>;
  __dbMode?: "postgres" | "pglite";
};

export function dbMode(): "postgres" | "pglite" {
  return process.env.DATABASE_URL ? "postgres" : "pglite";
}

async function initDb(): Promise<Db> {
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
    globalForDb.__dbMode = "postgres";
    return drizzle(pool, { schema });
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = path.join(process.cwd(), ".data", "pglite");
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  const { ensureSeed } = await import("./seed-runtime");
  await ensureSeed(db);
  globalForDb.__dbMode = "pglite";
  return db;
}

export function getDb(): Promise<Db> {
  if (!globalForDb.__db) globalForDb.__db = initDb();
  return globalForDb.__db;
}

export * from "./schema";
