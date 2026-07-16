"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, anglerTips } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { TIP_CATEGORIES } from "@/lib/tips";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function saveTip(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const db = await getDb();

  const id = String(formData.get("__id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const tipText = String(formData.get("tipText") ?? "").trim().slice(0, 600);
  const category = String(formData.get("category") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "on";
  const publishDateRaw = String(formData.get("publishDate") ?? "").trim();
  const expirationDateRaw = String(formData.get("expirationDate") ?? "").trim();
  const displayOrder = parseInt(String(formData.get("displayOrder") ?? "0"), 10) || 0;

  const err = (msg: string) =>
    redirect(`/admin/tips/${id || "new"}?err=${encodeURIComponent(msg)}`);
  if (!title) err("Title is required.");
  if (!tipText) err("Tip text is required.");
  if (!(TIP_CATEGORIES as readonly string[]).includes(category)) err("Pick a category.");
  const publishDate = publishDateRaw && DATE_RE.test(publishDateRaw) ? publishDateRaw : null;
  const expirationDate = expirationDateRaw && DATE_RE.test(expirationDateRaw) ? expirationDateRaw : null;

  if (id && id !== "new") {
    await db
      .update(anglerTips)
      .set({ title, tipText, category, icon, imageUrl, isActive, publishDate, expirationDate, displayOrder, updatedAt: new Date() })
      .where(eq(anglerTips.id, id));
  } else {
    // unique slug from the title
    let slug = slugify(title) || `tip-${Date.now()}`;
    const clash = await db.query.anglerTips.findFirst({ where: eq(anglerTips.slug, slug) });
    if (clash) slug = `${slug}-${Date.now() % 10000}`;
    await db.insert(anglerTips).values({
      slug,
      title,
      tipText,
      category,
      icon,
      imageUrl,
      isActive,
      publishDate,
      expirationDate,
      displayOrder,
      createdBy: admin.id,
    });
  }
  revalidatePath("/admin/tips");
  revalidatePath("/tips");
  revalidatePath("/home");
  redirect("/admin/tips");
}

export async function toggleTipActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("__id") ?? "");
  if (!id) return;
  const db = await getDb();
  const tip = await db.query.anglerTips.findFirst({ where: eq(anglerTips.id, id) });
  if (!tip) return;
  await db.update(anglerTips).set({ isActive: !tip.isActive, updatedAt: new Date() }).where(eq(anglerTips.id, id));
  revalidatePath("/admin/tips");
  revalidatePath("/home");
}

export async function deleteTip(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("__id") ?? "");
  if (!id) return;
  const db = await getDb();
  await db.delete(anglerTips).where(eq(anglerTips.id, id)); // helpful/saved rows cascade
  revalidatePath("/admin/tips");
  revalidatePath("/tips");
  revalidatePath("/home");
  redirect("/admin/tips");
}
