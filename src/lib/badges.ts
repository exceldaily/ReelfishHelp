import { count, eq } from "drizzle-orm";
import {
  crews,
  forumAnswers,
  forumQuestions,
  gearItems,
  likes,
  catches,
  trips,
  userBadges,
  type Db,
} from "@/db";
import { and } from "drizzle-orm";
import { BADGES, type BadgeDef } from "@/data/badges";

/**
 * All badges a user has earned: stored grants (user_badges rows) plus badges
 * derived from live activity. Returned in catalog sort order, ready to render.
 */
export async function earnedBadges(
  db: Db,
  userId: string,
  precomputed?: { catchCount?: number; likesReceived?: number }
): Promise<BadgeDef[]> {
  const [grantRows, [crewRow], [qRow], [aRow], [acceptedRow], [gearRow], [tripRow]] =
    await Promise.all([
      db.query.userBadges.findMany({ where: eq(userBadges.userId, userId) }),
      db.select({ n: count() }).from(crews).where(eq(crews.ownerId, userId)),
      db.select({ n: count() }).from(forumQuestions).where(eq(forumQuestions.userId, userId)),
      db.select({ n: count() }).from(forumAnswers).where(eq(forumAnswers.userId, userId)),
      db
        .select({ n: count() })
        .from(forumAnswers)
        .where(and(eq(forumAnswers.userId, userId), eq(forumAnswers.accepted, true))),
      db.select({ n: count() }).from(gearItems).where(eq(gearItems.userId, userId)),
      db
        .select({ n: count() })
        .from(trips)
        .where(and(eq(trips.userId, userId), eq(trips.status, "completed"))),
    ]);

  let catchCount = precomputed?.catchCount;
  if (catchCount === undefined) {
    const [row] = await db.select({ n: count() }).from(catches).where(eq(catches.userId, userId));
    catchCount = Number(row.n);
  }
  let likesReceived = precomputed?.likesReceived;
  if (likesReceived === undefined) {
    const [row] = await db
      .select({ n: count() })
      .from(likes)
      .innerJoin(catches, eq(likes.catchId, catches.id))
      .where(eq(catches.userId, userId));
    likesReceived = Number(row.n);
  }

  const derived = new Set<string>();
  if (catchCount >= 1) derived.add("first-catch");
  if (catchCount >= 20) derived.add("catch-master");
  if (Number(crewRow.n) >= 1) derived.add("crew-captain");
  if (Number(qRow.n) + Number(aRow.n) >= 15) derived.add("top-contributor");
  if (Number(acceptedRow.n) >= 3) derived.add("helpful-angler");
  if (Number(gearRow.n) >= 8) derived.add("gear-guru");
  if (Number(tripRow.n) >= 3) derived.add("tournament-ready");
  if (likesReceived >= 25) derived.add("community-star");

  const granted = new Set(grantRows.map((g) => g.badgeSlug));
  return BADGES.filter((b) => granted.has(b.slug) || derived.has(b.slug)).sort(
    (a, b) => a.sort - b.sort
  );
}
