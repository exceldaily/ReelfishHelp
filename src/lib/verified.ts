import { and, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { userVerifiedTitles, verifiedUserReports } from "@/db/schema";
import { VERIFIED_TITLE_SLUGS, type VerifiedTitleSlug } from "@/data/verified-titles";

/**
 * Read helpers for verified titles. Feeds call verifiedTitleMap once per page
 * with every author id, so badges cost a single query per list.
 */
export async function activeTitlesFor(db: Db, userId: string): Promise<VerifiedTitleSlug[]> {
  const rows = await db.query.userVerifiedTitles.findMany({
    where: and(eq(userVerifiedTitles.userId, userId), eq(userVerifiedTitles.status, "active")),
  });
  return sortByCatalog(rows.map((r) => r.titleSlug as VerifiedTitleSlug));
}

export async function verifiedTitleMap(db: Db, userIds: string[]): Promise<Map<string, VerifiedTitleSlug[]>> {
  const map = new Map<string, VerifiedTitleSlug[]>();
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return map;
  const rows = await db.query.userVerifiedTitles.findMany({
    where: and(inArray(userVerifiedTitles.userId, ids), eq(userVerifiedTitles.status, "active")),
  });
  for (const r of rows) {
    const list = map.get(r.userId) ?? [];
    list.push(r.titleSlug as VerifiedTitleSlug);
    map.set(r.userId, list);
  }
  for (const [k, v] of map) map.set(k, sortByCatalog(v));
  return map;
}

function sortByCatalog(slugs: VerifiedTitleSlug[]): VerifiedTitleSlug[] {
  return [...slugs].sort((a, b) => VERIFIED_TITLE_SLUGS.indexOf(a) - VERIFIED_TITLE_SLUGS.indexOf(b));
}

/** The single most prominent title to show where space is tight. */
export function primaryTitle(slugs: VerifiedTitleSlug[] | undefined): VerifiedTitleSlug | null {
  return slugs && slugs.length > 0 ? slugs[0] : null;
}

/** Latest visible verified reports for feeds (boards, species, home, profile). */
export async function latestVerifiedReports(
  db: Db,
  opts: { boardId?: string; speciesId?: string; userId?: string; limit?: number }
) {
  const conds = [eq(verifiedUserReports.moderationStatus, "visible" as const), eq(verifiedUserReports.visibility, "public" as const)];
  if (opts.boardId) conds.push(eq(verifiedUserReports.boardId, opts.boardId));
  if (opts.speciesId) conds.push(eq(verifiedUserReports.speciesId, opts.speciesId));
  if (opts.userId) conds.push(eq(verifiedUserReports.userId, opts.userId));
  return db.query.verifiedUserReports.findMany({
    where: and(...conds),
    orderBy: [desc(verifiedUserReports.createdAt)],
    limit: opts.limit ?? 5,
    with: { user: { with: { profile: true } }, board: true, species: true },
  });
}
