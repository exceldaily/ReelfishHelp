import { and, eq, inArray } from "drizzle-orm";
import { getDb, profiles, follows, type Profile } from "@/db";

export type PersonListItem = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  waterPref: string;
  homeState: string | null;
  viewerFollows: boolean;
};

export type ConnectionsResult =
  | { status: "not_found" }
  | { status: "private"; profile: Profile }
  | { status: "gated"; profile: Profile }
  | { status: "ok"; profile: Profile; isOwner: boolean; people: PersonListItem[] };

/**
 * Loads a profile's followers or following list, applying the same visibility
 * gating as the profile page and never exposing private accounts' usernames.
 */
export async function loadConnections(
  username: string,
  tab: "followers" | "following",
  viewerId: string | null
): Promise<ConnectionsResult> {
  const db = await getDb();
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.username, username.toLowerCase()) });
  if (!profile) return { status: "not_found" };

  const isOwner = viewerId === profile.userId;
  const isFollowing = viewerId
    ? !!(await db.query.follows.findFirst({
        where: and(eq(follows.followerId, viewerId), eq(follows.followingId, profile.userId)),
      }))
    : false;

  if (!isOwner && profile.visibility === "private") return { status: "private", profile };
  if (!isOwner && profile.visibility === "followers" && !isFollowing) return { status: "gated", profile };

  // followers = people following this profile; following = people this profile follows
  const rel =
    tab === "followers"
      ? await db.query.follows.findMany({ where: eq(follows.followingId, profile.userId) })
      : await db.query.follows.findMany({ where: eq(follows.followerId, profile.userId) });
  const ids = rel.map((r) => (tab === "followers" ? r.followerId : r.followingId));

  let people: PersonListItem[] = [];
  if (ids.length > 0) {
    const rows = await db.query.profiles.findMany({ where: inArray(profiles.userId, ids) });
    const viewerFollowing = viewerId
      ? new Set(
          (await db.query.follows.findMany({ where: eq(follows.followerId, viewerId) })).map((f) => f.followingId)
        )
      : new Set<string>();
    people = rows
      // don't leak private accounts (they're unsearchable) unless it's the viewer themselves
      .filter((p) => p.visibility !== "private" || p.userId === viewerId)
      .map((p) => ({
        userId: p.userId,
        username: p.username,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        waterPref: p.waterPref,
        homeState: p.homeState,
        viewerFollows: viewerFollowing.has(p.userId),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  return { status: "ok", profile, isOwner, people };
}
