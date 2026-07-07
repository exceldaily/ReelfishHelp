"use server";

import { and, eq, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, conversations, messages, profiles, follows } from "@/db";
import { requireUser } from "@/lib/auth-helpers";

/** Canonical ordering so a user pair maps to exactly one conversation. */
function pair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Finds or creates the conversation between the current user and `otherUserId`. */
export async function openConversation(otherUserId: string): Promise<string | { error: string }> {
  const user = await requireUser();
  if (otherUserId === user.id) return { error: "You can't message yourself." };
  const db = await getDb();

  const other = await db.query.profiles.findFirst({ where: eq(profiles.userId, otherUserId) });
  if (!other) return { error: "That angler doesn't exist." };

  const [a, b] = pair(user.id, otherUserId);
  let convo = await db.query.conversations.findFirst({
    where: and(eq(conversations.userAId, a), eq(conversations.userBId, b)),
  });
  if (!convo) {
    [convo] = await db.insert(conversations).values({ userAId: a, userBId: b }).returning();
  }
  return convo.id;
}

/** Server action used by the "Message" button on a profile. */
export async function startConversation(otherUserId: string) {
  const res = await openConversation(otherUserId);
  if (typeof res === "string") redirect(`/messages/${res}`);
  return res; // { error }
}

export async function sendMessage(conversationId: string, body: string) {
  const user = await requireUser();
  const text = body.trim().slice(0, 4000);
  if (!text) return { error: "Message can't be empty." };
  const db = await getDb();

  const convo = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });
  if (!convo || (convo.userAId !== user.id && convo.userBId !== user.id)) {
    return { error: "Conversation not found." };
  }

  await db.insert(messages).values({ conversationId, senderId: user.id, body: text });
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date(), lastMessagePreview: text.slice(0, 140) })
    .where(eq(conversations.id, conversationId));

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { ok: true };
}

/** Marks all messages the other person sent in this conversation as read. */
export async function markConversationRead(conversationId: string) {
  const user = await requireUser();
  const db = await getDb();
  const unread = await db.query.messages.findMany({
    where: and(eq(messages.conversationId, conversationId)),
  });
  const toMark = unread.filter((m) => m.senderId !== user.id && !m.readAt);
  for (const m of toMark) {
    await db.update(messages).set({ readAt: new Date() }).where(eq(messages.id, m.id));
  }
  return { ok: true };
}

/** Count of conversations with at least one unread message for the current user. */
export async function unreadConversationCount(userId: string): Promise<number> {
  const db = await getDb();
  const convos = await db.query.conversations.findMany({
    where: or(eq(conversations.userAId, userId), eq(conversations.userBId, userId)),
    with: { messages: { orderBy: [desc(messages.createdAt)], limit: 1 } },
  });
  let n = 0;
  for (const c of convos) {
    const last = c.messages[0];
    if (last && last.senderId !== userId && !last.readAt) n++;
  }
  return n;
}

/** True when either user follows the other — used to gate first contact politely. */
export async function usersConnected(a: string, b: string): Promise<boolean> {
  const db = await getDb();
  const f = await db.query.follows.findFirst({
    where: or(
      and(eq(follows.followerId, a), eq(follows.followingId, b)),
      and(eq(follows.followerId, b), eq(follows.followingId, a))
    ),
  });
  return !!f;
}
