"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { biteBoards, biteReports, type BiteReportOutcome, type BiteReportVisibility } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { assertUnderQuota, storeMedia } from "@/lib/media";
import { approximate } from "@/lib/geo";

export type BiteReportFormResult = { error?: string } | undefined;

const outcomes: BiteReportOutcome[] = ["caught", "missed", "hooked", "observed"];
const visibilities: BiteReportVisibility[] = ["private", "followers", "public_area", "public_no_area"];

export async function createBiteReport(
  _prev: BiteReportFormResult,
  formData: FormData
): Promise<BiteReportFormResult> {
  const user = await requireUser();
  const db = await getDb();

  const boardId = String(formData.get("boardId") ?? "") || null;
  const speciesId = String(formData.get("speciesId") ?? "") || null;
  const customSpecies = String(formData.get("customSpecies") ?? "").trim().slice(0, 120) || null;
  if (!speciesId && !customSpecies) return { error: "Pick a species or type what you saw." };

  const outcomeRaw = String(formData.get("outcome") ?? "caught") as BiteReportOutcome;
  const outcome = outcomes.includes(outcomeRaw) ? outcomeRaw : "caught";
  const visibilityRaw = String(formData.get("visibility") ?? "private") as BiteReportVisibility;
  const visibility = visibilities.includes(visibilityRaw) ? visibilityRaw : "private";
  const broadAreaLabel = String(formData.get("broadAreaLabel") ?? "").trim().slice(0, 120) || null;
  if (visibility === "public_area" && !broadAreaLabel) {
    return { error: "Add a broad area label before sharing publicly with an area." };
  }

  const num = (name: string) => {
    const v = String(formData.get(name) ?? "").trim();
    if (!v) return null;
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const latRaw = num("lat");
  const lngRaw = num("lng");
  const coords = latRaw != null && lngRaw != null ? approximate(latRaw, lngRaw) : null;

  const [row] = await db
    .insert(biteReports)
    .values({
      userId: user.id,
      boardId,
      speciesId,
      customSpecies,
      outcome,
      bait: String(formData.get("bait") ?? "").trim().slice(0, 200) || null,
      method: String(formData.get("method") ?? "").trim().slice(0, 80) || null,
      timeOfDay: String(formData.get("timeOfDay") ?? "").trim().slice(0, 80) || null,
      tideSummary: String(formData.get("tideSummary") ?? "").trim().slice(0, 120) || null,
      moonSummary: String(formData.get("moonSummary") ?? "").trim().slice(0, 120) || null,
      notes: String(formData.get("notes") ?? "").trim().slice(0, 1000) || null,
      visibility,
      locationPrecision:
        visibility === "public_area" ? "shared_broad_area" : visibility === "public_no_area" ? "hidden" : "approx_private",
      lat: visibility.startsWith("public") ? null : coords?.lat ?? null,
      lng: visibility.startsWith("public") ? null : coords?.lng ?? null,
      broadAreaLabel: visibility === "public_area" ? broadAreaLabel : null,
    })
    .returning();

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      await assertUnderQuota(user.id);
      const asset = await storeMedia({
        file: photo,
        ownerId: user.id,
        kind: "report",
        relatedId: row.id,
        visibility: visibility === "private" ? "private" : visibility === "followers" ? "followers" : "public",
      });
      const feed = asset.variants.find((v) => v.label === "feed") ?? asset.variants[asset.variants.length - 1];
      await db
        .update(biteReports)
        .set({ photoMediaId: asset.id, photoUrl: feed?.url ?? null })
        .where(eq(biteReports.id, row.id));
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Photo upload failed" };
    }
  }

  const board = boardId ? await db.query.biteBoards.findFirst({ where: and(eq(biteBoards.id, boardId), eq(biteBoards.active, true)) }) : null;
  revalidatePath("/community");
  revalidatePath("/boards");
  if (board) revalidatePath(`/boards/${board.slug}`);
  redirect(board ? `/boards/${board.slug}` : "/boards");
}
