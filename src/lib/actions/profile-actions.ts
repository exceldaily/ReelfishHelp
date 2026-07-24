"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, profiles, type LocationMode, type Visibility, type WaterPref } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { approximate, reverseGeocode } from "@/lib/geo";
import { storeMediaUrl } from "@/lib/media";
import { isRegion, type Region } from "@/lib/regions";

/** Switch the user's app region (USA vs Southeast Asia). Reversible anytime. */
export async function setRegion(region: Region): Promise<{ ok: true } | { error: string }> {
  if (!isRegion(region)) return { error: "Unknown region" };
  const user = await requireUser();
  const db = await getDb();
  await db.update(profiles).set({ region }).where(eq(profiles.userId, user.id));
  revalidatePath("/home");
  revalidatePath("/fish");
  revalidatePath("/conditions");
  revalidatePath("/settings");
  return { ok: true };
}

/** Stores the user's location — always rounded to ~1km before it touches the database. */
export async function saveLocation(input: {
  lat: number;
  lng: number;
  mode: LocationMode;
}): Promise<{ label: string } | { error: string }> {
  const user = await requireUser();
  const parsed = z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .safeParse(input);
  if (!parsed.success) return { error: "Invalid coordinates" };

  const { lat, lng } = approximate(input.lat, input.lng);
  const place = await reverseGeocode(lat, lng);
  const db = await getDb();
  await db
    .update(profiles)
    .set({
      lastLat: lat,
      lastLng: lng,
      lastLocationLabel: place.label,
      locationMode: input.mode,
      manualState: place.state ?? undefined,
    })
    .where(eq(profiles.userId, user.id));
  revalidatePath("/home");
  revalidatePath("/conditions");
  return { label: place.label };
}

export async function saveManualLocation(input: {
  state: string;
  region?: string;
  lat?: number;
  lng?: number;
  label?: string;
}) {
  const user = await requireUser();
  const db = await getDb();
  const coords =
    input.lat != null && input.lng != null ? approximate(input.lat, input.lng) : null;
  await db
    .update(profiles)
    .set({
      manualState: input.state,
      manualRegion: input.region ?? null,
      lastLat: coords?.lat ?? null,
      lastLng: coords?.lng ?? null,
      lastLocationLabel: input.label ?? input.state,
      locationMode: "off",
    })
    .where(eq(profiles.userId, user.id));
  revalidatePath("/home");
  return { ok: true };
}

const onboardingSchema = z.object({
  region: z.enum(["us", "sea"]),
  waterPref: z.enum(["freshwater", "saltwater", "both"]),
  experience: z.enum(["new", "casual", "regular", "serious"]),
  fishingStyles: z.array(z.string()).max(10),
  homeState: z.string().max(2).nullable(),
});

export async function completeOnboarding(input: {
  region: Region;
  waterPref: WaterPref;
  experience: "new" | "casual" | "regular" | "serious";
  fishingStyles: string[];
  homeState: string | null;
}) {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid selections" };
  const db = await getDb();
  await db
    .update(profiles)
    .set({ ...parsed.data, onboarded: true })
    .where(eq(profiles.userId, user.id));
  revalidatePath("/home");
  return { ok: true };
}

export async function updateProfile(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireUser();
  const db = await getDb();

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) return { error: "Display name is required" };
  const bio = String(formData.get("bio") ?? "").slice(0, 500);
  const regionRaw = String(formData.get("region") ?? "us");
  const region: Region = isRegion(regionRaw) ? regionRaw : "us";
  const homeState = String(formData.get("homeState") ?? "") || null;
  const waterPref = String(formData.get("waterPref") ?? "both") as WaterPref;
  const experience = String(formData.get("experience") ?? "casual") as
    | "new" | "casual" | "regular" | "serious";
  const visibility = String(formData.get("visibility") ?? "public") as Visibility;
  const locationMode = String(formData.get("locationMode") ?? "approximate") as LocationMode;
  const fishingStyles = formData.getAll("fishingStyles").map(String).slice(0, 10);
  const favoriteSpecies = formData.getAll("favoriteSpecies").map(String).slice(0, 12);
  // comma-separated brands per category, up to 4 each
  const brands = (k: string) => {
    const list = String(formData.get(k) ?? "")
      .split(",")
      .map((s) => s.trim().slice(0, 40))
      .filter(Boolean)
      .slice(0, 4);
    return list.length > 0 ? list : undefined;
  };
  const favoriteBrands = {
    rods: brands("brandRods"),
    reels: brands("brandReels"),
    lures: brands("brandLures"),
    clothes: brands("brandClothes"),
  };

  let avatarUrl: string | undefined;
  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    try {
      avatarUrl = await storeMediaUrl({
        file: avatar,
        ownerId: user.id,
        kind: "profile",
        relatedId: user.id,
        visibility: "public",
      });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Avatar upload failed" };
    }
  }

  await db
    .update(profiles)
    .set({
      displayName,
      bio,
      region,
      homeState,
      waterPref,
      experience,
      visibility,
      locationMode,
      fishingStyles,
      favoriteSpecies,
      favoriteBrands,
      ...(avatarUrl ? { avatarUrl } : {}),
    })
    .where(eq(profiles.userId, user.id));
  revalidatePath("/settings");
  revalidatePath("/home");
  revalidatePath("/fish");
  revalidatePath("/conditions");
  return { ok: true };
}
