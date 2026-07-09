"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { tableFor, buildRowValues, isGearType } from "@/lib/admin/gear-admin";

export async function saveGearRow(formData: FormData): Promise<void> {
  await requireAdmin();
  const type = String(formData.get("__type") ?? "");
  const id = String(formData.get("__id") ?? "");
  if (!isGearType(type)) return;

  const built = buildRowValues(type, formData);
  if ("error" in built) {
    redirect(`/admin/gear/${type}/${id || "new"}?err=${encodeURIComponent(built.error)}`);
  }
  const values = built.values as Record<string, unknown>;
  const db = await getDb();
  const { table, idCol, hasUpdatedAt } = tableFor(type);
  if (hasUpdatedAt) values.updatedAt = new Date();

  const isNew = !id || id === "new";
  if (isNew) {
    await db.insert(table as any).values(values as any);
  } else {
    await db.update(table as any).set(values as any).where(eq(idCol as any, id));
  }
  revalidatePath(`/admin/gear/${type}`);
  redirect(`/admin/gear/${type}`);
}

export async function deleteGearRow(formData: FormData): Promise<void> {
  await requireAdmin();
  const type = String(formData.get("__type") ?? "");
  const id = String(formData.get("__id") ?? "");
  if (!isGearType(type) || !id) return;
  const db = await getDb();
  const { table, idCol } = tableFor(type);
  await db.delete(table as any).where(eq(idCol as any, id));
  revalidatePath(`/admin/gear/${type}`);
  redirect(`/admin/gear/${type}`);
}
