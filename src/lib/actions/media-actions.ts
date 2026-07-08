"use server";

import { eq, like, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, mediaAssets, catchPhotos, profiles, gearItems, spots } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { deleteMedia } from "@/lib/media";

/**
 * User-initiated photo delete. Soft-deletes the media asset (freeing storage
 * quota immediately; the nightly cleanup job purges the R2 objects after the
 * recovery window) and scrubs any references so no broken images remain.
 */
export async function deletePhoto(assetId: string): Promise<{ ok?: boolean; error?: string }> {
  const user = await requireUser();
  const db = await getDb();

  const asset = await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, assetId) });
  if (!asset) return { error: "Photo not found" };
  if (asset.ownerId !== user.id && user.role !== "admin") return { error: "Not allowed" };

  await deleteMedia(assetId, user.id, user.role === "admin");

  // scrub any stored references to this asset's delivery URLs
  const ref = `%/api/media/${assetId}/%`;
  await db.delete(catchPhotos).where(like(catchPhotos.url, ref));
  await db.update(profiles).set({ avatarUrl: null }).where(and(eq(profiles.userId, asset.ownerId), like(profiles.avatarUrl, ref)));
  await db.update(gearItems).set({ photoUrl: null }).where(like(gearItems.photoUrl, ref));
  await db.update(spots).set({ photoUrl: null }).where(like(spots.photoUrl, ref));

  revalidatePath("/settings/photos");
  revalidatePath("/catches");
  revalidatePath("/community");
  return { ok: true };
}
