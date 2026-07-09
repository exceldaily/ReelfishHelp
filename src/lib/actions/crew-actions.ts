"use server";

import crypto from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { crews, crewMembers, crewPosts, catches, type Crew, type CrewPrivacy, type CrewRole } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { assertUnderQuota, storeMedia, storeMediaUrl, deleteMedia } from "@/lib/media";
import { crewRole, canModerate } from "@/lib/crews";

export type CrewFormResult = { error?: string } | undefined;

/* --------------------------------- helpers --------------------------------- */

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "crew"
  );
}

async function uniqueSlug(base: string): Promise<string> {
  const db = await getDb();
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const existing = await db.query.crews.findFirst({ where: eq(crews.slug, slug) });
    if (!existing) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function newInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

/** Adds a member if not already present, bumping the denormalized count. */
async function addMember(crew: Crew, userId: string): Promise<boolean> {
  const db = await getDb();
  const existing = await db.query.crewMembers.findFirst({
    where: and(eq(crewMembers.crewId, crew.id), eq(crewMembers.userId, userId)),
  });
  if (existing) return false;
  await db.insert(crewMembers).values({ crewId: crew.id, userId, role: "member" });
  await db.update(crews).set({ memberCount: sql`${crews.memberCount} + 1` }).where(eq(crews.id, crew.id));
  return true;
}

/* ------------------------------- crew lifecycle ------------------------------ */

export async function createCrew(_prev: CrewFormResult, formData: FormData): Promise<CrewFormResult> {
  const user = await requireUser();
  const db = await getDb();

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (name.length < 3) return { error: "Crew name must be at least 3 characters." };
  const description = String(formData.get("description") ?? "").trim().slice(0, 1000) || null;
  const homeState = String(formData.get("homeState") ?? "").trim().slice(0, 2) || null;
  const privacy: CrewPrivacy = String(formData.get("privacy") ?? "open") === "private" ? "private" : "open";
  const slug = await uniqueSlug(slugify(name));

  let avatarUrl: string | null = null;
  const photo = formData.get("avatar");
  if (photo instanceof File && photo.size > 0) {
    try {
      await assertUnderQuota(user.id);
      avatarUrl = await storeMediaUrl({ file: photo, ownerId: user.id, kind: "other", relatedId: slug, visibility: "public" });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Photo upload failed" };
    }
  }

  const [crew] = await db
    .insert(crews)
    .values({ slug, name, description, homeState, privacy, avatarUrl, inviteCode: newInviteCode(), ownerId: user.id, memberCount: 1 })
    .returning();
  await db.insert(crewMembers).values({ crewId: crew.id, userId: user.id, role: "owner" });

  revalidatePath("/crews");
  redirect(`/crews/${crew.slug}`);
}

export async function updateCrew(_prev: CrewFormResult, formData: FormData): Promise<CrewFormResult> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew) return { error: "Crew not found." };
  if (crew.ownerId !== user.id) return { error: "Only the owner can edit this crew." };

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (name.length < 3) return { error: "Crew name must be at least 3 characters." };
  const description = String(formData.get("description") ?? "").trim().slice(0, 1000) || null;
  const homeState = String(formData.get("homeState") ?? "").trim().slice(0, 2) || null;
  const privacy: CrewPrivacy = String(formData.get("privacy") ?? "open") === "private" ? "private" : "open";

  let avatarUrl = crew.avatarUrl;
  const photo = formData.get("avatar");
  if (photo instanceof File && photo.size > 0) {
    try {
      await assertUnderQuota(user.id);
      avatarUrl = await storeMediaUrl({ file: photo, ownerId: user.id, kind: "other", relatedId: crew.id, visibility: "public" });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Photo upload failed" };
    }
  }

  await db.update(crews).set({ name, description, homeState, privacy, avatarUrl }).where(eq(crews.id, crewId));
  revalidatePath(`/crews/${crew.slug}`);
  revalidatePath("/crews");
  redirect(`/crews/${crew.slug}`);
}

export async function deleteCrew(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew || crew.ownerId !== user.id) return;
  await db.delete(crews).where(eq(crews.id, crewId)); // members + posts cascade
  revalidatePath("/crews");
  redirect("/crews");
}

export async function rotateInviteCode(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew || crew.ownerId !== user.id) return;
  await db.update(crews).set({ inviteCode: newInviteCode() }).where(eq(crews.id, crewId));
  revalidatePath(`/crews/${crew.slug}/settings`);
}

/* --------------------------------- membership -------------------------------- */

export async function joinCrew(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew || crew.privacy !== "open") return; // private crews require an invite code
  await addMember(crew, user.id);
  revalidatePath(`/crews/${crew.slug}`);
  revalidatePath("/crews");
}

export async function joinByInvite(_prev: CrewFormResult, formData: FormData): Promise<CrewFormResult> {
  const user = await requireUser();
  const db = await getDb();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter an invite code." };
  const crew = await db.query.crews.findFirst({ where: eq(crews.inviteCode, code) });
  if (!crew) return { error: "That invite code isn't valid." };
  await addMember(crew, user.id);
  revalidatePath(`/crews/${crew.slug}`);
  redirect(`/crews/${crew.slug}`);
}

export async function leaveCrew(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew || crew.ownerId === user.id) return; // owner must delete or hand off, not leave
  const existing = await db.query.crewMembers.findFirst({
    where: and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, user.id)),
  });
  if (!existing) return;
  await db.delete(crewMembers).where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, user.id)));
  await db.update(crews).set({ memberCount: sql`GREATEST(1, ${crews.memberCount} - 1)` }).where(eq(crews.id, crewId));
  revalidatePath(`/crews/${crew.slug}`);
  revalidatePath("/crews");
}

export async function removeMember(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const targetId = String(formData.get("userId") ?? "");
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew) return;
  const role = await crewRole(crewId, user.id);
  if (!canModerate(role)) return;
  if (targetId === crew.ownerId) return; // never remove the owner
  const targetRole = await crewRole(crewId, targetId);
  if (targetRole === "admin" && role !== "owner") return; // only owner removes admins
  const existing = await db.query.crewMembers.findFirst({
    where: and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, targetId)),
  });
  if (!existing) return;
  await db.delete(crewMembers).where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, targetId)));
  await db.update(crews).set({ memberCount: sql`GREATEST(1, ${crews.memberCount} - 1)` }).where(eq(crews.id, crewId));
  revalidatePath(`/crews/${crew.slug}`);
}

export async function setMemberRole(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const targetId = String(formData.get("userId") ?? "");
  const newRole: CrewRole = String(formData.get("role") ?? "member") === "admin" ? "admin" : "member";
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew || crew.ownerId !== user.id) return; // only owner manages roles
  if (targetId === crew.ownerId) return;
  await db
    .update(crewMembers)
    .set({ role: newRole })
    .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, targetId)));
  revalidatePath(`/crews/${crew.slug}`);
}

/* ----------------------------------- feed ----------------------------------- */

export async function createCrewPost(_prev: CrewFormResult, formData: FormData): Promise<CrewFormResult> {
  const user = await requireUser();
  const db = await getDb();
  const crewId = String(formData.get("crewId") ?? "");
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, crewId) });
  if (!crew) return { error: "Crew not found." };
  if (!(await crewRole(crewId, user.id))) return { error: "Join this crew to post." };

  const body = String(formData.get("body") ?? "").trim().slice(0, 2000) || null;
  let catchId = String(formData.get("catchId") ?? "").trim() || null;
  if (catchId) {
    // only allow sharing the caller's own PUBLIC catches (privacy + avoids blocked media)
    const owned = await db.query.catches.findFirst({
      where: and(eq(catches.id, catchId), eq(catches.userId, user.id), eq(catches.visibility, "public")),
    });
    if (!owned) catchId = null;
  }
  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (!body && !catchId && !hasPhoto) return { error: "Write something, add a photo, or share a catch." };

  const [post] = await db.insert(crewPosts).values({ crewId, userId: user.id, body, catchId }).returning();

  if (hasPhoto) {
    try {
      await assertUnderQuota(user.id);
      // public visibility so every crew member can load it; URL is an unguessable UUID
      const asset = await storeMedia({ file: photo as File, ownerId: user.id, kind: "other", relatedId: post.id, visibility: "public" });
      const feed = asset.variants.find((v) => v.label === "feed") ?? asset.variants[asset.variants.length - 1];
      await db.update(crewPosts).set({ photoMediaId: asset.id, photoUrl: feed?.url ?? null }).where(eq(crewPosts.id, post.id));
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Photo upload failed" };
    }
  }

  revalidatePath(`/crews/${crew.slug}`);
}

export async function deleteCrewPost(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const postId = String(formData.get("postId") ?? "");
  const post = await db.query.crewPosts.findFirst({ where: eq(crewPosts.id, postId) });
  if (!post) return;
  const crew = await db.query.crews.findFirst({ where: eq(crews.id, post.crewId) });
  if (!crew) return;
  const role = await crewRole(post.crewId, user.id);
  if (post.userId !== user.id && !canModerate(role)) return;
  if (post.photoMediaId) await deleteMedia(post.photoMediaId, user.id, true).catch(() => {});
  await db.delete(crewPosts).where(eq(crewPosts.id, postId));
  revalidatePath(`/crews/${crew.slug}`);
}
