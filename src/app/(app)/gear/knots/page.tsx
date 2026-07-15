import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb, knots } from "@/db";
import { PageHeader } from "@/components/ui";
import { KnotBrowser } from "@/components/gear/knot-browser";

export const metadata = {
  title: "Knots · Gear",
  description: "20 essential fishing knots with plain-language, step-by-step instructions — grouped by what you're tying.",
};

export default async function KnotsPage() {
  const db = await getDb();
  const rows = await db.query.knots.findMany({ where: eq(knots.status, "published"), orderBy: [asc(knots.sort)] });
  const lite = rows.map((k) => ({
    slug: k.slug,
    name: k.name,
    useCategory: k.useCategory,
    bestUse: k.bestUse,
    difficulty: k.difficulty,
    strengthRating: k.strengthRating,
  }));

  return (
    <div>
      <Link href="/gear" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> All gear
      </Link>
      <PageHeader
        title="Knots"
        subtitle="Pick what you're trying to tie and we'll show the best knots for it — with simple, short steps."
      />
      <KnotBrowser knots={lite} />
    </div>
  );
}
