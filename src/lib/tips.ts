import { asc, eq } from "drizzle-orm";
import { anglerTips, savedTips, tipHelpful, type AnglerTip, type Db } from "@/db";
import { and } from "drizzle-orm";

/** Site-wide "today" for tip rotation: the UTC calendar date. */
export function utcToday(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Deterministic daily pick. A tip scheduled for exactly `today` wins; otherwise
 * the active, unscheduled, unexpired pool rotates by day index so every visitor
 * sees the same tip all day and the next tip at midnight UTC. Pure — unit
 * tested in tests/tips-rotation.test.ts.
 */
export function pickDailyTip(
  tips: Pick<AnglerTip, "id" | "isActive" | "publishDate" | "expirationDate" | "displayOrder" | "createdAt">[],
  today: string
): string | null {
  const live = tips.filter(
    (t) => t.isActive && (!t.expirationDate || t.expirationDate >= today)
  );
  const scheduled = live.find((t) => t.publishDate === today);
  if (scheduled) return scheduled.id;

  const pool = live
    .filter((t) => !t.publishDate)
    .sort(
      (a, b) =>
        a.displayOrder - b.displayOrder ||
        a.createdAt.getTime() - b.createdAt.getTime() ||
        a.id.localeCompare(b.id)
    );
  if (pool.length === 0) return null;

  const dayIndex = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86_400_000);
  return pool[dayIndex % pool.length].id;
}

export type DailyTip = AnglerTip & { viewerHelpful: boolean; viewerSaved: boolean };

/** Fetch today's tip plus the signed-in viewer's helpful/saved state. */
export async function getDailyTip(db: Db, viewerId: string | null): Promise<DailyTip | null> {
  const today = utcToday();
  const all = await db.query.anglerTips.findMany({
    where: eq(anglerTips.isActive, true),
    orderBy: [asc(anglerTips.displayOrder)],
  });
  const id = pickDailyTip(all, today);
  if (!id) return null;
  const tip = all.find((t) => t.id === id)!;

  let viewerHelpful = false;
  let viewerSaved = false;
  if (viewerId) {
    const [h, s] = await Promise.all([
      db.query.tipHelpful.findFirst({
        where: and(eq(tipHelpful.userId, viewerId), eq(tipHelpful.tipId, id)),
      }),
      db.query.savedTips.findFirst({
        where: and(eq(savedTips.userId, viewerId), eq(savedTips.tipId, id)),
      }),
    ]);
    viewerHelpful = !!h;
    viewerSaved = !!s;
  }
  return { ...tip, viewerHelpful, viewerSaved };
}

/** Category list for filters and the admin editor. Extend freely. */
export const TIP_CATEGORIES = [
  "Beginner",
  "Finding Fish",
  "Fighting Fish",
  "Bass",
  "Saltwater",
  "Freshwater",
  "Offshore",
  "Inshore",
  "Kayak Fishing",
  "Fly Fishing",
  "Gear",
  "Knots",
  "Bait",
  "Lures",
  "Weather",
  "Safety",
  "Conservation",
  "Catch Handling",
  "Boat Fishing",
  "Shore Fishing",
] as const;
