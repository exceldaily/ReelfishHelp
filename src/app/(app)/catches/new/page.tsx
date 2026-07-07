import { eq } from "drizzle-orm";
import { getDb, species } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { NewCatchForm } from "@/components/new-catch-form";

export const metadata = { title: "Log a Catch" };

export default async function NewCatchPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string; custom?: string; photo?: string; trip?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getDb();
  const all = await db.query.species.findMany({ where: eq(species.active, true) });
  const options = all
    .map((s) => ({ id: s.id, slug: s.slug, name: s.commonName }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const preselected = params.species ? options.find((o) => o.slug === params.species) ?? null : null;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Log a Catch" subtitle="Photos, measurements, conditions — build your fishing record." />
      <NewCatchForm
        speciesOptions={options}
        preselectedId={preselected?.id ?? null}
        customName={params.custom ?? null}
        existingPhotoUrl={params.photo ?? null}
        tripId={params.trip ?? null}
      />
    </div>
  );
}
