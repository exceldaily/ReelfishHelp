import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { ArrowLeft, Search, Shield, UserCircle2 } from "lucide-react";
import { getDb, users, catches, forumQuestions, userBadges } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader, Card, Badge } from "@/components/ui";
import { AdminBadgeManager } from "@/components/admin-badge-manager";

export const metadata = { title: "Users · Admin" };

function shortDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q } = await searchParams;
  const db = await getDb();

  const [allUsers, catchCounts, qCounts, badgeRows] = await Promise.all([
    db.query.users.findMany({ with: { profile: true }, orderBy: [desc(users.createdAt)] }),
    db.select({ userId: catches.userId, n: count() }).from(catches).groupBy(catches.userId),
    db.select({ userId: forumQuestions.userId, n: count() }).from(forumQuestions).groupBy(forumQuestions.userId),
    db.query.userBadges.findMany(),
  ]);
  const catchMap = new Map(catchCounts.map((r) => [r.userId, Number(r.n)]));
  const qMap = new Map(qCounts.map((r) => [r.userId, Number(r.n)]));
  const badgeMap = new Map<string, string[]>();
  for (const b of badgeRows) badgeMap.set(b.userId, [...(badgeMap.get(b.userId) ?? []), b.badgeSlug]);

  const needle = (q ?? "").trim().toLowerCase();
  const rows = needle
    ? allUsers.filter((u) =>
        [u.email, u.profile?.username, u.profile?.displayName].some((v) => v?.toLowerCase().includes(needle))
      )
    : allUsers;

  const admins = allUsers.filter((u) => u.role === "admin").length;

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Admin
      </Link>
      <PageHeader
        title="Users"
        subtitle={`${allUsers.length} total, ${admins} admin${admins === 1 ? "" : "s"}.`}
      />

      <form method="GET" className="relative mb-5 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, username, or email…"
          className="w-full rounded-xl border border-sand-300 bg-white pl-10 pr-4 py-2.5 text-[15px] focus:outline-2 focus:outline-tide-500"
        />
      </form>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-500 border-b border-sand-200">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold">Badges</th>
                <th className="py-3 px-3 font-semibold">State</th>
                <th className="py-3 px-3 font-semibold text-right">Catches</th>
                <th className="py-3 px-3 font-semibold text-right">Questions</th>
                <th className="py-3 px-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const p = u.profile;
                return (
                  <tr key={u.id} className="border-b border-sand-100 hover:bg-sand-50/60">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {p?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.avatarUrl} alt="" className="size-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <UserCircle2 className="size-8 text-ink-300 shrink-0" />
                        )}
                        <div className="min-w-0">
                          {p?.username ? (
                            <Link href={`/u/${p.username}`} className="font-semibold text-ink-900 hover:text-tide-700 block truncate">
                              {p.displayName ?? p.username}
                            </Link>
                          ) : (
                            <span className="font-semibold text-ink-400">No profile</span>
                          )}
                          {p?.username && <div className="text-xs text-ink-400 truncate">@{p.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-ink-600 whitespace-nowrap">{u.email}</td>
                    <td className="py-2.5 px-3">
                      {u.role === "admin" ? (
                        <Badge variant="dark"><Shield className="size-3" /> Admin</Badge>
                      ) : (
                        <Badge variant="neutral">User</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <AdminBadgeManager userId={u.id} granted={badgeMap.get(u.id) ?? []} />
                    </td>
                    <td className="py-2.5 px-3 text-ink-600">{p?.homeState ?? "-"}</td>
                    <td className="py-2.5 px-3 text-right text-ink-700 font-semibold">{catchMap.get(u.id) ?? 0}</td>
                    <td className="py-2.5 px-3 text-right text-ink-700 font-semibold">{qMap.get(u.id) ?? 0}</td>
                    <td className="py-2.5 px-4 text-ink-500 whitespace-nowrap">{shortDate(u.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {rows.length === 0 && <p className="mt-4 text-sm text-ink-500">No users match that search.</p>}
    </div>
  );
}
