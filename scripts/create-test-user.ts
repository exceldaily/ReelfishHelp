/** Dev helper: creates a test admin user (test@reelfish.dev / hooked123). */
import path from "path";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

async function main() {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  const db = drizzle(client, { schema });

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, "test@reelfish.dev"),
  });
  if (existing) {
    console.log("test user already exists:", existing.id);
  } else {
    const [u] = await db
      .insert(schema.users)
      .values({
        email: "test@reelfish.dev",
        passwordHash: await bcrypt.hash("hooked123", 12),
        role: "admin",
      })
      .returning();
    await db.insert(schema.profiles).values({
      userId: u.id,
      username: "testangler",
      displayName: "Test Angler",
    });
    console.log("created test user:", u.id);
  }
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
