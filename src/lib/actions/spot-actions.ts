"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, spots, type SpotPrivacy } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { storeImage } from "@/lib/storage";
import { approximate } from "@/lib/geo";

const PRIVACY_LEVELS: SpotPrivacy[] = ["private_exact", "private_area", "shared_area", "public_broad"];

export type SpotFormResult = { error?: string; ok?: boolean } | undefined;

export async function createSpot(_prev: SpotFormResult, formData: FormData): Promise<SpotFormResult> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name the spot." };

  const privacy = String(formData.get("privacy") ?? "private_exact") as SpotPrivacy;
  const lat = parseFloat(String(formData.get("lat") ?? ""));
  const lng = parseFloat(String(formData.get("lng") ?? ""));
  let coords: { lat: number; lng: number } | null =
    !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : null;

  // Exact coordinates are stored ONLY for private_exact spots.
  // Every other level rounds to ~1km before it touches the database.
  if (coords && privacy !== "private_exact") coords = approximate(coords.lat, coords.lng);

  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoUrl = await storeImage(photo, "spots");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Photo upload failed" };
    }
  }

  const text = (name_: string, max = 1000) => String(formData.get(name_) ?? "").slice(0, max) || null;

  const db = await getDb();
  await db.insert(spots).values({
    userId: user.id,
    name: name.slice(0, 120),
    privacy: PRIVACY_LEVELS.includes(privacy) ? privacy : "private_exact",
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    areaLabel: text("areaLabel", 120),
    waterType: text("waterType", 60),
    speciesNotes: text("speciesNotes"),
    accessNotes: text("accessNotes"),
    structureNotes: text("structureNotes"),
    tideSeasonNotes: text("tideSeasonNotes"),
    safetyParkingNotes: text("safetyParkingNotes"),
    baitTechniqueNotes: text("baitTechniqueNotes"),
    photoUrl,
  });
  revalidatePath("/spots");
  return { ok: true };
}

export async function deleteSpot(id: string) {
  const user = await requireUser();
  const db = await getDb();
  await db.delete(spots).where(and(eq(spots.id, id), eq(spots.userId, user.id)));
  revalidatePath("/spots");
}

export async function toggleSpotFavorite(id: string) {
  const user = await requireUser();
  const db = await getDb();
  const s = await db.query.spots.findFirst({ where: and(eq(spots.id, id), eq(spots.userId, user.id)) });
  if (!s) return { error: "Not found" };
  await db.update(spots).set({ favorite: !s.favorite }).where(eq(spots.id, id));
  revalidatePath("/spots");
  return { ok: true };
}
