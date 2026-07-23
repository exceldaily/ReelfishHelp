"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { gearSetups, gearItems, trips, userSetups, type ChecklistItem, type Visibility } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

/** Add a published gear setup's rod/reel/line to the user's gear locker (wishlist). */
export async function saveSetupToGear(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const slug = String(formData.get("setupSlug") ?? "");
  const setup = await db.query.gearSetups.findFirst({ where: eq(gearSetups.slug, slug) });
  if (!setup) return;
  const items = [
    { category: "rod", name: setup.rod },
    { category: "reel", name: setup.reel },
    { category: "line", name: setup.mainLine },
    { category: "leader", name: setup.leader },
  ];
  for (const it of items) {
    await db.insert(gearItems).values({
      userId: user.id,
      category: it.category,
      name: it.name.slice(0, 200),
      notes: `From setup: ${setup.name}`,
      wishlist: true,
      condition: "new",
    });
  }
  revalidatePath("/my-gear");
  redirect("/my-gear");
}

/** Append a setup's components to a trip's gear checklist. */
export async function saveSetupToTrip(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const slug = String(formData.get("setupSlug") ?? "");
  const tripId = String(formData.get("tripId") ?? "");
  const setup = await db.query.gearSetups.findFirst({ where: eq(gearSetups.slug, slug) });
  const trip = await db.query.trips.findFirst({ where: and(eq(trips.id, tripId), eq(trips.userId, user.id)) });
  if (!setup || !trip) return;
  const add: ChecklistItem[] = [
    { text: `Rod: ${setup.rod}`, done: false },
    { text: `Reel: ${setup.reel}`, done: false },
    { text: `Line: ${setup.mainLine}`, done: false },
    { text: `Leader: ${setup.leader}`, done: false },
    { text: `Rig/lure: ${setup.lureBait}`, done: false },
  ];
  await db.update(trips).set({ gearChecklist: [...trip.gearChecklist, ...add] }).where(eq(trips.id, tripId));
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

/** Persist a Setup Builder result as a saved user setup. */
export async function saveUserSetup(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const g = (k: string) => {
    const v = formData.get(k);
    return v == null || v === "" ? null : String(v);
  };
  const num = (k: string) => {
    const v = g(k);
    return v == null ? null : Number(v);
  };
  const name = (g("name") ?? "My setup").slice(0, 80);
  const vis = (g("visibility") ?? "private") as Visibility;
  await db.insert(userSetups).values({
    ownerId: user.id,
    name,
    fishingType: g("fishingType"),
    water: g("water"),
    rod: { type: g("rodType"), power: g("rodPower") },
    reel: { type: g("reelType"), size: num("reelSize") },
    line: { type: g("lineType"), lb: num("lineLb") },
    leader: { type: g("leaderType"), lb: num("leaderLb") },
    terminal: { hook: g("hook") },
    baitLure: { detail: g("baitLure") },
    method: g("method"),
    notes: g("notes"),
    visibility: vis === "public" || vis === "followers" ? vis : "private",
  });
  revalidatePath("/gear/builder");
  redirect("/gear/builder?saved=1");
}

/** Mark a saved setup as the caller's one go-to setup (or unmark it). */
export async function toggleFavoriteSetup(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const id = String(formData.get("id") ?? "");
  const setup = await db.query.userSetups.findFirst({
    where: and(eq(userSetups.id, id), eq(userSetups.ownerId, user.id)),
  });
  if (!setup) return;
  // only one go-to setup at a time
  await db.update(userSetups).set({ favorite: false }).where(eq(userSetups.ownerId, user.id));
  if (!setup.favorite) {
    await db.update(userSetups).set({ favorite: true }).where(eq(userSetups.id, id));
  }
  revalidatePath("/gear/builder");
  revalidatePath("/my-gear");
}

/** Delete one of the caller's saved setups. */
export async function deleteUserSetup(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const id = String(formData.get("id") ?? "");
  await db.delete(userSetups).where(and(eq(userSetups.id, id), eq(userSetups.ownerId, user.id)));
  revalidatePath("/gear/builder");
}
