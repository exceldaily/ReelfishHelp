import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { ArrowLeft, AlertTriangle, Video } from "lucide-react";
import { getDb, knots, species } from "@/db";
import { PageHeader, Card, Badge } from "@/components/ui";
import { USE_LABELS } from "@/components/gear/knot-browser";

const DIFF = ["", "Beginner", "Beginner", "Intermediate", "Advanced", "Expert"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const k = await db.query.knots.findFirst({ where: eq(knots.slug, slug) });
  return { title: k ? `How to tie the ${k.name}` : "Knot", description: k?.bestUse };
}

export default async function KnotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const k = await db.query.knots.findFirst({ where: eq(knots.slug, slug) });
  if (!k) notFound();

  const alts = k.alternatives.length ? await db.query.knots.findMany({ where: inArray(knots.slug, k.alternatives) }) : [];
  const relSpecies = k.species.length
    ? await db.query.species.findMany({ where: eq(species.active, true) }).then((all) => all.filter((s) => k.species.includes(s.slug)))
    : [];

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/gear/knots" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> All knots
      </Link>
      <PageHeader title={k.name} subtitle={k.bestUse} />

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="salt">{USE_LABELS[k.useCategory] ?? k.useCategory}</Badge>
        <Badge variant="neutral">{DIFF[k.difficulty]}</Badge>
        <Badge variant="outline">Strength {k.strengthRating}/5</Badge>
        {k.lineTypes.map((lt) => <Badge key={lt} variant="outline" className="capitalize">{lt}</Badge>)}
      </div>

      {/* steps */}
      <Card className="p-5 sm:p-6 mb-5">
        <h2 className="font-display font-bold text-ink-900 mb-4">How to tie it</h2>
        <ol className="space-y-4">
          {k.steps.map((s) => (
            <li key={s.n} className="flex gap-3.5">
              <span className="grid place-items-center size-7 rounded-full bg-tide-700 text-white text-sm font-bold shrink-0">{s.n}</span>
              <span className="text-[15px] text-ink-800 pt-0.5">{s.text}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* image / video placeholders (admin can fill later) */}
      {(k.imageUrl || k.videoUrl) && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          {k.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={k.imageUrl} alt={`${k.name} diagram`} className="rounded-2xl border border-sand-200 w-full" />
          )}
          {k.videoUrl && (
            <a href={k.videoUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-sand-200 bg-white p-5 flex items-center gap-3 hover:shadow-lift transition-shadow">
              <Video className="size-6 text-tide-700" /> <span className="font-semibold text-ink-800">Watch the video</span>
            </a>
          )}
        </div>
      )}

      {k.mistakes.length > 0 && (
        <Card className="p-5 mb-5">
          <h3 className="font-display font-bold text-ink-900 mb-2 flex items-center gap-2"><AlertTriangle className="size-4 text-bait-500" /> Common mistakes</h3>
          <ul className="space-y-1.5 text-sm text-ink-700">
            {k.mistakes.map((m, i) => <li key={i} className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-bait-400 shrink-0" />{m}</li>)}
          </ul>
        </Card>
      )}

      {k.whenNotToUse && (
        <Card className="p-5 mb-5">
          <h3 className="font-display font-bold text-ink-900 mb-1">When not to use it</h3>
          <p className="text-sm text-ink-700">{k.whenNotToUse}</p>
        </Card>
      )}

      {alts.length > 0 && (
        <div className="mb-5">
          <h3 className="font-display font-bold text-ink-900 mb-2">Alternative knots</h3>
          <div className="flex flex-wrap gap-2">
            {alts.map((a) => (
              <Link key={a.id} href={`/gear/knots/${a.slug}`}><Badge variant="salt" className="hover:bg-tide-200">{a.name}</Badge></Link>
            ))}
          </div>
        </div>
      )}

      {relSpecies.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-ink-900 mb-2">Good for these fish</h3>
          <div className="flex flex-wrap gap-2">
            {relSpecies.map((s) => (
              <Link key={s.id} href={`/fish/${s.slug}`}><Badge variant="outline" className="hover:bg-sand-100">{s.commonName}</Badge></Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
