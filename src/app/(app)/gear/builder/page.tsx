import Link from "next/link";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, AlertTriangle, ThumbsUp, ThumbsDown, Lightbulb, Anchor, Fish, ShoppingBag, Star, Trash2 } from "lucide-react";
import { getDb, fishGearRequirements, species, knots, userSetups } from "@/db";
import { currentUser } from "@/lib/auth-helpers";
import { PageHeader, Card, Badge, Button, ButtonLink } from "@/components/ui";
import { SetupBuilder } from "@/components/gear/setup-builder";
import { saveUserSetup, deleteUserSetup, toggleFavoriteSetup } from "@/lib/actions/gear-education-actions";
import { scoreSetup, type SetupInput, type SpeciesReq, type SpeciesScore } from "@/lib/gear/scoring";

export const metadata = {
  title: "Setup Builder · Gear",
  description: "Build a fishing setup and see exactly which species, environments, and techniques it's best suited for.",
};

const VERDICT_STYLE: Record<string, string> = {
  "Excellent Match": "fresh",
  "Good Match": "salt",
  "Usable With Caution": "orange",
  "Too Light": "neutral",
  "Too Heavy": "neutral",
  "Wrong Setup Type": "outline",
};

function SpeciesChips({ items, icon }: { items: SpeciesScore[]; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <Link key={s.slug} href={`/fish/${s.slug}`} title={s.reasons[0] ?? ""}>
          <Badge variant={(VERDICT_STYLE[s.verdict] ?? "neutral") as "fresh"} className="hover:opacity-80">
            {icon}{s.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export default async function BuilderPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams;
  const db = await getDb();
  const user = await currentUser();
  const built = p.built === "1";

  if (!built) {
    // builder home
    const saved = user
      ? await db.query.userSetups.findMany({ where: eq(userSetups.ownerId, user.id), orderBy: [desc(userSetups.favorite), desc(userSetups.createdAt)], limit: 20 })
      : [];
    return (
      <div>
        <Link href="/gear" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
          <ArrowLeft className="size-4" /> All gear
        </Link>
        <PageHeader
          title="Setup Builder"
          subtitle="Pick your rod, reel, line, and rig — we'll tell you what it can catch, where, and how. Or let us build one for you."
        />
        {p.saved === "1" && (
          <div className="mb-5 rounded-xl bg-moss-100 text-moss-700 px-4 py-3 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4" /> Setup saved.
          </div>
        )}
        <SetupBuilder initialSpecies={p.species} />

        {saved.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Your saved setups</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {saved.map((s) => (
                <Card key={s.id} className={`p-4 flex items-start gap-3 ${s.favorite ? "ring-2 ring-bait-400/70 bg-gradient-to-r from-bait-100/50 to-card" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-ink-900 truncate">{s.name}</span>
                      {s.favorite && <Badge variant="orange">Go-to</Badge>}
                    </div>
                    <div className="text-xs text-ink-500 capitalize">{[s.water, (s.line as { lb?: number })?.lb ? `${(s.line as { lb?: number }).lb} lb` : null, s.method].filter(Boolean).join(" · ")}</div>
                  </div>
                  <form action={toggleFavoriteSetup}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      aria-label={s.favorite ? "Remove go-to setup" : "Make this my go-to setup"}
                      title={s.favorite ? "Remove go-to setup" : "Make this my go-to setup"}
                    >
                      <Star className={`size-4 ${s.favorite ? "fill-bait-400 text-bait-400" : "text-sand-300 hover:text-bait-400"}`} />
                    </button>
                  </form>
                  <form action={deleteUserSetup}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" aria-label="Delete setup" className="text-ink-300 hover:text-red-600"><Trash2 className="size-4" /></button>
                  </form>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── results mode ──
  const input: SetupInput = {
    water: p.water ?? null,
    lineType: p.lineType ?? null,
    lineLb: p.lineLb ? Number(p.lineLb) : null,
    leaderType: p.leaderType ?? null,
    leaderLb: p.leaderType && p.leaderType !== "none" && p.leaderLb && Number(p.leaderLb) > 0 ? Number(p.leaderLb) : null,
    rodPower: p.rodPower ?? null,
    reelSize: p.reelSize ? Number(p.reelSize) : null,
    method: p.method ?? null,
  };

  const reqRows = await db.query.fishGearRequirements.findMany();
  const sp = await db.query.species.findMany();
  const meta = new Map(sp.map((s) => [s.slug, s]));
  const reqs: SpeciesReq[] = reqRows.map((r) => ({
    speciesSlug: r.speciesSlug,
    name: meta.get(r.speciesSlug)?.commonName ?? r.speciesSlug,
    water: meta.get(r.speciesSlug)?.water ?? null,
    lineLbMin: r.lineLbMin, lineLbIdeal: r.lineLbIdeal, lineLbMax: r.lineLbMax,
    leaderLbMin: r.leaderLbMin, leaderLbMax: r.leaderLbMax,
    rodPower: r.rodPower, reelSizeMin: r.reelSizeMin, reelSizeMax: r.reelSizeMax,
    fightStrength: r.fightStrength, structureRisk: r.structureRisk, methods: r.methods,
  }));

  const res = scoreSetup(input, reqs);

  // recommended knots
  const knotSlugs = new Set<string>(["palomar-knot", "uni-knot"]);
  if (input.lineType === "braid" && input.leaderLb) { knotSlugs.add("fg-knot"); knotSlugs.add("double-uni-knot"); }
  if (input.leaderType === "wire") knotSlugs.add("haywire-twist");
  if ((input.rodPower === "heavy" || input.rodPower === "extra-heavy")) knotSlugs.add("non-slip-loop-knot");
  const recKnots = await db.query.knots.findMany({ where: inArray(knots.slug, [...knotSlugs]), orderBy: [asc(knots.sort)] });

  const summaryBits = [
    p.rodPower && `${p.rodPower} rod`,
    p.lineLb && `${p.lineLb} lb ${p.lineType ?? "line"}`,
    input.leaderLb && `${p.leaderLb} lb ${p.leaderType} leader`,
    p.reelSize && `${p.reelSize}-size reel`,
    p.method,
  ].filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/gear/builder" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> Build another
      </Link>
      <PageHeader title="Your setup" subtitle={summaryBits.join(" · ") || "Setup analysis"} />

      {/* species matches */}
      <div className="space-y-4 mb-6">
        {res.best.length > 0 && (
          <Card className="p-5">
            <h3 className="font-display font-bold text-moss-700 mb-2 flex items-center gap-2"><ThumbsUp className="size-4" /> Best for</h3>
            <SpeciesChips items={res.best} icon={<Fish className="size-3" />} />
          </Card>
        )}
        {res.okay.length > 0 && (
          <Card className="p-5">
            <h3 className="font-display font-bold text-bait-700 mb-2">Usable with caution</h3>
            <SpeciesChips items={res.okay} />
          </Card>
        )}
        {(res.tooLight.length > 0 || res.tooHeavy.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {res.tooLight.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display font-bold text-ink-700 mb-2 flex items-center gap-2"><ThumbsDown className="size-4" /> Too light for</h3>
                <SpeciesChips items={res.tooLight} />
              </Card>
            )}
            {res.tooHeavy.length > 0 && (
              <Card className="p-5">
                <h3 className="font-display font-bold text-ink-700 mb-2">Too heavy for</h3>
                <SpeciesChips items={res.tooHeavy} />
              </Card>
            )}
          </div>
        )}
        {res.best.length === 0 && res.okay.length === 0 && (
          <Card className="p-5 text-sm text-ink-500">No strong matches in our profiled species for this water yet — try adjusting line, leader, or rod power.</Card>
        )}
      </div>

      {/* environments + techniques */}
      {(res.environments.length > 0 || res.techniques.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {res.environments.length > 0 && (
            <Card className="p-5"><h3 className="font-display font-bold text-ink-900 mb-2">Best environments</h3><ul className="text-sm text-ink-700 space-y-1">{res.environments.map((e, i) => <li key={i}>• {e}</li>)}</ul></Card>
          )}
          {res.techniques.length > 0 && (
            <Card className="p-5"><h3 className="font-display font-bold text-ink-900 mb-2">Best techniques</h3><ul className="text-sm text-ink-700 space-y-1">{res.techniques.map((e, i) => <li key={i}>• {e}</li>)}</ul></Card>
          )}
        </div>
      )}

      {/* strengths / weaknesses / suggestions */}
      {(res.strengths.length > 0 || res.weaknesses.length > 0 || res.suggestions.length > 0) && (
        <div className="space-y-3 mb-6">
          {res.strengths.map((t, i) => <div key={`s${i}`} className="flex gap-2 text-sm text-moss-700"><ThumbsUp className="size-4 shrink-0 mt-0.5" />{t}</div>)}
          {res.weaknesses.map((t, i) => <div key={`w${i}`} className="flex gap-2 text-sm text-ink-700"><AlertTriangle className="size-4 shrink-0 mt-0.5 text-bait-500" />{t}</div>)}
          {res.suggestions.map((t, i) => <div key={`g${i}`} className="flex gap-2 text-sm text-tide-800"><Lightbulb className="size-4 shrink-0 mt-0.5" />{t}</div>)}
        </div>
      )}

      {/* recommended knots */}
      {recKnots.length > 0 && (
        <Card className="p-5 mb-6">
          <h3 className="font-display font-bold text-ink-900 mb-2 flex items-center gap-2"><Anchor className="size-4 text-tide-700" /> Recommended knots</h3>
          <div className="flex flex-wrap gap-2">
            {recKnots.map((k) => <Link key={k.id} href={`/gear/knots/${k.slug}`}><Badge variant="salt" className="hover:bg-tide-200">{k.name}</Badge></Link>)}
          </div>
        </Card>
      )}

      {/* save + affiliate */}
      {user ? (
        <Card className="p-5 mb-4">
          <h3 className="font-display font-bold text-ink-900 mb-3">Save this setup</h3>
          <form action={saveUserSetup} className="flex flex-wrap items-end gap-3">
            {Object.entries(p).map(([k, v]) => (k !== "built" && v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-semibold text-ink-500 mb-1">Name</label>
              <input name="name" defaultValue={`${p.water ?? "My"} setup`} className="w-full rounded-xl border border-sand-300 px-3 py-2 min-h-10 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1">Visibility</label>
              <select name="visibility" defaultValue="private" className="rounded-xl border border-sand-300 px-3 py-2 min-h-10 text-sm">
                <option value="private">Just me</option>
                <option value="followers">Followers</option>
                <option value="public">Public</option>
              </select>
            </div>
            <Button type="submit" size="sm">Save setup</Button>
          </form>
        </Card>
      ) : (
        <div className="mb-4"><ButtonLink href="/login" variant="secondary" size="sm">Log in to save this setup</ButtonLink></div>
      )}

      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-2 text-ink-400"><ShoppingBag className="size-4" /><span className="text-sm font-semibold">Shop this setup — coming soon</span></div>
        <p className="mt-1 text-xs text-ink-400">Some gear links will be affiliate links. We may earn a commission if you make a purchase, at no additional cost to you.</p>
      </Card>
    </div>
  );
}
