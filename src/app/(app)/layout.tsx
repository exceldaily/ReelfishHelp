import { auth } from "@/auth";
import { getProfile } from "@/lib/auth-helpers";
import { TopNav, MobileTabs, type NavUser } from "@/components/nav";
import { dbMode } from "@/db";
import { fishIdEnabled } from "@/lib/flags";
import { unreadConversationCount } from "@/lib/actions/message-actions";
import { unreadNotificationCount } from "@/lib/actions/notification-actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let user: NavUser = null;
  let unread = 0;
  let unreadNotifs = 0;
  if (session?.user) {
    const profile = await getProfile(session.user.id);
    user = {
      id: session.user.id,
      name: profile?.displayName ?? session.user.name ?? "Angler",
      username: profile?.username ?? session.user.username,
      role: session.user.role,
      avatarUrl: profile?.avatarUrl ?? null,
    };
    unread = await unreadConversationCount(session.user.id).catch(() => 0);
    unreadNotifs = await unreadNotificationCount(session.user.id).catch(() => 0);
  }
  const localDb = dbMode() === "pglite" || !!process.env.DATABASE_URL === false;

  const fishId = fishIdEnabled();

  return (
    <div className="min-h-dvh flex flex-col app-bg">
      <TopNav user={user} fishId={fishId} unread={unread} unreadNotifications={unreadNotifs} />
      {localDb && (
        <div className="bg-bait-100 text-bait-700 text-center text-xs font-semibold py-1.5 px-4">
          Local development database (PGlite) — set DATABASE_URL to connect Neon Postgres for production.
        </div>
      )}
      <main className="flex-1 w-full mx-auto max-w-6xl px-4 py-6 pb-24 lg:pb-10">{children}</main>
      <MobileTabs user={user} fishId={fishId} />
    </div>
  );
}
