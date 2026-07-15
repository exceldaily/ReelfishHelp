"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, userBadges } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { badgeBySlug } from "@/data/badges";

/**
 * Admin-only: grant or revoke a stored badge for a user. Revoking only removes
 * the stored grant — badges earned automatically from activity (derived) keep
 * showing as long as the user still qualifies.
 */
export async function setBadge(input: {
  userId: string;
  slug: string;
  grant: boolean;
}): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  if (!badgeBySlug(input.slug)) return { error: "Unknown badge." };
  if (!input.userId) return { error: "Missing user." };
  const db = await getDb();
  if (input.grant) {
    await db
      .insert(userBadges)
      .values({ userId: input.userId, badgeSlug: input.slug })
      .onConflictDoNothing();
  } else {
    await db
      .delete(userBadges)
      .where(and(eq(userBadges.userId, input.userId), eq(userBadges.badgeSlug, input.slug)));
  }
  revalidatePath("/admin/users");
  return { ok: true };
}
