"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, mediaAssets, users } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { purgeMedia } from "@/lib/media";
import { signOut } from "@/auth";

export type DeleteAccountResult = { error?: string } | undefined;

/**
 * Permanently deletes the signed-in user's account. Storage objects (R2/Blob)
 * are purged first so nothing orphans, then the users row is deleted — the
 * schema cascades take profile, catches, gear, spots, trips, forum posts,
 * messages, crews they own, badges, and notifications with it.
 */
export async function deleteAccount(
  _prev: DeleteAccountResult,
  formData: FormData
): Promise<DeleteAccountResult> {
  const user = await requireUser();
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "DELETE") {
    return { error: 'Type DELETE (all caps) to confirm.' };
  }

  const db = await getDb();

  // purge stored photos from the storage backend before the rows disappear
  const assets = await db.query.mediaAssets.findMany({
    where: eq(mediaAssets.ownerId, user.id),
  });
  for (const a of assets) {
    try {
      await purgeMedia(a);
    } catch (e) {
      // an unreachable object must not block the deletion; cleanup cron sweeps strays
      console.error("[deleteAccount] purge failed for asset", a.id, e instanceof Error ? e.message : e);
    }
  }

  await db.delete(users).where(eq(users.id, user.id));
  console.log("[deleteAccount] account deleted", { userId: user.id });

  await signOut({ redirect: false });
  redirect("/");
}
