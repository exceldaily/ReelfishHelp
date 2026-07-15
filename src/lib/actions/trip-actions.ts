"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, trips, type ChecklistItem, type Visibility } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { notifyBadges } from "@/lib/notify";
import { approximate } from "@/lib/geo";

export type TripFormResult = { error?: string } | undefined;

function parseChecklist(raw: string): ChecklistItem[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((text) => ({ text: text.slice(0, 120), done: false }));
}

export async function createTrip(_prev: TripFormResult, formData: FormData): Promise<TripFormResult> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  if (!title) return { error: "Give the trip a name." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Pick a date." };

  const lat = parseFloat(String(formData.get("lat") ?? ""));
  const lng = parseFloat(String(formData.get("lng") ?? ""));
  const coords = !Number.isNaN(lat) && !Number.isNaN(lng) ? approximate(lat, lng) : null;
  const visibility = String(formData.get("visibility") ?? "private") as Visibility;

  const db = await getDb();
  const [row] = await db
    .insert(trips)
    .values({
      userId: user.id,
      title: title.slice(0, 120),
      date,
      time: String(formData.get("time") ?? "") || null,
      spotId: String(formData.get("spotId") ?? "") || null,
      locationLabel: String(formData.get("locationLabel") ?? "").slice(0, 120) || null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      targetSpeciesIds: formData.getAll("targetSpecies").map(String).slice(0, 8),
      gearChecklist: parseChecklist(String(formData.get("gearChecklist") ?? "")),
      baitChecklist: parseChecklist(String(formData.get("baitChecklist") ?? "")),
      notes: String(formData.get("notes") ?? "").slice(0, 3000) || null,
      visibility: ["public", "followers", "private"].includes(visibility) ? visibility : "private",
    })
    .returning();

  revalidatePath("/trips");
  redirect(`/trips/${row.id}`);
}

export async function toggleChecklistItem(
  tripId: string,
  list: "gearChecklist" | "baitChecklist",
  index: number
) {
  const user = await requireUser();
  const db = await getDb();
  const trip = await db.query.trips.findFirst({
    where: and(eq(trips.id, tripId), eq(trips.userId, user.id)),
  });
  if (!trip) return { error: "Not found" };
  const items = [...trip[list]];
  if (!items[index]) return { error: "Item not found" };
  items[index] = { ...items[index], done: !items[index].done };
  await db.update(trips).set({ [list]: items }).where(eq(trips.id, tripId));
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function setTripStatus(tripId: string, status: "planned" | "completed") {
  const user = await requireUser();
  const db = await getDb();
  await db
    .update(trips)
    .set({ status })
    .where(and(eq(trips.id, tripId), eq(trips.userId, user.id)));
  if (status === "completed") await notifyBadges(db, user.id); // tournament-ready check
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/trips");
  return { ok: true };
}

export async function deleteTrip(tripId: string) {
  const user = await requireUser();
  const db = await getDb();
  await db.delete(trips).where(and(eq(trips.id, tripId), eq(trips.userId, user.id)));
  revalidatePath("/trips");
  redirect("/trips");
}
