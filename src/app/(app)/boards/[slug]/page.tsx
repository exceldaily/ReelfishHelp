import Link from "next/link";
import { verifiedTitleMap, primaryTitle, latestVerifiedReports } from "@/lib/verified";
import { VerifiedReportCard } from "@/components/verified-report-card";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray, or, isNull, lte } from "drizzle-orm";
import { CalendarDays, Fish, MessageCircle, PlusCircle, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { biteBoards, biteReports, catches, userBlocks } from "@/db/schema";
import { BiteReportCard } from "@/components/bite-report-card";
import { CatchCard } from "@/components/catch-card";
import { getViewerUnits, getProfile } from "@/lib/auth-helpers";
import { toRegion } from "@/lib/regions";
import { FORUM_TOPICS } from "@/data/forum-topics";
import { Badge, ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const board = await db.query.biteBoards.findFirst({ where: and(eq(biteBoards.slug, slug), eq(biteBoards.active, true)) });
  return { title: board ? `${board.name} Bite Board` : "Bite Board" };
}

function topValue<T extends string | null>(items: T[]): string | null {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = item?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function whatsBiting(reports: { speciesName: string; bait: string | null; method: string | null }[]) {
  if (reports.length === 0) return "No public reports in the last 7 days yet. Add one when you see activity.";
  const species = topValue(reports.map((r) => r.speciesName));
  const bait = topValue(reports.map((r) => r.bait));
  const method = topValue(reports.map((r) => r.method));
  return `In the last 7 days, ${species ?? "fish"} reports here were most common${bait ? ` on ${bait}` : ""}${method ? ` using ${method}` : ""}.`;
}

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const board = await db.query.biteBoards.findFirst({ where: and(eq(biteBoards.slug, slug), eq(biteBoards.active, true)) });
  if (!board) notFound();

  const session = await auth();
  const units = await getViewerUnits();

  // boards belong to one region's community — cross-region links 404
  const viewerProfile = session?.user ? await getProfile(session.user.id) : null;
  if (board.region !== toRegion(viewerProfile?.region)) notFound();
  const blockedRows = session?.user
    ? await db
        .select()
        .from(userBlocks)
        .where(or(eq(userBlocks.blockerId, session.user.id), eq(userBlocks.blockedId, session.user.id)))
    : [];
  const blockedIds = new Set(blockedRows.flatMap((b) => [b.blockerId, b.blockedId]).filter((id) => id !== session?.user?.id));

  const reports = (
    await db.query.biteReports.findMany({
      where: eq(biteReports.boardId, board.id),
      orderBy: [desc(biteReports.createdAt)],
      limit: 60,
      with: {
        board: true,
        species: true,
        user: { with: { profile: true } },
      },
    })
  ).filter((r) => {
    if (blockedIds.has(r.userId)) return false;
    if (r.userId === session?.user?.id) return true;
    return r.visibility === "public_area" || r.visibility === "public_no_area";
  });

  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recentPublic = reports
    .filter((r) => (r.visibility === "public_area" || r.visibility === "public_no_area") && new Date(r.createdAt).getTime() >= sevenDaysAgo)
    .map((r) => ({
      speciesName: r.species?.commonName ?? r.customSpecies ?? "Unknown species",
      bait: r.bait,
      method: r.method,
    }));

  const boardCatches = (
    await db.query.catches.findMany({
      where: eq(catches.visibility, "public"),
      orderBy: [desc(catches.createdAt)],
      limit: 60,
      with: { species: true, photos: true, likes: true, comments: true, user: { with: { profile: true } } },
    })
  ).filter((c) => {
    if (blockedIds.has(c.userId)) return false;
    if (c.publishAt && new Date(c.publishAt).getTime() > Date.now()) return false;
    const label = (c.broadAreaLabel ?? c.locationLabel ?? "").toLowerCase();
    return label.includes(board.regionLabel.toLowerCase()) || label.includes(board.name.toLowerCase());
  });

  const titleMap = await verifiedTitleMap(db, [
    ...reports.map((r) => r.userId),
    ...boardCatches.map((c) => c.userId),
  ]);
  const verifiedReports = await latestVerifiedReports(db, { boardId: board.id, limit: 4 });

  return (
    <div>
      <PageHeader
        title={board.name}
        subtitle={board.description}
        action={
          <ButtonLink href={`/report-a-bite?board=${board.slug}`}>
            <PlusCircle className="size-4" /> Report here
          </ButtonLink>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={board.water === "saltwater" ? "salt" : board.water === "freshwater" ? "fresh" : "both"}>
                {board.water === "both" ? "Fresh + Salt" : board.water}
              </Badge>
              <Badge variant="outline">{board.regionLabel}</Badge>
              {board.state && <Badge variant="neutral">{board.state}</Badge>}
            </div>
            <h2 className="mt-4 flex items-center gap-2 font-display text-xl font-bold text-ink-900">
              <TrendingUp className="size-5 text-tide-700" />
              What's Biting?
            </h2>
            <p className="mt-2 text-sm text-ink-700 leading-relaxed">{whatsBiting(recentPublic)}</p>
            <p className="mt-2 text-xs font-semibold text-ink-400 uppercase tracking-wide">
              Community-reported local activity - not guaranteed advice
            </p>
          </Card>

          <section>
            {verifiedReports.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Pro Reports</h2>
                <div className="space-y-3">
                  {verifiedReports.map((r) => (
                    <VerifiedReportCard key={r.id} report={r} />
                  ))}
                </div>
              </div>
            )}
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Recent Bite Reports</h2>
            {reports.length === 0 ? (
              <EmptyState
                icon={<Fish />}
                title="No bite reports yet"
                body="Post broad, useful intel for this board without giving away exact spots."
                action={<ButtonLink href={`/report-a-bite?board=${board.slug}`}>Post Bite Report</ButtonLink>}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {reports.map((r) => (
                  <BiteReportCard
                    key={r.id}
                    report={{
                      id: r.id,
                      speciesName: r.species?.commonName ?? r.customSpecies ?? "Unknown species",
                      outcome: r.outcome,
                      bait: r.bait,
                      method: r.method,
                      timeOfDay: r.timeOfDay,
                      notes: r.notes,
                      photoUrl: r.photoUrl,
                      broadAreaLabel: r.visibility === "public_area" || r.userId === session?.user?.id ? r.broadAreaLabel : null,
                      createdAt: r.createdAt,
                      board: { slug: board.slug, name: board.name },
                      verifiedTitle: primaryTitle(titleMap.get(r.userId)),
                      author: r.user.profile ? { username: r.user.profile.username, displayName: r.user.profile.displayName } : null,
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">Community Catches In This Area</h2>
            {boardCatches.length === 0 ? (
              <Card className="p-5 text-sm text-ink-500">No public delayed-share catches are tagged to this broad area yet.</Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {boardCatches.slice(0, 8).map((c) => (
                  <CatchCard
                    key={c.id}
                    units={units}
                    c={{
                      id: c.id,
                      speciesName: c.species?.commonName ?? c.customSpeciesName ?? "Unknown species",
                      photoUrl: c.photos[0]?.url ?? null,
                      caughtAt: c.caughtAt,
                      lengthIn: c.lengthIn,
                      weightLb: c.weightLb,
                      bait: c.bait,
                      released: c.released,
                      visibility: c.visibility,
                      locationLabel: c.broadAreaLabel ?? c.locationLabel,
                      showLocation: !!(c.broadAreaLabel ?? (c.showLocation ? c.locationLabel : null)),
                      verifiedTitle: primaryTitle(titleMap.get(c.userId)),
                      author: c.user.profile
                        ? { username: c.user.profile.username, displayName: c.user.profile.displayName, avatarUrl: c.user.profile.avatarUrl }
                        : null,
                      likeCount: c.likes.length,
                      commentCount: c.comments.length,
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-display font-bold text-ink-900">
              <CalendarDays className="size-5 text-tide-700" />
              Board Stats
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Public reports</dt>
                <dd className="font-bold text-ink-900">{reports.filter((r) => r.visibility.startsWith("public")).length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Last 7 days</dt>
                <dd className="font-bold text-ink-900">{recentPublic.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Broad area</dt>
                <dd className="font-bold text-ink-900 text-right">{board.regionLabel}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-display font-bold text-ink-900">
              <MessageCircle className="size-5 text-tide-700" />
              Ask {board.name.replace(/ Bite Board$/, "")} anglers
            </h2>
            <p className="mt-1 text-sm text-ink-500">Forum questions for this state, by topic.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FORUM_TOPICS.map((t) => (
                <Link
                  key={t.slug}
                  href={`/forum?board=${board.id}&topic=${t.slug}`}
                  className="rounded-full bg-sand-100 px-3 py-1 text-xs font-bold text-ink-600 transition-colors hover:bg-sand-200"
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <ButtonLink href={`/forum?board=${board.id}`} variant="secondary" className="mt-4 w-full justify-center">
              All {board.name.replace(/ Bite Board$/, "")} questions
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </div>
  );
}
