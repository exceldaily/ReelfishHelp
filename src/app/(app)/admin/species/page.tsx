import Link from "next/link";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader, Card, WaterBadge } from "@/components/ui";
import { SpeciesActiveToggle } from "@/components/admin-controls";

export const metadata = { title: "Admin — Species" };

export default async function AdminSpeciesPage() {
  await requireAdmin();
  const db = await getDb();
  const all = (await db.query.species.findMany()).sort((a, b) =>
    a.commonName.localeCompare(b.commonName)
  );

  return (
    <div>
      <PageHeader
        title="Species & Guides"
        subtitle={`${all.length} species in the database. New species can be added via the seed data files or directly in the database — the schema is built to grow.`}
      />
      <div className="space-y-2">
        {all.map((s) => (
          <Card key={s.id} className="p-3.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/species/${s.slug}`} className="font-bold text-sm text-ink-900 hover:text-tide-700">
                {s.commonName}
              </Link>
              <span className="ml-2 text-xs italic text-ink-300">{s.scientificName}</span>
            </div>
            <WaterBadge water={s.water} />
            <SpeciesActiveToggle id={s.id} active={s.active} />
            <Link href={`/admin/species/${s.slug}`} className="text-xs font-bold text-tide-700 hover:underline whitespace-nowrap">
              Edit →
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
