"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, species, reports, regulationLinks, catches, comments } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import type { SpeciesGuide } from "@/db/schema";

export async function toggleSpeciesActive(id: string) {
  await requireAdmin();
  const db = await getDb();
  const s = await db.query.species.findFirst({ where: eq(species.id, id) });
  if (!s) return { error: "Not found" };
  await db.update(species).set({ active: !s.active, updatedAt: new Date() }).where(eq(species.id, id));
  revalidatePath("/admin/species");
  revalidatePath("/fish");
  return { ok: true };
}

export type AdminSpeciesResult = { error?: string; ok?: boolean } | undefined;

export async function updateSpecies(_prev: AdminSpeciesResult, formData: FormData): Promise<AdminSpeciesResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const db = await getDb();
  const existing = await db.query.species.findFirst({ where: eq(species.id, id) });
  if (!existing) return { error: "Species not found" };

  // structured guide comes in as JSON — validate shape loosely but require parse
  let guide: SpeciesGuide = existing.guide;
  const guideRaw = String(formData.get("guide") ?? "").trim();
  if (guideRaw) {
    try {
      const parsed = JSON.parse(guideRaw);
      if (!parsed.quickPlan || !parsed.gear || !parsed.techniques) {
        return { error: "Guide JSON must include quickPlan, gear, and techniques sections." };
      }
      guide = parsed;
    } catch {
      return { error: "Guide JSON does not parse — check for trailing commas or quotes." };
    }
  }

  const list = (name: string) =>
    String(formData.get(name) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  await db
    .update(species)
    .set({
      commonName: String(formData.get("commonName") ?? existing.commonName).slice(0, 120),
      scientificName: String(formData.get("scientificName") ?? existing.scientificName).slice(0, 120),
      description: String(formData.get("description") ?? existing.description).slice(0, 2000),
      difficulty: Math.min(5, Math.max(1, parseInt(String(formData.get("difficulty"))) || existing.difficulty)),
      beginnerFriendly: formData.get("beginnerFriendly") === "on",
      water: (["freshwater", "saltwater", "both"].includes(String(formData.get("water")))
        ? String(formData.get("water"))
        : existing.water) as "freshwater" | "saltwater" | "both",
      avgSize: String(formData.get("avgSize") ?? existing.avgSize).slice(0, 120),
      trophySize: String(formData.get("trophySize") ?? existing.trophySize).slice(0, 120),
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || existing.imageUrl,
      regions: list("regions"),
      states: list("states").map((s) => s.toUpperCase()),
      environments: list("environments"),
      styles: list("styles"),
      seasons: list("seasons"),
      baitTypes: list("baitTypes"),
      guide,
      updatedAt: new Date(),
    })
    .where(eq(species.id, id));

  revalidatePath("/fish");
  revalidatePath(`/fish/${existing.slug}`);
  revalidatePath("/admin/species");
  return { ok: true };
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
  await requireAdmin();
  const db = await getDb();
  await db.update(reports).set({ status }).where(eq(reports.id, reportId));
  revalidatePath("/admin");
  return { ok: true };
}

/** Moderation: remove reported content outright. */
export async function adminRemoveContent(targetType: string, targetId: string) {
  await requireAdmin();
  const db = await getDb();
  if (targetType === "catch") {
    await db.delete(catches).where(eq(catches.id, targetId));
  } else if (targetType === "comment") {
    await db.delete(comments).where(eq(comments.id, targetId));
  } else {
    return { error: "Only catches and comments can be removed directly." };
  }
  revalidatePath("/community");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateRegulationLink(state: string, url: string, agency: string, notes: string) {
  await requireAdmin();
  const db = await getDb();
  await db
    .update(regulationLinks)
    .set({ url: url.slice(0, 500), agency: agency.slice(0, 200), notes: notes.slice(0, 500) || null })
    .where(eq(regulationLinks.state, state));
  revalidatePath("/admin/regulations");
  return { ok: true };
}
