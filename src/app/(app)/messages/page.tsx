import Link from "next/link";
import Image from "next/image";
import { desc, eq, or } from "drizzle-orm";
import { MessageCircle, UserCircle2 } from "lucide-react";
import { getDb, conversations, profiles, messages } from "@/db";
import { requireUser, getViewerLang } from "@/lib/auth-helpers";
import { t } from "@/lib/i18n";
import { PageHeader, EmptyState, ButtonLink, Card } from "@/components/ui";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireUser();
  const lang = await getViewerLang();
  const db = await getDb();

  const convos = await db.query.conversations.findMany({
    where: or(eq(conversations.userAId, user.id), eq(conversations.userBId, user.id)),
    orderBy: [desc(conversations.lastMessageAt)],
    with: {
      messages: { orderBy: [desc(messages.createdAt)], limit: 1 },
    },
  });

  // resolve the "other" participant's profile for each conversation
  const otherIds = convos.map((c) => (c.userAId === user.id ? c.userBId : c.userAId));
  const others =
    otherIds.length > 0
      ? await db.query.profiles.findMany({
          where: or(...otherIds.map((id) => eq(profiles.userId, id))),
        })
      : [];
  const byId = new Map(others.map((p) => [p.userId, p]));

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={t(lang, "page.messagesTitle")} subtitle="Direct messages with other anglers." />
      {convos.length === 0 ? (
        <EmptyState
          icon={<MessageCircle />}
          title="No messages yet"
          body="Find an angler in the community or via search, open their profile, and tap Message to start a conversation."
          action={<ButtonLink href="/community">Browse the community</ButtonLink>}
        />
      ) : (
        <div className="space-y-2">
          {convos.map((c) => {
            const otherId = c.userAId === user.id ? c.userBId : c.userAId;
            const p = byId.get(otherId);
            const last = c.messages[0];
            const unread = last && last.senderId !== user.id && !last.readAt;
            return (
              <Link key={c.id} href={`/messages/${c.id}`}>
                <Card className={`p-3.5 flex items-center gap-3 hover:shadow-lift transition-shadow ${unread ? "border-tide-300 bg-tide-50/40" : ""}`}>
                  {p?.avatarUrl ? (
                    <div className="relative size-11 rounded-full overflow-hidden bg-tide-100 shrink-0">
                      <Image src={p.avatarUrl} alt="" fill sizes="44px" className="object-cover" unoptimized={p.avatarUrl.startsWith("/api/")} />
                    </div>
                  ) : (
                    <UserCircle2 className="size-11 text-tide-300 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-ink-900 truncate">
                        {p?.displayName ?? "Angler"}
                      </span>
                      <span className="text-xs text-ink-300 whitespace-nowrap">
                        {new Date(c.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className={`text-sm truncate ${unread ? "font-semibold text-ink-900" : "text-ink-500"}`}>
                      {last?.senderId === user.id ? "You: " : ""}
                      {c.lastMessagePreview ?? "Say hello"}
                    </div>
                  </div>
                  {unread && <span className="size-2.5 rounded-full bg-bait-500 shrink-0" />}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
