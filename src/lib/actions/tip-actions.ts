"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, anglerTips, savedTips, tipHelpful } from "@/db";
import { currentUser, requireUser } from "@/lib/auth-helpers";

/** Toggle the viewer's helpful reaction. One per user per tip (PK-enforced). */
export async function toggleTipHelpful(
  tipId: string
): Promise<{ helpful: boolean; count: number } | { signIn: true }> {
  const user = await currentUser();
  if (!user) return { signIn: true };
  const db = await getDb();

  const existing = await db.query.tipHelpful.findFirst({
    where: and(eq(tipHelpful.userId, user.id), eq(tipHelpful.tipId, tipId)),
  });
  if (existing) {
    await db
      .delete(tipHelpful)
      .where(and(eq(tipHelpful.userId, user.id), eq(tipHelpful.tipId, tipId)));
    await db
      .update(anglerTips)
      .set({ helpfulCount: sql`greatest(${anglerTips.helpfulCount} - 1, 0)` })
      .where(eq(anglerTips.id, tipId));
  } else {
    const inserted = await db
      .insert(tipHelpful)
      .values({ userId: user.id, tipId })
      .onConflictDoNothing()
      .returning();
    if (inserted.length > 0) {
      await db
        .update(anglerTips)
        .set({ helpfulCount: sql`${anglerTips.helpfulCount} + 1` })
        .where(eq(anglerTips.id, tipId));
    }
  }
  const tip = await db.query.anglerTips.findFirst({ where: eq(anglerTips.id, tipId) });
  revalidatePath("/home");
  revalidatePath("/tips");
  return { helpful: !existing, count: tip?.helpfulCount ?? 0 };
}

/** Toggle a saved tip (mirrors savedGuides/savedPosts). */
export async function toggleSavedTip(
  tipId: string
): Promise<{ saved: boolean } | { signIn: true }> {
  const user = await currentUser();
  if (!user) return { signIn: true };
  const db = await getDb();

  const existing = await db.query.savedTips.findFirst({
    where: and(eq(savedTips.userId, user.id), eq(savedTips.tipId, tipId)),
  });
  if (existing) {
    await db
      .delete(savedTips)
      .where(and(eq(savedTips.userId, user.id), eq(savedTips.tipId, tipId)));
    await db
      .update(anglerTips)
      .set({ saveCount: sql`greatest(${anglerTips.saveCount} - 1, 0)` })
      .where(eq(anglerTips.id, tipId));
  } else {
    const inserted = await db
      .insert(savedTips)
      .values({ userId: user.id, tipId })
      .onConflictDoNothing()
      .returning();
    if (inserted.length > 0) {
      await db
        .update(anglerTips)
        .set({ saveCount: sql`${anglerTips.saveCount} + 1` })
        .where(eq(anglerTips.id, tipId));
    }
  }
  revalidatePath("/home");
  revalidatePath("/tips");
  return { saved: !existing };
}

/** Count a share (no auth required; no personal data stored). */
export async function recordTipShare(tipId: string): Promise<void> {
  const db = await getDb();
  await db
    .update(anglerTips)
    .set({ shareCount: sql`${anglerTips.shareCount} + 1` })
    .where(eq(anglerTips.id, tipId));
}

/** Signed-in helper used by the profile "saved tips" pill. */
export async function savedTipCount(): Promise<number> {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db.query.savedTips.findMany({ where: eq(savedTips.userId, user.id) });
  return rows.length;
}
