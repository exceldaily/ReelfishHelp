import Link from "next/link";
import Image from "next/image";
import { desc, eq, isNull, lte, or } from "drizzle-orm";
import { Fish, Map, PlusCircle, Trophy, Waves } from "lucide-react";
import { getDb } from "@/db";
import { biteBoards, biteReports, catches } from "@/db/schema";
import { PageHeader, ButtonLink, Card } from "@/components/ui";
import { UsaBiteMap, type StateBoardStat } from "@/components/usa-bite-map";

export const metadata = { title: "Bite Boards" };

export default async function BoardsPage() {
  const db = await getDb();
  const [boards, recentReports, recentCatches] = await Promise.all([
    db.query.biteBoards.findMany({
      where: eq(biteBoards.active, true),
      with: { reports: true },
    }),
    db.query.biteReports.findMany({
      orderBy: [desc(biteReports.createdAt)],
      limit: 6,
      with: { board: true, species: true },
    }),
    db.query.catches.findMany({
      where: (c, { and }) => and(eq(c.visibility, "public"), or(isNull(c.publishAt), lte(c.publishAt, new Date()))),
      orderBy: [desc(catches.createdAt)],
      limit: 5,
      with: { species: true, photos: true, user: { with: { profile: true } } },
    }),
  ]);

  const stats: Record<string, StateBoardStat> = {};
  let totalPublic = 0;
  for (const board of boards) {
    const count = board.reports.filter((r) => r.visibility === "public_area" || r.visibility === "public_no_area").length;
    stats[board.slug] = { name: board.name, count };
    totalPublic += count;
  }

  const publicRecent = recentReports.filter((r) => r.board?.active && (r.visibility === "public_area" || r.visibility === "public_no_area"));

  return (
    <div>
      <PageHeader
        title="Bite Boards"
        subtitle="Broad local fishing intel: what people are seeing, catching, and using without exposing exact spots."
        action={
          <ButtonLink href="/report-a-bite">
            <PlusCircle className="size-4" /> Report a bite
          </ButtonLink>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* min-w-0 lets the wide tile grid scroll inside the card instead of stretching the page */}
        <Card className="p-4 sm:p-6 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-display font-bold text-ink-900 flex items-center gap-2">
              <Map className="size-5 text-tide-700" /> What&apos;s biting across the country
            </h2>
            <span className="text-xs font-semibold text-ink-500">{totalPublic} public reports</span>
          </div>
          <UsaBiteMap stats={stats} />
          <p className="mt-4 text-xs text-ink-500">
            Tap a state to open its bite board: recent reports, local questions, and broad conditions. Exact spots are never shown.
          </p>
        </Card>

        <aside className="space-y-4 min-w-0">
          <Card className="p-5">
            <h2 className="font-display font-bold text-ink-900 flex items-center gap-2">
              <Trophy className="size-5 text-tide-700" />
              Recent Catches
            </h2>
            <div className="mt-3 space-y-2.5">
              {recentCatches.length === 0 ? (
                <p className="text-sm text-ink-500">No public catches yet. Log one and show the community what&apos;s biting.</p>
              ) : (
                recentCatches.map((c) => {
                  const photo = c.photos[0]?.url ?? null;
                  const name = c.species?.commonName ?? c.customSpeciesName ?? "Mystery fish";
                  const specs = [
                    c.lengthIn != null ? `${c.lengthIn}"` : null,
                    c.weightLb != null ? `${c.weightLb} lb` : null,
                  ].filter(Boolean).join(" · ");
                  return (
                    <Link key={c.id} href={`/catch/${c.id}`} className="flex items-center gap-3 rounded-xl bg-sand-100/70 p-2.5 hover:bg-sand-100">
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-tide-900 grid place-items-center">
                        {photo ? (
                          <Image src={photo} alt="" fill sizes="48px" className="object-cover" unoptimized={photo.startsWith("/api/")} />
                        ) : (
                          <Fish className="size-5 text-tide-400" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-ink-900">{name}</span>
                        <span className="block truncate text-xs text-ink-500">
                          {c.user?.profile?.displayName ?? "An angler"}
                          {specs ? ` · ${specs}` : ""}
                        </span>
                        <span className="block text-[11px] text-ink-500">
                          {new Date(c.caughtAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
            <ButtonLink href="/community" variant="secondary" size="sm" className="mt-3 w-full">
              See the full community feed
            </ButtonLink>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-bold text-ink-900 flex items-center gap-2">
              <Waves className="size-5 text-tide-700" />
              Fresh Reports
            </h2>
            <div className="mt-3 space-y-3">
              {publicRecent.length === 0 ? (
                <p className="text-sm text-ink-500">No public bite reports yet. Be the first to post useful local intel.</p>
              ) : (
                publicRecent.map((r) => (
                  <Link key={r.id} href={r.board ? `/boards/${r.board.slug}` : "/boards"} className="block rounded-xl bg-sand-100/70 p-3 hover:bg-sand-100">
                    <div className="text-sm font-bold text-ink-900">{r.species?.commonName ?? r.customSpecies ?? "Unknown species"}</div>
                    <div className="text-xs text-ink-500">
                      {r.board?.name ?? "Unassigned"} {r.bait ? `- ${r.bait}` : ""}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
