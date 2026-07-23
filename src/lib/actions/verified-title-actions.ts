"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import {
  badgeAuditLogs,
  professionalProfiles,
  userVerifiedTitles,
  verificationDocuments,
  verifiedTitleRequests,
  verifiedUserReports,
  biteBoards,
  species,
} from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth-helpers";
import { notify } from "@/lib/notify";
import { storeMedia } from "@/lib/media";
import { isVerifiedTitleSlug, titleDef } from "@/data/verified-titles";
import { activeTitlesFor } from "@/lib/verified";

function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

const OPEN_STATUSES = ["draft", "submitted", "under_review", "needs_more_info"] as const;

async function audit(subjectUserId: string, actorId: string | null, action: string, detail: Record<string, unknown> = {}) {
  const db = await getDb();
  await db.insert(badgeAuditLogs).values({ subjectUserId, actorId, action, detail });
}

/* ───────────────────────── applicant side ───────────────────────── */

/** Create/update the user's open request; submit or keep as draft. */
export async function saveTitleRequest(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const titleSlug = clean(formData.get("titleSlug"), 40);
  if (!isVerifiedTitleSlug(titleSlug)) redirect("/verified");
  const def = titleDef(titleSlug)!;
  const submitting = clean(formData.get("intent"), 10) === "submit";

  const socialLinks = clean(formData.get("socialLinks"), 600)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const details: Record<string, string> = {};
  for (const f of def.fields) details[f.id] = clean(formData.get(`detail_${f.id}`), 2000);

  const base = {
    titleSlug,
    fullName: clean(formData.get("fullName"), 120),
    displayName: clean(formData.get("displayName"), 120),
    businessName: clean(formData.get("businessName"), 160) || null,
    website: clean(formData.get("website"), 300) || null,
    bookingLink: clean(formData.get("bookingLink"), 300) || null,
    socialLinks,
    serviceArea: clean(formData.get("serviceArea"), 200) || null,
    state: clean(formData.get("state"), 30) || null,
    bio: clean(formData.get("bio"), 1500) || null,
    reason: clean(formData.get("reason"), 1500) || null,
    contactEmail: clean(formData.get("contactEmail"), 200),
    contactPhone: clean(formData.get("contactPhone"), 40) || null,
    details,
    updatedAt: new Date(),
  };

  if (submitting) {
    const missing: string[] = [];
    if (!base.fullName) missing.push("full name");
    if (!base.contactEmail) missing.push("contact email");
    if (!base.reason) missing.push("reason for requesting");
    for (const f of def.fields) if (f.required && !details[f.id]) missing.push(f.label.toLowerCase());
    if (missing.length > 0) {
      redirect(`/verified/apply?title=${titleSlug}&error=${encodeURIComponent(`Missing: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`)}`);
    }
  }

  const existing = await db.query.verifiedTitleRequests.findFirst({
    where: and(eq(verifiedTitleRequests.userId, user.id), inArray(verifiedTitleRequests.status, [...OPEN_STATUSES])),
  });

  let requestId: string;
  const nextStatus = submitting ? ("submitted" as const) : ("draft" as const);
  if (existing) {
    await db
      .update(verifiedTitleRequests)
      .set({ ...base, status: existing.status === "needs_more_info" && !submitting ? "needs_more_info" : nextStatus })
      .where(eq(verifiedTitleRequests.id, existing.id));
    requestId = existing.id;
  } else {
    const [created] = await db
      .insert(verifiedTitleRequests)
      .values({ userId: user.id, ...base, status: nextStatus })
      .returning();
    requestId = created.id;
  }

  // optional proof upload (private; visible only to the applicant + admins)
  const proof = formData.get("proofFile");
  if (proof instanceof File && proof.size > 0) {
    try {
      const asset = await storeMedia({ file: proof, ownerId: user.id, kind: "other", relatedId: requestId, visibility: "private" });
      await db.insert(verificationDocuments).values({ requestId, userId: user.id, mediaId: asset.id, label: proof.name.slice(0, 120) || "Proof" });
    } catch {
      redirect(`/verified/apply?title=${titleSlug}&error=${encodeURIComponent("Proof upload failed — try a smaller image.")}`);
    }
  }

  if (submitting) await audit(user.id, user.id, "request_submitted", { titleSlug, requestId });
  revalidatePath("/verified");
  redirect(submitting ? "/verified?submitted=1" : "/verified?saved=1");
}

export async function withdrawTitleRequest(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const id = clean(formData.get("requestId"), 80);
  const request = await db.query.verifiedTitleRequests.findFirst({
    where: and(eq(verifiedTitleRequests.id, id), eq(verifiedTitleRequests.userId, user.id)),
  });
  if (request && OPEN_STATUSES.includes(request.status as (typeof OPEN_STATUSES)[number])) {
    await db.delete(verifiedTitleRequests).where(eq(verifiedTitleRequests.id, request.id));
    await audit(user.id, user.id, "request_withdrawn", { titleSlug: request.titleSlug });
  }
  revalidatePath("/verified");
  redirect("/verified");
}

/** Approved users edit their public professional profile. */
export async function saveProfessionalProfile(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const titles = await activeTitlesFor(db, user.id);
  if (titles.length === 0) redirect("/verified");
  const titleSlug = titles[0];

  const detailKeys = [
    "targetSpecies", "fishingStyles", "boatType", "tripTypes", "yearsExperience",
    "brandsCarried", "baitNotes", "specialties",
    "teamName", "circuits", "favoriteSpecies", "notableFinishes", "sponsors", "gearSetups",
  ];
  const details: Record<string, string> = {};
  for (const k of detailKeys) {
    const v = clean(formData.get(`pd_${k}`), 500);
    if (v) details[k] = v;
  }
  const values = {
    userId: user.id,
    titleSlug,
    businessName: clean(formData.get("businessName"), 160) || null,
    serviceArea: clean(formData.get("serviceArea"), 200) || null,
    address: clean(formData.get("address"), 240) || null,
    phone: clean(formData.get("phone"), 40) || null,
    website: clean(formData.get("website"), 300) || null,
    bookingLink: clean(formData.get("bookingLink"), 300) || null,
    hours: clean(formData.get("hours"), 200) || null,
    publicBio: clean(formData.get("publicBio"), 1500) || null,
    socialLinks: clean(formData.get("socialLinks"), 600)
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6),
    details,
    updatedAt: new Date(),
  };
  const existing = await db.query.professionalProfiles.findFirst({ where: eq(professionalProfiles.userId, user.id) });
  if (existing) await db.update(professionalProfiles).set(values).where(eq(professionalProfiles.id, existing.id));
  else await db.insert(professionalProfiles).values(values);
  revalidatePath("/verified");
  redirect("/verified?profileSaved=1");
}

/* ───────────────────────── verified reports ───────────────────────── */

export async function createVerifiedReport(formData: FormData): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  const titles = await activeTitlesFor(db, user.id);
  const titleSlug = clean(formData.get("titleSlug"), 40);
  if (!isVerifiedTitleSlug(titleSlug) || !titles.includes(titleSlug)) redirect("/verified");

  const body = clean(formData.get("body"), 4000);
  const generalArea = clean(formData.get("generalArea"), 160);
  if (body.length < 20 || !generalArea) {
    redirect(`/verified/report?error=${encodeURIComponent("Add a general area and at least a couple sentences.")}`);
  }

  const boardId = clean(formData.get("boardId"), 80) || null;
  const board = boardId
    ? await db.query.biteBoards.findFirst({ where: and(eq(biteBoards.id, boardId), eq(biteBoards.active, true)) })
    : null;
  const speciesId = clean(formData.get("speciesId"), 80) || null;
  const speciesRow = speciesId ? await db.query.species.findFirst({ where: eq(species.id, speciesId) }) : null;

  const fieldKeys = [
    "method", "bait", "conditions", "tideNotes", "bookingCta",
    "baitAvailability", "gearRecommendations", "localBiteNotes", "shopNote",
    "gearSetup", "techniqueNotes", "tournamentInsight",
  ];
  const fields: Record<string, string> = {};
  for (const k of fieldKeys) {
    const v = clean(formData.get(`field_${k}`), 600);
    if (v) fields[k] = v;
  }

  await db.insert(verifiedUserReports).values({
    userId: user.id,
    titleSlug,
    boardId: board?.id ?? null,
    speciesId: speciesRow?.id ?? null,
    generalArea,
    speciesText: clean(formData.get("speciesText"), 200),
    body,
    fields,
    reportDate: new Date(),
  });

  revalidatePath("/boards");
  if (board) revalidatePath(`/boards/${board.slug}`);
  if (speciesRow) revalidatePath(`/fish/${speciesRow.slug}`);
  redirect(board ? `/boards/${board.slug}` : "/verified?reported=1");
}

/* ───────────────────────── admin side ───────────────────────── */

export async function adminSetRequestStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const db = await getDb();
  const id = clean(formData.get("requestId"), 80);
  const action = clean(formData.get("action"), 30); // under_review | needs_more_info | approve | reject
  const message = clean(formData.get("message"), 1000);
  const request = await db.query.verifiedTitleRequests.findFirst({ where: eq(verifiedTitleRequests.id, id) });
  if (!request) redirect("/admin/verified");
  const def = titleDef(request.titleSlug);

  if (action === "under_review") {
    await db.update(verifiedTitleRequests).set({ status: "under_review", updatedAt: new Date() }).where(eq(verifiedTitleRequests.id, id));
    await audit(request.userId, admin.id, "status_changed", { to: "under_review", requestId: id });
  } else if (action === "needs_more_info") {
    await db
      .update(verifiedTitleRequests)
      .set({ status: "needs_more_info", moreInfoMessage: message || "Please add more detail or proof.", updatedAt: new Date() })
      .where(eq(verifiedTitleRequests.id, id));
    await audit(request.userId, admin.id, "needs_more_info", { requestId: id, message });
    await notify(db, {
      userId: request.userId,
      type: "verified_title",
      title: `More info needed on your ${def?.label ?? "verified title"} request`,
      body: message || "Open your request to see what we need.",
      href: "/verified",
    });
  } else if (action === "approve") {
    await db
      .update(verifiedTitleRequests)
      .set({ status: "approved", decidedById: admin.id, decidedAt: new Date(), updatedAt: new Date() })
      .where(eq(verifiedTitleRequests.id, id));
    // grant (or re-activate) the title
    const existing = await db.query.userVerifiedTitles.findFirst({
      where: and(eq(userVerifiedTitles.userId, request.userId), eq(userVerifiedTitles.titleSlug, request.titleSlug)),
    });
    if (existing) {
      await db
        .update(userVerifiedTitles)
        .set({ status: "active", grantedById: admin.id, grantedAt: new Date(), revokedAt: null, revokedReason: null })
        .where(eq(userVerifiedTitles.id, existing.id));
    } else {
      await db.insert(userVerifiedTitles).values({ userId: request.userId, titleSlug: request.titleSlug, grantedById: admin.id });
    }
    // seed the professional profile from the application so the public card starts filled
    const hasPro = await db.query.professionalProfiles.findFirst({ where: eq(professionalProfiles.userId, request.userId) });
    if (!hasPro) {
      await db.insert(professionalProfiles).values({
        userId: request.userId,
        titleSlug: request.titleSlug,
        businessName: request.businessName,
        serviceArea: request.serviceArea,
        website: request.website,
        bookingLink: request.bookingLink,
        publicBio: request.bio,
        socialLinks: request.socialLinks,
        details: request.details,
      });
    }
    await audit(request.userId, admin.id, "approved", { titleSlug: request.titleSlug, requestId: id });
    await notify(db, {
      userId: request.userId,
      type: "verified_title",
      title: `You're verified: ${def?.badgeLabel ?? request.titleSlug}`,
      body: "Your title now shows across ReelFishHelp. Set up your professional profile and post your first report.",
      href: "/verified",
    });
  } else if (action === "reject") {
    await db
      .update(verifiedTitleRequests)
      .set({ status: "rejected", decidedById: admin.id, decidedAt: new Date(), updatedAt: new Date() })
      .where(eq(verifiedTitleRequests.id, id));
    await audit(request.userId, admin.id, "rejected", { titleSlug: request.titleSlug, requestId: id, message });
    await notify(db, {
      userId: request.userId,
      type: "verified_title",
      title: `Your ${def?.label ?? "verified title"} request was not approved`,
      body: message || "You can apply again with more proof at any time.",
      href: "/verified",
    });
  }
  revalidatePath("/admin/verified");
  redirect(`/admin/verified/${id}`);
}

export async function adminAddRequestNote(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const db = await getDb();
  const id = clean(formData.get("requestId"), 80);
  const note = clean(formData.get("note"), 1000);
  const request = await db.query.verifiedTitleRequests.findFirst({ where: eq(verifiedTitleRequests.id, id) });
  if (!request || !note) redirect(`/admin/verified/${id}`);
  await db
    .update(verifiedTitleRequests)
    .set({
      adminNotes: [...request.adminNotes, { by: admin.id, at: new Date().toISOString(), note }],
      updatedAt: new Date(),
    })
    .where(eq(verifiedTitleRequests.id, id));
  await audit(request.userId, admin.id, "note_added", { requestId: id });
  revalidatePath(`/admin/verified/${id}`);
  redirect(`/admin/verified/${id}`);
}

export async function adminRevokeTitle(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const db = await getDb();
  const id = clean(formData.get("titleId"), 80);
  const reason = clean(formData.get("reason"), 500);
  const row = await db.query.userVerifiedTitles.findFirst({ where: eq(userVerifiedTitles.id, id) });
  if (!row) redirect("/admin/verified");
  await db
    .update(userVerifiedTitles)
    .set({ status: "revoked", revokedAt: new Date(), revokedReason: reason || null })
    .where(eq(userVerifiedTitles.id, id));
  // hide their verified reports for that title so revoked pros stop broadcasting
  await db
    .update(verifiedUserReports)
    .set({ moderationStatus: "hidden" })
    .where(and(eq(verifiedUserReports.userId, row.userId), eq(verifiedUserReports.titleSlug, row.titleSlug)));
  await audit(row.userId, admin.id, "revoked", { titleSlug: row.titleSlug, reason });
  await notify(db, {
    userId: row.userId,
    type: "verified_title",
    title: "Your verified title was revoked",
    body: reason || "Contact us if you believe this is a mistake.",
    href: "/verified",
  });
  revalidatePath("/admin/verified");
  redirect("/admin/verified");
}

export async function adminToggleReportVisibility(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const db = await getDb();
  const id = clean(formData.get("reportId"), 80);
  const report = await db.query.verifiedUserReports.findFirst({ where: eq(verifiedUserReports.id, id) });
  if (!report) redirect("/admin/verified");
  await db
    .update(verifiedUserReports)
    .set({ moderationStatus: report.moderationStatus === "visible" ? "hidden" : "visible" })
    .where(eq(verifiedUserReports.id, id));
  await audit(report.userId, admin.id, "report_moderated", { reportId: id, to: report.moderationStatus === "visible" ? "hidden" : "visible" });
  revalidatePath("/admin/verified");
  redirect("/admin/verified");
}
