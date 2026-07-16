import { eq } from "drizzle-orm";
import { pushSubscriptions, type Db } from "@/db";

/**
 * Web Push sending. Gated on VAPID env vars — without them everything here is
 * a silent no-op, so dev and un-configured deployments never break.
 *
 * Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...),
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY (same public key, exposed to the client).
 */

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export type PushPayload = {
  title: string;
  body?: string;
  href?: string;
  image?: string;
  tag?: string;
};

/** Send a push to every device the user has subscribed. Never throws. */
export async function sendPushToUser(db: Db, userId: string, payload: PushPayload): Promise<void> {
  if (!pushConfigured()) return;
  try {
    const subs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    });
    if (subs.length === 0) return;

    const webpush = (await import("web-push")).default;
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:hello@reelfishhelp.com",
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const body = JSON.stringify(payload);
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            body,
            { TTL: 60 * 60 * 24 }
          );
        } catch (e: unknown) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            // device unsubscribed or expired — prune it
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
          } else {
            console.error("[push] send failed:", status, e instanceof Error ? e.message : e);
          }
        }
      })
    );
  } catch (e) {
    console.error("[push] failed:", e instanceof Error ? e.message : e);
  }
}
