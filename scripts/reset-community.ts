/**
 * One-time community reset: deletes every demo bot account (cascades take
 * their forum posts, answers, follows, and notifications) and starts a few
 * real forum topics authored by the owner (@marlin on prod; falls back to
 * the first admin locally).
 *
 * Local PGlite:  npx tsx scripts/reset-community.ts
 * Prod (Neon):   npx tsx scripts/reset-community.ts <path-to-env-file>
 */
import fs from "fs";
import path from "path";
import { eq, inArray, like } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as schema from "../src/db/schema";
import type { Db } from "../src/db";

const STARTER_TOPICS = [
  {
    title: "What is your favorite setup right now?",
    body: "Rod, reel, line, leader, the whole thing. What are you fishing with lately and what would you buy again in a heartbeat? Doesn't matter if it's a $40 combo or a full offshore rig, I want to hear what's working for you.",
    topic: "tackle-rigs",
    tags: ["setups", "gear"],
    hoursAgo: 26,
  },
  {
    title: "One lure or bait you never leave home without?",
    body: "If you could only bring one lure or bait for the whole day, what gets the nod? Curious what everyone ties on first when they hit the water.",
    topic: "bait-lures",
    tags: ["lures", "bait"],
    hoursAgo: 20,
  },
  {
    title: "Where is everyone fishing this summer?",
    body: "Broad strokes only, nobody has to give up a secret spot. Ponds, rivers, piers, flats, offshore? What kind of water are you hitting this summer and how has the bite been?",
    topic: "where-to-fish",
    tags: ["summer"],
    hoursAgo: 4,
  },
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

  // 1) demo bots out — cascades remove their forum posts/answers/follows/DMs
  const bots = await db.query.users.findMany({
    where: like(schema.users.email, "%@demo.reelfishhelp.app"),
    columns: { id: true, email: true },
  });
  if (bots.length > 0) {
    const botIds = bots.map((b) => b.id);
    const assets = await db.query.mediaAssets.findMany({
      where: inArray(schema.mediaAssets.ownerId, botIds),
      columns: { id: true },
    });
    if (assets.length > 0) console.log(`note: ${assets.length} media assets will cascade (demo bots had no real uploads)`);
    await db.delete(schema.users).where(inArray(schema.users.id, botIds));
  }
  console.log(`deleted ${bots.length} bot accounts`);

  // 2) starter topics by the owner
  let author = await db.query.profiles.findFirst({ where: eq(schema.profiles.username, "marlin") });
  if (!author) {
    const admin = await db.query.users.findFirst({ where: eq(schema.users.role, "admin") });
    author = admin
      ? await db.query.profiles.findFirst({ where: eq(schema.profiles.userId, admin.id) })
      : undefined;
    if (author) console.log(`marlin not found, using admin @${author.username} (local run)`);
  }
  if (!author) throw new Error("no author account found");

  let created = 0;
  for (const t of STARTER_TOPICS) {
    const exists = await db.query.forumQuestions.findFirst({
      where: eq(schema.forumQuestions.title, t.title),
      columns: { id: true },
    });
    if (exists) continue;
    await db.insert(schema.forumQuestions).values({
      id: randomUUID(),
      userId: author.userId,
      boardId: null,
      topic: t.topic,
      title: t.title,
      body: t.body,
      tags: t.tags,
      createdAt: new Date(Date.now() - t.hoursAgo * 3600_000),
    });
    created++;
  }
  console.log(`created ${created} starter topics by @${author.username}`);

  const remaining = await db.query.forumQuestions.findMany({ columns: { id: true } });
  console.log(`${remaining.length} forum questions total`);
  await close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
