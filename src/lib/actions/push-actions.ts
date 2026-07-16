"use server";

import { and, eq } from "drizzle-orm";
import { getDb, pushSubscriptions } from "@/db";
import { requireUser } from "@/lib/auth-helpers";

/** Stores (or re-associates) a device's push subscription for the signed-in user. */
export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<{ ok: true } | { error: string }> {
  const user = await requireUser();
  if (!input.endpoint?.startsWith("https://") || !input.p256dh || !input.auth) {
    return { error: "Invalid subscription." };
  }
  const db = await getDb();
  // endpoint is unique per device; if it exists (e.g. account switch), re-own it
  await db
    .insert(pushSubscriptions)
    .values({ userId: user.id, endpoint: input.endpoint, p256dh: input.p256dh, auth: input.auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: user.id, p256dh: input.p256dh, auth: input.auth },
    });
  return { ok: true };
}

/** Removes this device's subscription (user turned notifications off). */
export async function removePushSubscription(endpoint: string): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, endpoint)));
}
