"use server";

import { and, count, desc, eq, isNull } from "drizzle-orm";
import { getDb, notifications } from "@/db";
import { requireUser } from "@/lib/auth-helpers";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  image: string | null;
  read: boolean;
  createdAt: string;
};

/** Recent notifications for the bell dropdown (newest first). */
export async function getNotifications(): Promise<NotificationItem[]> {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db.query.notifications.findMany({
    where: eq(notifications.userId, user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 20,
  });
  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href,
    image: n.image,
    read: n.readAt != null,
    createdAt: n.createdAt.toISOString(),
  }));
}

/** Marks every unread notification read (called when the panel is opened). */
export async function markNotificationsRead(): Promise<void> {
  const user = await requireUser();
  const db = await getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
}

/** Unread count for the nav bell (server layout use). */
export async function unreadNotificationCount(userId: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return Number(row.n);
}
