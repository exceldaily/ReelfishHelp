"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getDb,
  contentItems,
  type ContentKind,
  type ContentStage,
  type ContentPlatform,
  type PlatformCaptions,
} from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { gatherStudioContext } from "@/lib/content-studio/context";
import {
  generateIdeas,
  generateCaptions,
  generateComments,
  generateHighlight,
  isNotConfigured,
  type GeneratedIdea,
  type GeneratedCaptions,
  type GeneratedHighlight,
} from "@/lib/content-studio/generate";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; notConfigured?: boolean };

function fail(e: unknown): { ok: false; error: string; notConfigured?: boolean } {
  if (isNotConfigured(e)) {
    return {
      ok: false,
      notConfigured: true,
      error: "AI generation is off until an ANTHROPIC_API_KEY is added. The templates, feature demos, b-roll, and pipeline all still work.",
    };
  }
  return { ok: false, error: e instanceof Error ? e.message : "Something went wrong. Try again." };
}

/* ------------------------------- generators ------------------------------- */

export async function runGenerateIdeas(input: {
  focus?: string;
  count?: number;
}): Promise<ActionResult<GeneratedIdea[]>> {
  await requireAdmin();
  try {
    const ctx = await gatherStudioContext();
    const count = Math.min(6, Math.max(1, input.count ?? 3));
    const data = await generateIdeas({ ctx, count, focus: input.focus });
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function runGenerateCaptions(input: {
  topic: string;
}): Promise<ActionResult<GeneratedCaptions>> {
  await requireAdmin();
  try {
    if (!input.topic?.trim()) return { ok: false, error: "Add a video topic first." };
    const ctx = await gatherStudioContext();
    const data = await generateCaptions({ topic: input.topic.trim(), ctx });
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function runGenerateComments(input: {
  context: string;
  count?: number;
}): Promise<ActionResult<string[]>> {
  await requireAdmin();
  try {
    if (!input.context?.trim()) return { ok: false, error: "Describe the post you're commenting on." };
    const count = Math.min(10, Math.max(3, input.count ?? 6));
    const data = await generateComments({ context: input.context.trim(), count });
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

export async function runGenerateHighlight(input: {
  highlightType: string;
  subject: string;
}): Promise<ActionResult<GeneratedHighlight>> {
  await requireAdmin();
  try {
    if (!input.subject?.trim()) return { ok: false, error: "Pick or describe what you're highlighting." };
    const ctx = await gatherStudioContext();
    const data = await generateHighlight({
      highlightType: input.highlightType,
      subject: input.subject.trim(),
      ctx,
    });
    return { ok: true, data };
  } catch (e) {
    return fail(e);
  }
}

/* ------------------------------- persistence ------------------------------ */

export type SaveContentInput = {
  kind: ContentKind;
  platform?: ContentPlatform | null;
  title: string;
  hook?: string | null;
  script15?: string | null;
  script30?: string | null;
  overlays?: string[];
  visuals?: string[];
  cta?: string | null;
  hashtags?: string[];
  caption?: string | null;
  captions?: PlatformCaptions | null;
  comments?: string[];
  shotList?: string[];
  brollTerms?: string[];
  screenSteps?: string[];
  templateSlug?: string | null;
  sourceRefs?: Record<string, unknown>;
  notes?: string | null;
};

const arr = (v?: string[]) => (Array.isArray(v) ? v.map(String).slice(0, 40) : []);

export async function saveContentItem(
  input: SaveContentInput
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const title = (input.title ?? "").trim();
  if (!title) return { ok: false, error: "Give it a title before saving." };
  const db = await getDb();
  try {
    const [row] = await db
      .insert(contentItems)
      .values({
        authorId: admin.id,
        kind: input.kind,
        platform: input.platform ?? null,
        stage: "idea",
        title: title.slice(0, 200),
        hook: input.hook ?? null,
        script15: input.script15 ?? null,
        script30: input.script30 ?? null,
        overlays: arr(input.overlays),
        visuals: arr(input.visuals),
        cta: input.cta ?? null,
        hashtags: arr(input.hashtags),
        caption: input.caption ?? null,
        captions: input.captions ?? null,
        comments: arr(input.comments),
        shotList: arr(input.shotList),
        brollTerms: arr(input.brollTerms),
        screenSteps: arr(input.screenSteps),
        templateSlug: input.templateSlug ?? null,
        sourceRefs: input.sourceRefs ?? {},
        notes: input.notes ?? null,
      })
      .returning();
    revalidatePath("/admin/studio");
    return { ok: true, data: { id: row.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save." };
  }
}

const STAGES: ContentStage[] = ["idea", "in-progress", "recorded", "edited", "posted", "reuse-later"];

export async function updateContentStage(
  id: string,
  stage: ContentStage
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if (!STAGES.includes(stage)) return { ok: false, error: "Unknown stage." };
  const db = await getDb();
  await db
    .update(contentItems)
    .set({ stage, updatedAt: new Date() })
    .where(and(eq(contentItems.id, id), eq(contentItems.authorId, admin.id)));
  revalidatePath("/admin/studio");
  return { ok: true, data: null };
}

export async function updateContentNotes(
  id: string,
  notes: string
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  const db = await getDb();
  await db
    .update(contentItems)
    .set({ notes: notes.slice(0, 2000), updatedAt: new Date() })
    .where(and(eq(contentItems.id, id), eq(contentItems.authorId, admin.id)));
  revalidatePath("/admin/studio");
  return { ok: true, data: null };
}

export async function deleteContentItem(id: string): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  const db = await getDb();
  await db
    .delete(contentItems)
    .where(and(eq(contentItems.id, id), eq(contentItems.authorId, admin.id)));
  revalidatePath("/admin/studio");
  return { ok: true, data: null };
}
