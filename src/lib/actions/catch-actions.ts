"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getDb,
  catches,
  catchPhotos,
  likes,
  comments,
  savedPosts,
  reports,
  type Visibility,
} from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { storeImage } from "@/lib/storage";
import { approximate } from "@/lib/geo";

export type CatchFormResult = { error?: string } | undefined;

export async function createCatch(_prev: CatchFormResult, formData: FormData): Promise<CatchFormResult> {
  const user = await requireUser();
  const db = await getDb();

  const speciesId = String(formData.get("speciesId") ?? "") || null;
  const customSpeciesName = String(formData.get("customSpeciesName") ?? "").trim() || null;
  if (!speciesId && !customSpeciesName) {
    return { error: "Pick a species (or type a custom one)." };
  }

  const caughtAtRaw = String(formData.get("caughtAt") ?? "");
  const caughtAt = caughtAtRaw ? new Date(caughtAtRaw) : new Date();
  if (Number.isNaN(caughtAt.getTime())) return { error: "Invalid date/time." };

  const num = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    if (!v) return null;
    const n = parseFloat(v);
    return Number.isNaN(n) || n < 0 || n > 10000 ? null : n;
  };

  // location is always approximated before storage
  const latRaw = num("lat");
  const lngRaw = num("lng");
  const coords = latRaw != null && lngRaw != null ? approximate(latRaw, lngRaw) : null;

  const visibility = (String(formData.get("visibility") ?? "private") as Visibility) || "private";

  const [row] = await db
    .insert(catches)
    .values({
      userId: user.id,
      speciesId,
      customSpeciesName,
      caughtAt,
      waterType: String(formData.get("waterType") ?? "") || null,
      method: String(formData.get("method") ?? "") || null,
      lengthIn: num("lengthIn"),
      weightLb: num("weightLb"),
      bait: String(formData.get("bait") ?? "").slice(0, 200) || null,
      gearNotes: String(formData.get("gearNotes") ?? "").slice(0, 400) || null,
      weatherNotes: String(formData.get("weatherNotes") ?? "").slice(0, 400) || null,
      tideNotes: String(formData.get("tideNotes") ?? "").slice(0, 400) || null,
      story: String(formData.get("story") ?? "").slice(0, 3000) || null,
      released: formData.get("released") === "on" || formData.get("released") === "true",
      visibility: ["public", "followers", "private"].includes(visibility) ? visibility : "private",
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      locationLabel: String(formData.get("locationLabel") ?? "").slice(0, 120) || null,
      showLocation: formData.get("showLocation") === "on",
      tripId: String(formData.get("tripId") ?? "") || null,
    })
    .returning();

  // photos: uploaded files + optional pre-stored URL (from fish ID)
  const photoUrls: string[] = [];
  const existingPhoto = String(formData.get("existingPhotoUrl") ?? "");
  if (existingPhoto.startsWith("/api/uploads/") || existingPhoto.startsWith("https://")) {
    photoUrls.push(existingPhoto);
  }
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  for (const f of files.slice(0, 6)) {
    try {
      photoUrls.push(await storeImage(f, "catches"));
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Photo upload failed" };
    }
  }
  if (photoUrls.length > 0) {
    await db.insert(catchPhotos).values(photoUrls.map((url, i) => ({ catchId: row.id, url, position: i })));
  }

  revalidatePath("/catches");
  revalidatePath("/community");
  revalidatePath("/home");
  redirect(`/catch/${row.id}`);
}

export async function deleteCatch(catchId: string) {
  const user = await requireUser();
  const db = await getDb();
  await db.delete(catches).where(and(eq(catches.id, catchId), eq(catches.userId, user.id)));
  revalidatePath("/catches");
  revalidatePath("/community");
  redirect("/catches");
}

export async function toggleLike(catchId: string) {
  const user = await requireUser();
  const db = await getDb();
  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.userId, user.id), eq(likes.catchId, catchId)),
  });
  if (existing) {
    await db.delete(likes).where(and(eq(likes.userId, user.id), eq(likes.catchId, catchId)));
  } else {
    await db.insert(likes).values({ userId: user.id, catchId });
  }
  revalidatePath(`/catch/${catchId}`);
  revalidatePath("/community");
  return { liked: !existing };
}

export async function toggleSavePost(catchId: string) {
  const user = await requireUser();
  const db = await getDb();
  const existing = await db.query.savedPosts.findFirst({
    where: and(eq(savedPosts.userId, user.id), eq(savedPosts.catchId, catchId)),
  });
  if (existing) {
    await db.delete(savedPosts).where(and(eq(savedPosts.userId, user.id), eq(savedPosts.catchId, catchId)));
  } else {
    await db.insert(savedPosts).values({ userId: user.id, catchId });
  }
  revalidatePath(`/catch/${catchId}`);
  return { saved: !existing };
}

export async function addComment(catchId: string, body: string) {
  const user = await requireUser();
  const text = body.trim().slice(0, 1000);
  if (!text) return { error: "Comment can't be empty" };
  const db = await getDb();
  await db.insert(comments).values({ catchId, userId: user.id, body: text });
  revalidatePath(`/catch/${catchId}`);
  return { ok: true };
}

export async function deleteComment(commentId: string, catchId: string) {
  const user = await requireUser();
  const db = await getDb();
  const c = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
  if (!c) return { error: "Not found" };
  // author of comment, owner of catch, or admin may delete
  const parent = await db.query.catches.findFirst({ where: eq(catches.id, catchId) });
  if (c.userId !== user.id && parent?.userId !== user.id && user.role !== "admin") {
    return { error: "Not allowed" };
  }
  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath(`/catch/${catchId}`);
  return { ok: true };
}

export async function reportContent(input: {
  targetType: "catch" | "comment" | "profile" | "spot" | "message";
  targetId: string;
  reason: string;
  details?: string;
}) {
  const user = await requireUser();
  if (!input.reason.trim()) return { error: "Pick a reason" };
  const db = await getDb();
  await db.insert(reports).values({
    reporterId: user.id,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason.slice(0, 100),
    details: input.details?.slice(0, 1000) ?? null,
  });
  return { ok: true };
}
