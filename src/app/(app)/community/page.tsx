import { desc, eq, isNull, lte, or } from "drizzle-orm";
import { verifiedTitleMap, primaryTitle } from "@/lib/verified";
import { Map, PlusCircle, Users } from "lucide-react";
import { getDb } from "@/db";
import { catches, userBlocks } from "@/db/schema";
import { auth } from "@/auth";
import { PageHeader, EmptyState, ButtonLink } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";
import { getViewerUnits } from "@/lib/auth-helpers";

export const metadata = { title: "Community" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ water?: string }>;
}) {
  const { water } = await searchParams;
  const session = await auth(); // session not required — public catches are public
  const units = await getViewerUnits();
  const db = await getDb();
  const blockedRows = session?.user
    ? await db
        .select()
        .from(userBlocks)
        .where(or(eq(userBlocks.blockerId, session.user.id), eq(userBlocks.blockedId, session.user.id)))
    : [];
  const blockedIds = new Set(blockedRows.flatMap((b) => [b.blockerId, b.blockedId]).filter((id) => id !== session?.user?.id));
  const rows = await db.query.catches.findMany({
    where: (c, { and }) => and(eq(c.visibility, "public"), or(isNull(c.publishAt), lte(c.publishAt, new Date()))),
    orderBy: [desc(catches.createdAt)],
    limit: 60,
    with: {
      species: true,
      photos: true,
      likes: true,
      comments: true,
      user: { with: { profile: true } },
    },
  });

  const titleMap = await verifiedTitleMap(db, rows.map((r) => r.userId));

  const filtered = water
    ? rows.filter((c) => !blockedIds.has(c.userId) && (water === "saltwater" ? c.species?.water === "saltwater" : c.species?.water === "freshwater"))
    : rows.filter((c) => !blockedIds.has(c.userId));

  return (
    <div>
      <PageHeader
        title="Community"
        subtitle="Public catches from anglers across the country. Location details stay approximate — always."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/boards" variant="secondary" size="sm">
              <Map className="size-4" /> Bite Boards
            </ButtonLink>
            <ButtonLink href="/report-a-bite" size="sm">
              <PlusCircle className="size-4" /> Report a Bite
            </ButtonLink>
            <div className="flex gap-1.5 rounded-xl bg-sand-100 p-1">
              {[
                ["", "All"],
                ["freshwater", "Freshwater"],
                ["saltwater", "Saltwater"],
              ].map(([v, label]) => (
                <a
                  key={label}
                  href={v ? `/community?water=${v}` : "/community"}
                  className={`inline-flex items-center min-h-10 rounded-lg px-3.5 py-1.5 text-sm font-bold ${
                    (water ?? "") === v ? "bg-white shadow-card text-ink-900" : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No public catches yet"
          body="Be the first — log a catch and set its visibility to public to share it with the community."
          action={<ButtonLink href="/catches/new">Log a catch</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
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
                  ? {
                      username: c.user.profile.username,
                      displayName: c.user.profile.displayName,
                      avatarUrl: c.user.profile.avatarUrl,
                    }
                  : null,
                likeCount: c.likes.length,
                commentCount: c.comments.length,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
