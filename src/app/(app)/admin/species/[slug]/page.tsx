import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, species } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui";
import { AdminSpeciesForm } from "@/components/admin-species-form";

export const metadata = { title: "Admin — Edit Species" };

export default async function AdminSpeciesEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const db = await getDb();
  const s = await db.query.species.findFirst({ where: eq(species.slug, slug) });
  if (!s) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title={`Edit: ${s.commonName}`} subtitle={`/fish/${s.slug}`} />
      <AdminSpeciesForm
        s={{
          id: s.id,
          slug: s.slug,
          commonName: s.commonName,
          scientificName: s.scientificName,
          description: s.description,
          water: s.water,
          difficulty: s.difficulty,
          beginnerFriendly: s.beginnerFriendly,
          avgSize: s.avgSize,
          trophySize: s.trophySize,
          imageUrl: s.imageUrl,
          regions: s.regions,
          states: s.states,
          environments: s.environments,
          styles: s.styles,
          seasons: s.seasons,
          baitTypes: s.baitTypes,
          guideJson: JSON.stringify(s.guide, null, 2),
        }}
      />
    </div>
  );
}
