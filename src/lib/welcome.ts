import { asc, eq } from "drizzle-orm";
import { conversations, follows, messages, profiles, users, type Db } from "@/db";
import { notify } from "@/lib/notify";

/** The founder's welcome DM, sent verbatim to every new angler. */
const WELCOME_MESSAGE = `Welcome to ReelFishHelp

My goal is to create a place where we help and learn as a community.

Share your catches, join crews, compare gear setups, ask questions, and connect with anglers who love fishing as much as you do.

Keep it respectful, helpful, and honest. No spam, scams, harassment, or stolen content. Follow local fishing laws and help us keep the community useful for everyone.

If you have any suggestions, please reach out to me.

Brad Harvey`;

/**
 * Post-signup welcome: the founder (earliest admin account) sends the new
 * angler a welcome DM and follows them, and they get a welcome notification.
 * Never throws — a failed welcome must not break account creation.
 */
export async function sendWelcome(db: Db, newUserId: string): Promise<void> {
  try {
    const founder = await db.query.users.findFirst({
      where: eq(users.role, "admin"),
      orderBy: [asc(users.createdAt)],
    });
    if (!founder || founder.id === newUserId) return;

    // welcome DM (canonical pair ordering: userAId < userBId)
    const [a, b] = founder.id < newUserId ? [founder.id, newUserId] : [newUserId, founder.id];
    let convo = await db.query.conversations.findFirst({
      where: (c, { and: andOp }) => andOp(eq(c.userAId, a), eq(c.userBId, b)),
    });
    if (!convo) {
      [convo] = await db.insert(conversations).values({ userAId: a, userBId: b }).returning();
    }
    await db.insert(messages).values({
      conversationId: convo.id,
      senderId: founder.id,
      body: WELCOME_MESSAGE,
    });
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date(), lastMessagePreview: WELCOME_MESSAGE.slice(0, 140) })
      .where(eq(conversations.id, convo.id));

    // the founder follows every new angler
    await db
      .insert(follows)
      .values({ followerId: founder.id, followingId: newUserId })
      .onConflictDoNothing();

    const founderProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, founder.id),
    });
    const founderName = founderProfile?.displayName ?? "Brad";
    await notify(db, {
      userId: newUserId,
      type: "welcome",
      title: `Welcome to ReelFishHelp! ${founderName} sent you a message`,
      body: "He also gave you a follow. Say hi, log your first catch, and check out the bite boards.",
      href: `/messages/${convo.id}`,
      dedupeKey: "welcome",
    });
  } catch (e) {
    console.error("[welcome] failed:", e instanceof Error ? e.message : e);
  }
}
