import { desc, eq } from "drizzle-orm";
import { getDb, species, spots } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { NewTripForm } from "@/components/new-trip-form";

export const metadata = { title: "Plan a Trip" };

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const db = await getDb();
  const [allSpecies, mySpots] = await Promise.all([
    db.query.species.findMany({ where: eq(species.active, true) }),
    db.query.spots.findMany({ where: eq(spots.userId, user.id), orderBy: [desc(spots.favorite)] }),
  ]);
  const speciesOptions = allSpecies
    .map((s) => ({ id: s.id, slug: s.slug, name: s.commonName }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const preselected = params.species
    ? allSpecies.find((s) => s.slug === params.species)?.id ?? null
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Plan a Trip"
        subtitle="Date, water, targets, checklists — with projected weather and tides for the day."
      />
      <NewTripForm
        speciesOptions={speciesOptions}
        spotOptions={mySpots.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng }))}
        preselectedSpeciesId={preselected}
      />
    </div>
  );
}
