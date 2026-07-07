import { desc, eq } from "drizzle-orm";
import { getDb, spots } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { SpotsView } from "@/components/spots-view";

export const metadata = { title: "Saved Spots" };

export default async function SpotsPage() {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db.query.spots.findMany({
    where: eq(spots.userId, user.id),
    orderBy: [desc(spots.favorite), desc(spots.createdAt)],
  });

  return (
    <div>
      <PageHeader
        title="Saved Spots"
        subtitle="Your private fishing map. Exact coordinates are never shared publicly — you control every spot's privacy level."
      />
      <SpotsView spots={rows} />
    </div>
  );
}
