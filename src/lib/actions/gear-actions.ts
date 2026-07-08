"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, gearItems } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { storeMediaUrl } from "@/lib/media";
import { GEAR_CATEGORIES } from "@/lib/constants";

export type GearFormResult = { error?: string; ok?: boolean } | undefined;

/** Creates a gear item, or updates one when the form carries an `id`. */
export async function saveGear(_prev: GearFormResult, formData: FormData): Promise<GearFormResult> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give it a name." };
  const category = String(formData.get("category") ?? "other");

  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoUrl = await storeMediaUrl({
        file: photo,
        ownerId: user.id,
        kind: "gear",
        relatedId: id || null,
        visibility: formData.get("isPublic") === "on" ? "public" : "private",
      });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Photo upload failed" };
    }
  }

  const values = {
    category: (GEAR_CATEGORIES as readonly string[]).includes(category) ? category : "other",
    name: name.slice(0, 120),
    brand: String(formData.get("brand") ?? "").slice(0, 80) || null,
    model: String(formData.get("model") ?? "").slice(0, 120) || null,
    notes: String(formData.get("notes") ?? "").slice(0, 2000) || null,
    purchaseDate: String(formData.get("purchaseDate") ?? "") || null,
    condition: (["new", "good", "worn", "needs repair"].includes(String(formData.get("condition")))
      ? String(formData.get("condition"))
      : "good") as "new" | "good" | "worn" | "needs repair",
    favorite: formData.get("favorite") === "on",
    wishlist: formData.get("wishlist") === "on",
    isPublic: formData.get("isPublic") === "on",
  };

  const db = await getDb();
  if (id) {
    const existing = await db.query.gearItems.findFirst({
      where: and(eq(gearItems.id, id), eq(gearItems.userId, user.id)),
    });
    if (!existing) return { error: "Gear item not found." };
    await db
      .update(gearItems)
      .set({ ...values, ...(photoUrl ? { photoUrl } : {}) }) // keep old photo unless replaced
      .where(and(eq(gearItems.id, id), eq(gearItems.userId, user.id)));
  } else {
    await db.insert(gearItems).values({ userId: user.id, photoUrl, ...values });
  }
  revalidatePath("/gear");
  return { ok: true };
}

export async function deleteGear(id: string) {
  const user = await requireUser();
  const db = await getDb();
  await db.delete(gearItems).where(and(eq(gearItems.id, id), eq(gearItems.userId, user.id)));
  revalidatePath("/gear");
}

export async function toggleGearFlag(id: string, flag: "favorite" | "wishlist" | "isPublic") {
  const user = await requireUser();
  const db = await getDb();
  const item = await db.query.gearItems.findFirst({
    where: and(eq(gearItems.id, id), eq(gearItems.userId, user.id)),
  });
  if (!item) return { error: "Not found" };
  await db
    .update(gearItems)
    .set({ [flag]: !item[flag] })
    .where(eq(gearItems.id, id));
  revalidatePath("/gear");
  return { ok: true };
}
