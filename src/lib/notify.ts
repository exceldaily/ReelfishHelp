import { eq } from "drizzle-orm";
import { notifications, type Db, type NotificationType } from "@/db";
import { earnedBadges } from "@/lib/badges";

/**
 * Insert an in-app notification. Never throws — a failed notification must
 * not break the action that triggered it. `dedupeKey` makes one-time events
 * idempotent (unique per user; repeats are silently dropped).
 */
export async function notify(
  db: Db,
  input: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    href?: string;
    image?: string;
    dedupeKey?: string;
  }
): Promise<void> {
  try {
    await db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title.slice(0, 200),
        body: input.body?.slice(0, 400) ?? null,
        href: input.href ?? null,
        image: input.image ?? null,
        dedupeKey: input.dedupeKey ?? null,
      })
      .onConflictDoNothing();
  } catch (e) {
    console.error("[notify] failed:", e instanceof Error ? e.message : e);
  }
}

/**
 * Check which badges a user has earned and notify about any they haven't been
 * congratulated for yet (deduped per badge). Call after actions that can cross
 * a badge threshold: logging a catch, creating a crew, adding gear, forum
 * activity, completing a trip, or an admin grant.
 */
export async function notifyBadges(db: Db, userId: string): Promise<void> {
  try {
    const earned = await earnedBadges(db, userId);
    for (const b of earned) {
      await notify(db, {
        userId,
        type: "badge",
        title: `Badge earned: ${b.name}`,
        body: b.blurb,
        href: await profileHref(db, userId),
        image: `/badges/${b.slug}.png`,
        dedupeKey: `badge:${b.slug}`,
      });
    }
  } catch (e) {
    console.error("[notifyBadges] failed:", e instanceof Error ? e.message : e);
  }
}

async function profileHref(db: Db, userId: string): Promise<string> {
  const { profiles } = await import("@/db");
  const p = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  return p ? `/u/${p.username}` : "/home";
}
