import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { getDb, conversations, messages, profiles } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { MessageThread } from "@/components/message-thread";

export const metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getDb();

  const convo = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!convo || (convo.userAId !== user.id && convo.userBId !== user.id)) notFound();

  const otherId = convo.userAId === user.id ? convo.userBId : convo.userAId;
  const [other, msgs] = await Promise.all([
    db.query.profiles.findFirst({ where: eq(profiles.userId, otherId) }),
    db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: [asc(messages.createdAt)],
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-3">
        <Link href="/messages" className="text-ink-500 hover:text-ink-900">
          <ArrowLeft className="size-5" />
        </Link>
        <Link href={other ? `/u/${other.username}` : "#"} className="flex items-center gap-2.5 group">
          {other?.avatarUrl ? (
            <div className="relative size-9 shrink-0 rounded-full overflow-hidden bg-tide-100">
              <Image src={other.avatarUrl} alt="" fill sizes="36px" className="object-cover" unoptimized={other.avatarUrl.startsWith("/api/")} />
            </div>
          ) : (
            <UserCircle2 className="size-9 text-tide-300" />
          )}
          <div>
            <div className="font-display font-bold text-ink-900 group-hover:text-tide-700 leading-tight">
              {other?.displayName ?? "Angler"}
            </div>
            {other && <div className="text-xs text-ink-500">@{other.username}</div>}
          </div>
        </Link>
      </div>

      <MessageThread
        conversationId={id}
        currentUserId={user.id}
        otherUserId={otherId}
        otherName={other?.displayName?.split(" ")[0] ?? "them"}
        initialMessages={msgs.map((m) => ({
          id: m.id,
          body: m.body,
          senderId: m.senderId,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
