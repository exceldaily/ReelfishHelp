"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, savedGuides, gearItems, species } from "@/db";
import { requireUser } from "@/lib/auth-helpers";

export async function toggleSavedGuide(speciesId: string) {
  const user = await requireUser();
  const db = await getDb();
  const existing = await db.query.savedGuides.findFirst({
    where: and(eq(savedGuides.userId, user.id), eq(savedGuides.speciesId, speciesId)),
  });
  if (existing) {
    await db
      .delete(savedGuides)
      .where(and(eq(savedGuides.userId, user.id), eq(savedGuides.speciesId, speciesId)));
  } else {
    await db.insert(savedGuides).values({ userId: user.id, speciesId });
  }
  revalidatePath("/home");
  return { saved: !existing };
}

/** Copies a guide's recommended setup into the user's gear wishlist. */
export async function saveSetupToGear(speciesId: string, tier: "beginner" | "budget" | "serious") {
  const user = await requireUser();
  const db = await getDb();
  const s = await db.query.species.findFirst({ where: eq(species.id, speciesId) });
  if (!s) return { error: "Species not found" };
  const label = { beginner: "Beginner", budget: "Budget", serious: "Serious angler" }[tier];
  await db.insert(gearItems).values({
    userId: user.id,
    category: "combo",
    name: `${label} ${s.commonName} setup`,
    notes: `${s.guide.gear.setups[tier]}\n\nRod: ${s.guide.gear.rod}\nReel: ${s.guide.gear.reel}\nLine: ${s.guide.gear.mainLine}\nLeader: ${s.guide.gear.leader}`,
    wishlist: true,
    condition: "new",
  });
  revalidatePath("/gear");
  return { ok: true };
}
