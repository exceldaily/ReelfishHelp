/**
 * One-time swap: drops the "Where is everyone fishing this summer?" starter
 * topic and replaces it with a favorite-place question, authored by @marlin
 * (first admin locally).
 *
 * Local PGlite:  npx tsx scripts/swap-forum-topic.ts
 * Prod (Neon):   npx tsx scripts/swap-forum-topic.ts <path-to-env-file>
 */
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as schema from "../src/db/schema";
import type { Db } from "../src/db";

const OLD_TITLE = "Where is everyone fishing this summer?";
const NEW_TOPIC = {
  title: "What is your favorite place to fish?",
  body: "City, state, or country, wherever it is. What is the one place you would go back to over and over, and what makes it so good? Doesn't have to be a secret spot, just the place that has your heart.",
  topic: "where-to-fish",
  tags: ["destinations"],
  hoursAgo: 4,
};

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
    .delete(schema.forumQuestions)
    .where(eq(schema.forumQuestions.title, OLD_TITLE))
    .returning();
  console.log(`removed ${removed.length} question(s): "${OLD_TITLE}"`);

  let author = await db.query.profiles.findFirst({ where: eq(schema.profiles.username, "marlin") });
  if (!author) {
    const admin = await db.query.users.findFirst({ where: eq(schema.users.role, "admin") });
    author = admin
      ? await db.query.profiles.findFirst({ where: eq(schema.profiles.userId, admin.id) })
      : undefined;
    if (author) console.log(`marlin not found, using admin @${author.username} (local run)`);
  }
  if (!author) throw new Error("no author account found");

  const exists = await db.query.forumQuestions.findFirst({
    where: eq(schema.forumQuestions.title, NEW_TOPIC.title),
    columns: { id: true },
  });
  if (!exists) {
    await db.insert(schema.forumQuestions).values({
      id: randomUUID(),
      userId: author.userId,
      boardId: null,
      topic: NEW_TOPIC.topic,
      title: NEW_TOPIC.title,
      body: NEW_TOPIC.body,
      tags: NEW_TOPIC.tags,
      createdAt: new Date(Date.now() - NEW_TOPIC.hoursAgo * 3600_000),
    });
    console.log(`created "${NEW_TOPIC.title}" by @${author.username}`);
  } else {
    console.log("new topic already exists, skipped insert");
  }

  await close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
