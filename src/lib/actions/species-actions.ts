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

