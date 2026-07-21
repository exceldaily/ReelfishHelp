import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { getDb, gearArticles, fishGearRequirements, species, type GearArticle } from "@/db";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/ui";
import { rodGuideCards, reelGuideCards, lineGuideCards, lineComparisons, leaderSetups } from "@/data/gear";

type AreaCfg = {
  cat: GearArticle["category"];
  concept: string | null;
  title: string;
  subtitle: string;
  guide?: { title: string; why: string; rod?: string; reel?: string; pick?: string }[];
};

const AREA: Record<string, AreaCfg> = {
  rods: { cat: "rod", concept: "rod", title: "Rods", subtitle: "Length, power, and action decoded — plus the right rod for every kind of fishing.", guide: rodGuideCards },
  reels: { cat: "reel", concept: "reel", title: "Reels", subtitle: "Sizing, gear ratio, and drag — and which reel type fits your fishing.", guide: reelGuideCards },
  line: { cat: "line", concept: null, title: "Fishing Line", subtitle: "Mono, fluoro, braid, and more — with honest strengths, weaknesses, and comparisons.", guide: lineGuideCards },
  leaders: { cat: "leader", concept: "leader", title: "Leaders", subtitle: "When you need a leader and how to pick the right material and strength." },
  terminal: { cat: "terminal", concept: null, title: "Terminal Tackle", subtitle: "Hooks, weights, floats, connectors, and the rigs that tie them together." },
};

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const cfg = AREA[area];
  return { title: cfg ? `${cfg.title} · Gear` : "Gear", description: cfg?.subtitle };
}

function Bullets({ items, className = "" }: { items?: string[]; className?: string }) {
  if (!items?.length) return null;
  return (
    <ul className={`space-y-1 text-sm text-ink-600 ${className}`}>
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 size-1.5 rounded-full bg-tide-400 shrink-0" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function TypeCard({ a }: { a: GearArticle }) {
  const b = a.body;
  const facts = [b.power, b.action, b.lineRange, b.underwaterVisibility, b.stretch].filter(Boolean).slice(0, 2) as string[];
  return (
    <Link href={`/gear/article/${a.slug}`} className="group bg-card rounded-2xl border border-edge shadow-card p-5 hover:shadow-lift transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">{a.name}</h3>
        {a.difficulty ? <Badge variant="outline">{["", "Easy", "Easy", "Moderate", "Advanced", "Expert"][a.difficulty]}</Badge> : null}
      </div>
      <p className="mt-1.5 text-sm text-ink-500 flex-1">{a.summary}</p>
      {facts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {facts.map((f, i) => <Badge key={i} variant="neutral" className="font-normal">{f}</Badge>)}
        </div>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-tide-700">Learn more <ArrowRight className="size-3.5" /></span>
    </Link>
  );
}

export default async function GearAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const cfg = AREA[area];
  if (!cfg) notFound();
  const db = await getDb();

  const types = await db.query.gearArticles.findMany({
    where: and(eq(gearArticles.category, cfg.cat), eq(gearArticles.status, "published")),
    orderBy: [asc(gearArticles.sort)],
  });
  const concepts = cfg.concept
    ? await db.query.gearArticles.findMany({
        where: and(eq(gearArticles.category, "concept"), eq(gearArticles.subtype, cfg.concept), eq(gearArticles.status, "published")),
        orderBy: [asc(gearArticles.sort)],
      })
    : [];

  // line: per-species strength table
  let lineTable: { name: string; range: string; leader: string }[] = [];
  if (area === "line") {
    const reqs = await db.query.fishGearRequirements.findMany();
    const sp = await db.query.species.findMany();
    const bySlug = new Map(sp.map((x) => [x.slug, x]));
    lineTable = reqs
      .map((r) => ({
        name: bySlug.get(r.speciesSlug)?.commonName ?? r.speciesSlug,
        range: `${r.lineLbMin}–${r.lineLbMax} lb`,
        leader: r.leaderLbMin ? `${r.leaderLbMin}–${r.leaderLbMax} lb` : "—",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div>
      <Link href="/gear" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> All gear
      </Link>
      <PageHeader title={cfg.title} subtitle={cfg.subtitle} />

      {/* concepts (expandable) */}
      {concepts.length > 0 && (
        <section className="mb-8 space-y-3">
          {concepts.map((c) => (
            <details key={c.id} className="group bg-card rounded-2xl border border-edge shadow-card overflow-hidden">
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-5">
                <div>
                  <h3 className="font-display font-bold text-ink-900">{c.name}</h3>
                  <p className="mt-0.5 text-sm text-ink-500">{c.summary}</p>
                </div>
                <ChevronDown className="size-5 text-ink-400 shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-5 -mt-1 space-y-3">
                <Bullets items={c.body.useCases} />
                {c.body.facts && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {c.body.facts.map((f, i) => (
                      <div key={i} className="rounded-lg bg-sand-100/70 px-3 py-2 text-sm">
                        <span className="font-semibold text-ink-700">{f.label}: </span>
                        <span className="text-ink-600">{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {c.body.mistakes?.length ? (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-red-700 mb-1">Common mistakes</div>
                    <Bullets items={c.body.mistakes} />
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </section>
      )}

      {/* types */}
      <section className="mb-10">
        <SectionTitle>{cfg.cat === "terminal" ? "Tackle & rigs" : `${cfg.title} types`}</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((a) => <TypeCard key={a.id} a={a} />)}
        </div>
      </section>

      {/* line comparison tables */}
      {area === "line" && (
        <section className="mb-10 space-y-5">
          <SectionTitle>Head-to-head</SectionTitle>
          {lineComparisons.map((cmp) => (
            <Card key={cmp.title} className="p-5">
              <h3 className="font-display font-bold text-ink-900 mb-3">{cmp.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left text-ink-500">
                      <th className="py-2 pr-3 font-semibold"></th>
                      <th className="py-2 px-3 font-semibold">{cmp.columns[0]}</th>
                      <th className="py-2 px-3 font-semibold">{cmp.columns[1]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cmp.rows.map((r) => (
                      <tr key={r.attr} className="border-t border-sand-100">
                        <td className="py-2 pr-3 font-semibold text-ink-700 whitespace-nowrap">{r.attr}</td>
                        <td className="py-2 px-3 text-ink-600">{r.a}</td>
                        <td className="py-2 px-3 text-ink-600">{r.b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-tide-800 bg-tide-50 rounded-lg px-3 py-2"><strong>Bottom line:</strong> {cmp.takeaway}</p>
            </Card>
          ))}
        </section>
      )}

      {/* line: per-species strength table */}
      {area === "line" && lineTable.length > 0 && (
        <section className="mb-10">
          <SectionTitle>Line strength by species</SectionTitle>
          <Card className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-ink-500">
                    <th className="py-2 pr-3 font-semibold">Species</th>
                    <th className="py-2 px-3 font-semibold">Main line</th>
                    <th className="py-2 px-3 font-semibold">Leader</th>
                  </tr>
                </thead>
                <tbody>
                  {lineTable.map((r) => (
                    <tr key={r.name} className="border-t border-sand-100">
                      <td className="py-2 pr-3 font-semibold text-ink-800">{r.name}</td>
                      <td className="py-2 px-3 text-ink-600">{r.range}</td>
                      <td className="py-2 px-3 text-ink-600">{r.leader}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-400">Ranges are starting points — adjust for fish size, structure, and water clarity.</p>
          </Card>
        </section>
      )}

      {/* leaders: species setups */}
      {area === "leaders" && (
        <section className="mb-10">
          <SectionTitle>Leader setups by species</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {leaderSetups.map((l) => (
              <Card key={l.species} className="p-4">
                <div className="font-bold text-sm text-ink-900">{l.label}</div>
                <p className="mt-1 text-sm text-ink-600">{l.setup}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* quick-pick guide cards */}
      {cfg.guide && cfg.guide.length > 0 && (
        <section>
          <SectionTitle>Quick picks</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {cfg.guide.map((g) => (
              <Card key={g.title} className="p-4">
                <div className="font-bold text-sm text-ink-900">{g.title}</div>
                <div className="mt-1 text-sm font-semibold text-tide-700">{g.rod ?? g.reel ?? g.pick}</div>
                <p className="mt-1 text-sm text-ink-600">{g.why}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
