import { desc, eq } from "drizzle-orm";
import { Trophy } from "lucide-react";
import { getDb, catches } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { PageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";

export const metadata = { title: "My Catches" };

export default async function MyCatchesPage() {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db.query.catches.findMany({
    where: eq(catches.userId, user.id),
    orderBy: [desc(catches.caughtAt)],
    with: { species: true, photos: true, likes: true, comments: true },
  });

  return (
    <div>
      <PageHeader
        title="My Catches"
        subtitle={`${rows.length} logged catch${rows.length === 1 ? "" : "es"} — your personal fishing record.`}
        action={<ButtonLink href="/catches/new"><Trophy className="size-4" /> Log a catch</ButtonLink>}
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={<Trophy />}
          title="No catches logged yet"
          body="Your next fish belongs here — with photos, measurements, and the conditions that made it happen."
          action={<ButtonLink href="/catches/new">Log your first catch</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
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
                showLocation: true, // owner always sees their own location label
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
