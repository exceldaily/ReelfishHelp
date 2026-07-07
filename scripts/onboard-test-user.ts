/** Dev helper: marks the test user onboarded with a Tampa, FL location. */
import path from "path";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

async function main() {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  const db = drizzle(client, { schema });
  await db
    .update(schema.profiles)
    .set({
      onboarded: true,
      lastLat: 27.95,
      lastLng: -82.46,
      lastLocationLabel: "Tampa, FL",
      manualState: "FL",
      homeState: "FL",
      waterPref: "both",
    })
    .where(eq(schema.profiles.username, "testangler"));
  console.log("onboarded set");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
