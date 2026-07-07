import { desc, eq } from "drizzle-orm";
import { Users } from "lucide-react";
import { getDb, catches } from "@/db";
import { auth } from "@/auth";
import { PageHeader, EmptyState, ButtonLink } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";

export const metadata = { title: "Community" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ water?: string }>;
}) {
  const { water } = await searchParams;
  await auth(); // session not required — public catches are public
  const db = await getDb();
  const rows = await db.query.catches.findMany({
    where: eq(catches.visibility, "public"),
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

  const filtered = water
    ? rows.filter((c) => (water === "saltwater" ? c.species?.water === "saltwater" : c.species?.water === "freshwater"))
    : rows;

  return (
    <div>
      <PageHeader
        title="Community"
        subtitle="Public catches from anglers across the country. Location details stay approximate — always."
        action={
          <div className="flex gap-1.5 rounded-xl bg-sand-100 p-1">
            {[
              ["", "All"],
              ["freshwater", "Freshwater"],
              ["saltwater", "Saltwater"],
            ].map(([v, label]) => (
              <a
                key={label}
                href={v ? `/community?water=${v}` : "/community"}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-bold ${
                  (water ?? "") === v ? "bg-white shadow-card text-ink-900" : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {label}
              </a>
            ))}
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
                locationLabel: c.locationLabel,
                showLocation: c.showLocation,
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
