import Link from "next/link";
import { verifiedTitleMap, primaryTitle } from "@/lib/verified";
import { VerifiedTitleBadge } from "@/components/verified-badge";
import Image from "next/image";
import { ilike, or, ne, and, eq } from "drizzle-orm";
import { Search, UserCircle2, Users } from "lucide-react";
import { getDb, profiles } from "@/db";
import { auth } from "@/auth";
import { PageHeader, Card, WaterBadge, Badge, EmptyState } from "@/components/ui";

export const metadata = { title: "Find Anglers" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const session = await auth();
  const db = await getDb();

  let results: (typeof profiles.$inferSelect)[] = [];
  if (query.length >= 1) {
    const like = `%${query}%`;
    results = await db.query.profiles.findMany({
      where: and(
        or(ilike(profiles.username, like), ilike(profiles.displayName, like)),
        ne(profiles.visibility, "private"),
        session?.user ? ne(profiles.userId, session.user.id) : undefined
      ),
      limit: 30,
    });
  }

  const titleMap = await verifiedTitleMap(db, results.map((r) => r.userId));

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Find Anglers" subtitle="Search by username or display name." />

      <form method="GET" className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink-300" />
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search anglers…"
            className="w-full rounded-2xl border border-sand-300 bg-white pl-12 pr-4 py-3.5 text-base focus:outline-2 focus:outline-tide-500"
            autoComplete="off"
          />
        </div>
      </form>

      {query.length === 0 ? (
        <EmptyState icon={<Users />} title="Search for anglers" body="Type a name or username to find people to follow and message." />
      ) : results.length === 0 ? (
        <EmptyState icon={<Search />} title={`No anglers match “${query}”`} body="Try a different spelling, or just part of the name." />
      ) : (
        <div className="space-y-2">
          {results.map((p) => (
            <Link key={p.userId} href={`/u/${p.username}`}>
              <Card className="p-3.5 flex items-center gap-3 hover:shadow-lift transition-shadow">
                {p.avatarUrl ? (
                  <div className="relative size-11 rounded-full overflow-hidden bg-tide-100 shrink-0">
                    <Image src={p.avatarUrl} alt="" fill sizes="44px" className="object-cover" unoptimized={p.avatarUrl.startsWith("/api/")} />
                  </div>
                ) : (
                  <UserCircle2 className="size-11 text-tide-300 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-ink-900 truncate inline-flex items-center gap-1.5">
                    {p.displayName}
                    <VerifiedTitleBadge slug={primaryTitle(titleMap.get(p.userId))} compact />
                  </div>
                  <div className="text-xs text-ink-500">@{p.username}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <WaterBadge water={p.waterPref} />
                  {p.homeState && <Badge variant="outline">{p.homeState}</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
