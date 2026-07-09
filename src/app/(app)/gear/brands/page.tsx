import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb, gearBrands, type GearBrand } from "@/db";
import { PageHeader, Card, Badge, SectionTitle, WaterBadge } from "@/components/ui";

export const metadata = {
  title: "Brands · Gear",
  description: "A factual directory of rod, reel, line, and tackle brands — what each is known for and who it suits. No 'best brand' hype.",
};

const GROUPS: { key: string; label: string }[] = [
  { key: "rod", label: "Rod brands" },
  { key: "reel", label: "Reel brands" },
  { key: "line", label: "Line brands" },
  { key: "tackle", label: "Tackle & lure brands" },
];

function BrandCard({ b }: { b: GearBrand }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-ink-900">{b.name}</h3>
        <WaterBadge water={b.water} />
      </div>
      <p className="mt-1.5 text-sm text-ink-600">{b.reputation}</p>
      {b.bestKnownFor.length > 0 && (
        <p className="mt-2 text-sm text-ink-500"><span className="font-semibold text-ink-700">Known for:</span> {b.bestKnownFor.join(" · ")}</p>
      )}
      {b.beginnerNotes && (
        <p className="mt-2 text-xs text-tide-800 bg-tide-50 rounded-lg px-2.5 py-1.5">{b.beginnerNotes}</p>
      )}
    </Card>
  );
}

export default async function BrandsPage() {
  const db = await getDb();
  const all = await db.query.gearBrands.findMany({ where: eq(gearBrands.status, "published"), orderBy: [asc(gearBrands.sort)] });

  return (
    <div>
      <Link href="/gear" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> All gear
      </Link>
      <PageHeader
        title="Brands"
        subtitle="An honest, practical look at the major fishing brands — what they make and who they're for. No paid rankings."
      />
      <div className="space-y-8">
        {GROUPS.map((g) => {
          const brands = all.filter((b) => b.categories.includes(g.key));
          if (brands.length === 0) return null;
          return (
            <section key={g.key}>
              <SectionTitle>{g.label}</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {brands.map((b) => <BrandCard key={b.id} b={b} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
