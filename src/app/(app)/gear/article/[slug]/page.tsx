import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Check, X, AlertTriangle } from "lucide-react";
import { getDb, gearArticles, species } from "@/db";
import { PageHeader, Card, Badge } from "@/components/ui";

const AREA_FOR: Record<string, string> = { rod: "rods", reel: "reels", line: "line", leader: "leaders", terminal: "terminal", concept: "rods" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const a = await db.query.gearArticles.findFirst({ where: eq(gearArticles.slug, slug) });
  return { title: a ? `${a.name} · Gear` : "Gear", description: a?.summary };
}

export default async function GearArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const a = await db.query.gearArticles.findFirst({ where: eq(gearArticles.slug, slug) });
  if (!a) notFound();
  const b = a.body;

  const related = a.relatedSpecies.length
    ? await db.query.species.findMany({ where: eq(species.active, true) }).then((all) => all.filter((s) => a.relatedSpecies.includes(s.slug)))
    : [];

  const facts: { label: string; value: string }[] = [
    b.lengthNote && { label: "Length", value: b.lengthNote },
    b.power && { label: "Power", value: b.power },
    b.action && { label: "Action", value: b.action },
    b.lineRange && { label: "Line range", value: b.lineRange },
    b.lureRange && { label: "Lure range", value: b.lureRange },
    b.bestReel && { label: "Best reel", value: b.bestReel },
    b.bestEnvironment && { label: "Best environment", value: b.bestEnvironment },
    b.bestSpeciesNote && { label: "Best species", value: b.bestSpeciesNote },
    b.underwaterVisibility && { label: "Underwater visibility", value: b.underwaterVisibility },
    b.stretch && { label: "Stretch", value: b.stretch },
    b.abrasion && { label: "Abrasion resistance", value: b.abrasion },
    b.casting && { label: "Casting", value: b.casting },
    b.knotStrength && { label: "Knot notes", value: b.knotStrength },
    b.sizeNote && { label: "Sizing", value: b.sizeNote },
    b.gearRatioNote && { label: "Gear ratio", value: b.gearRatioNote },
    b.dragNote && { label: "Drag", value: b.dragNote },
    ...(b.facts ?? []),
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/gear/${AREA_FOR[a.category]}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <PageHeader title={a.name} subtitle={a.summary} />

      {b.useCases?.length ? (
        <Card className="p-5 mb-5">
          <h2 className="font-display font-bold text-ink-900 mb-2">When to use it</h2>
          <ul className="space-y-1.5 text-sm text-ink-700">
            {b.useCases.map((t, i) => (
              <li key={i} className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-tide-400 shrink-0" />{t}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {(b.pros?.length || b.cons?.length) ? (
        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          {b.pros?.length ? (
            <Card className="p-5">
              <h3 className="font-display font-bold text-moss-700 mb-2">Strengths</h3>
              <ul className="space-y-1.5 text-sm text-ink-700">
                {b.pros.map((t, i) => <li key={i} className="flex gap-2"><Check className="size-4 text-moss-600 shrink-0 mt-0.5" />{t}</li>)}
              </ul>
            </Card>
          ) : null}
          {b.cons?.length ? (
            <Card className="p-5">
              <h3 className="font-display font-bold text-ink-700 mb-2">Weaknesses</h3>
              <ul className="space-y-1.5 text-sm text-ink-700">
                {b.cons.map((t, i) => <li key={i} className="flex gap-2"><X className="size-4 text-red-500 shrink-0 mt-0.5" />{t}</li>)}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      {facts.length > 0 && (
        <Card className="p-5 mb-5">
          <h3 className="font-display font-bold text-ink-900 mb-3">Key facts</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {facts.map((f, i) => (
              <div key={i} className="rounded-lg bg-sand-100/70 px-3 py-2 text-sm">
                <span className="font-semibold text-ink-700">{f.label}: </span>
                <span className="text-ink-600">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {b.mistakes?.length ? (
        <Card className="p-5 mb-5">
          <h3 className="font-display font-bold text-ink-900 mb-2 flex items-center gap-2"><AlertTriangle className="size-4 text-bait-500" /> Common mistakes</h3>
          <ul className="space-y-1.5 text-sm text-ink-700">
            {b.mistakes.map((t, i) => <li key={i} className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-bait-400 shrink-0" />{t}</li>)}
          </ul>
        </Card>
      ) : null}

      {related.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-ink-900 mb-2">Great for these fish</h3>
          <div className="flex flex-wrap gap-2">
            {related.map((s) => (
              <Link key={s.id} href={`/fish/${s.slug}`}>
                <Badge variant="salt" className="hover:bg-tide-200">{s.commonName}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
