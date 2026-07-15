"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, follows, profiles } from "@/db";
import { notify } from "@/lib/notify";
import { requireUser } from "@/lib/auth-helpers";

export async function toggleFollow(targetUserId: string) {
  const user = await requireUser();
  if (targetUserId === user.id) return { error: "You can't follow yourself" };
  const db = await getDb();
  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, user.id), eq(follows.followingId, targetUserId)),
  });
  if (existing) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, user.id), eq(follows.followingId, targetUserId)));
  } else {
    await db.insert(follows).values({ followerId: user.id, followingId: targetUserId });
    const p = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });
    await notify(db, {
      userId: targetUserId,
      type: "follow",
      title: `${p?.displayName ?? "An angler"} followed you`,
      href: p ? `/u/${p.username}` : undefined,
    });
  }
  revalidatePath("/community");
  return { following: !existing };
}
