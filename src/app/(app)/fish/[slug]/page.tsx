import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import {
  Zap,
  Backpack,
  Waves,
  Clock,
  Map as MapIcon,
  AlertTriangle,
  HeartHandshake,
  Scale,
  Trophy,
  ChevronDown,
  Eye,
  Fingerprint,
  Wand2,
  Anchor,
} from "lucide-react";
import { getDb, species, savedGuides, gearSetups, knots, type Species } from "@/db";
import { auth } from "@/auth";
import { getProfile } from "@/lib/auth-helpers";
import { resolveSpeciesImage } from "@/lib/wiki-images";
import { seasonForMonth, regionsForState } from "@/lib/suggestions";
import { FishImage } from "@/components/fish-image";
import { Badge, WaterBadge, DifficultyDots, ButtonLink, Card } from "@/components/ui";
import { SaveGuideButton } from "@/components/guide-actions";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const s = await db.query.species.findFirst({ where: eq(species.slug, slug) });
  if (!s) return { title: "Catch Guide" };

  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://reelfishhelp.vercel.app").replace(/\/$/, "");
  const url = `${base}/fish/${s.slug}`;
  const title = `${s.commonName} — Catch Guide`;
  const description = `How to catch ${s.commonName} (${s.scientificName}): best baits and lures, gear, techniques, seasons, habitat, size, and regulations. ${s.description}`.slice(0, 300);
  const image = s.imageUrl ? (s.imageUrl.startsWith("http") ? s.imageUrl : `${base}${s.imageUrl}`) : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "ReelFishHelp",
      images: image ? [{ url: image, alt: s.commonName }] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-2.5 flex gap-4 border-b border-sand-100 last:border-0">
      <dt className="w-32 shrink-0 text-xs font-bold uppercase tracking-wide text-ink-300 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-ink-700 leading-relaxed">{value}</dd>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className="p-5 sm:p-7 scroll-mt-24">
      <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-ink-900 mb-4">
        <span className="size-9 rounded-xl bg-tide-100 flex items-center justify-center">
          <Icon className="size-5 text-tide-700" />
        </span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function cleanList(items: string[]) {
  return items.filter(Boolean).map((item) => item.trim()).filter(Boolean);
}

function formatList(items: string[]) {
  return cleanList(items).slice(0, 5).join(", ");
}

function buildIdentificationCharacteristics(s: Species): string[] {
  const guideTraits = s.guide.identification?.characteristics ?? [];
  const description = s.description.replace(/\s+/g, " ").trim();
  const traits = [
    ...guideTraits,
    description ? `Overall look: ${description}` : "",
    `Typical size: ${s.avgSize}; trophy class: ${s.trophySize}.`,
    `Most likely setting: ${formatList(s.environments)}${s.regions.length ? ` in ${formatList(s.regions)}.` : "."}`,
    s.guide.habitat.lookFor ? `Where to confirm it: ${s.guide.habitat.lookFor}` : "",
    ...s.lookalikes.map((l) => `Compared with ${l.name}: ${l.howToTell}`),
  ];

  return cleanList([...new Set(traits)]);
}

export default async function CatchGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = await getDb();
  const s = await db.query.species.findFirst({ where: eq(species.slug, slug) });
  if (!s || !s.active) notFound();

  const session = await auth();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const userState = profile?.manualState ?? profile?.homeState ?? null;

  if (!s.imageUrl) await resolveSpeciesImage(s.id);
  const fresh = await db.query.species.findFirst({ where: eq(species.slug, slug) });
  const imageUrl = fresh?.imageUrl ?? null;

  // gear-education integration: situational setups + a recommended knot for this species
  const [allSetups, allKnots] = await Promise.all([
    db.query.gearSetups.findMany({ where: eq(gearSetups.status, "published") }),
    db.query.knots.findMany({ where: eq(knots.status, "published") }),
  ]);
  const matchedSetups = allSetups.filter((su) => su.relatedSpecies.includes(s.slug)).slice(0, 4);
  const recKnot = allKnots.find((k) => k.species.includes(s.slug)) ?? null;

  const saved = session?.user
    ? !!(await db.query.savedGuides.findFirst({
        where: and(eq(savedGuides.userId, session.user.id), eq(savedGuides.speciesId, s.id)),
      }))
    : false;

  const season = seasonForMonth(new Date().getMonth());
  const inSeason = s.seasons.includes(season);
  const nearYou =
    !!userState &&
    (s.regions.includes("Nationwide") ||
      s.states.includes(userState) ||
      s.regions.some((r) => regionsForState(userState).includes(r)));

  const regs = await db.query.regulationLinks.findMany();
  const relevantStates = s.states.length > 0 ? s.states : regs.map((r) => r.state);
  const userReg = userState ? regs.find((r) => r.state === userState) : null;

  const g = s.guide;
  const toc = [
    ["quick-plan", "Quick Plan"],
    ["identification", "ID"],
    ["gear", "Gear"],
    ["techniques", "Techniques"],
    ["timing", "Timing"],
    ["habitat", "Habitat"],
    ["mistakes", "Mistakes"],
    ["handling", "Handling"],
    ["regulations", "Regs"],
  ] as const;

  return (
    <div className="max-w-4xl mx-auto">
      {/* hero */}
      <div className="rounded-3xl overflow-hidden bg-tide-950 text-white shadow-lift">
        <div className="grid md:grid-cols-2">
          <FishImage src={imageUrl} alt={s.commonName} className="h-56 md:h-full min-h-56" fit="contain" priority sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <WaterBadge water={s.water} />
              {s.beginnerFriendly && <Badge variant="orange">Beginner friendly</Badge>}
              {inSeason && <Badge variant="fresh">In season now</Badge>}
              {nearYou && <Badge variant="dark" className="border border-tide-700">Available near you ({userState})</Badge>}
            </div>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold">{s.commonName}</h1>
            <p className="text-tide-300 italic text-sm">{s.scientificName}</p>
            <p className="mt-3 text-tide-100/90 text-sm leading-relaxed">{s.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-tide-900/80 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-tide-300">Typical size</div>
                <div className="font-bold">{s.avgSize}</div>
              </div>
              <div className="rounded-xl bg-tide-900/80 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-tide-300">Trophy class</div>
                <div className="font-bold">{s.trophySize}</div>
              </div>
            </div>
            <div className="mt-4 [&_.text-ink-500]:text-tide-200">
              <DifficultyDots level={s.difficulty} />
            </div>
          </div>
        </div>
      </div>

      {/* actions + toc */}
      <div className="sticky top-20 z-30 -mx-4 px-4 py-3 bg-[#e7f7fb]/95 backdrop-blur border-b border-sand-200 mt-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
          <ButtonLink href={`/catches/new?species=${s.slug}`} size="sm">
            <Trophy className="size-4" /> Log a catch
          </ButtonLink>
          <SaveGuideButton speciesId={s.id} initialSaved={saved} signedIn={!!session?.user} />
          <span className="h-6 w-px bg-sand-300 mx-1 shrink-0" />
          {toc.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 py-2.5 text-xs font-bold text-ink-500 hover:bg-sand-100 hover:text-ink-900"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <p className="text-ink-700 leading-relaxed mb-6 text-[15px]">{g.summary}</p>

      <div className="space-y-6">
        {/* quick plan */}
        <Section id="quick-plan" icon={Zap} title="Quick Catch Plan">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ["Best bait right now", g.quickPlan.bestBaitNow],
              ["Recommended lure", g.quickPlan.lureType],
              ["Setup", g.quickPlan.setup],
              ["Where to go", g.quickPlan.locationType],
              ["Best time", g.quickPlan.bestTime],
              ["Season notes", g.quickPlan.seasonalNote],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-sand-100/70 p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-300">{label}</div>
                <div className="mt-1 text-sm font-medium text-ink-900 leading-relaxed">{value}</div>
              </div>
            ))}
          </div>
          {inSeason && nearYou && (
            <p className="mt-3 text-sm font-semibold text-moss-700 bg-moss-100 rounded-xl px-4 py-3">
              Local relevance: it&apos;s {season} and {s.commonName.toLowerCase()} are in season in your area — this plan applies right now.
            </p>
          )}
        </Section>

        {/* identification */}
        <Section id="identification" icon={Fingerprint} title="ID Characteristics">
          <p className="text-sm text-ink-600 leading-relaxed mb-4">
            Use these field marks and context clues to separate {s.commonName.toLowerCase()} from similar fish before logging or keeping one.
          </p>
          <ul className="grid gap-3">
            {buildIdentificationCharacteristics(s).map((trait) => (
              <li key={trait} className="flex gap-3 rounded-xl bg-sand-100/70 px-4 py-3 text-sm text-ink-700 leading-relaxed">
                <span className="mt-2 size-1.5 rounded-full bg-tide-600 shrink-0" />
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* gear */}
        <Section id="gear" icon={Backpack} title="Gear Recommendations">
          <dl>
            <Row label="Rod" value={g.gear.rod} />
            <Row label="Reel" value={g.gear.reel} />
            <Row label="Main line" value={g.gear.mainLine} />
            <Row label="Leader" value={g.gear.leader} />
            <Row label="Hooks" value={g.gear.hooks} />
            <Row label="Jigheads" value={g.gear.jigheads} />
            <Row label="Terminal tackle" value={g.gear.terminal} />
            <Row label="Lure sizes" value={g.gear.lureSizes} />
            <Row label="Lure colors" value={g.gear.lureColors} />
            <Row label="Baits" value={g.gear.baits.join(" · ")} />
          </dl>
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h3 className="font-display font-bold text-ink-900">Complete setups</h3>
              <ButtonLink href={`/gear/builder?species=${s.slug}`} variant="secondary" size="sm">
                <Wand2 className="size-4" /> Build a {s.commonName} setup
              </ButtonLink>
            </div>
            {matchedSetups.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {matchedSetups.map((su) => (
                  <Link
                    key={su.id}
                    href={`/gear/setups/${su.slug}`}
                    className="group rounded-2xl border border-sand-200 p-4 hover:shadow-lift transition-shadow"
                  >
                    <div className="font-bold text-sm text-ink-900 group-hover:text-tide-700 transition-colors">{su.name}</div>
                    <p className="mt-1 text-xs text-ink-500 line-clamp-2">{su.summary}</p>
                    <div className="mt-2 text-xs text-ink-500"><span className="font-semibold text-ink-700">Rod:</span> {su.rod}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">
                Match a rig to {s.commonName} with the{" "}
                <Link href={`/gear/builder?species=${s.slug}`} className="font-semibold text-tide-700 hover:underline">Setup Builder</Link>, or browse{" "}
                <Link href="/gear/setups" className="font-semibold text-tide-700 hover:underline">all setups</Link>.
              </p>
            )}
            {recKnot && (
              <div className="mt-4 rounded-xl bg-tide-50 border border-tide-100 px-4 py-3 flex items-center gap-2 flex-wrap">
                <Anchor className="size-4 text-tide-700 shrink-0" />
                <span className="text-sm text-ink-700">Recommended knot:</span>
                <Link href={`/gear/knots/${recKnot.slug}`} className="text-sm font-bold text-tide-700 hover:underline">{recKnot.name}</Link>
                <span className="text-xs text-ink-500">— {recKnot.bestUse}</span>
              </div>
            )}
          </div>
        </Section>

        {/* techniques */}
        <Section id="techniques" icon={Waves} title="Techniques">
          <dl>
            <Row label="Presentation" value={g.techniques.presentation} />
            <Row label="Retrieve" value={g.techniques.retrieve} />
            <Row label="Positioning" value={g.techniques.positioning} />
            <Row label="Depth" value={g.techniques.depth} />
            <Row label="Structure" value={g.techniques.structure} />
            <Row label="Working current" value={g.techniques.current} />
          </dl>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {Object.entries(g.techniques.byStyle).map(([style, advice]) => (
              <div key={style} className="rounded-xl bg-tide-50 border border-tide-100 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-tide-700 capitalize">
                  {style} fishing
                </div>
                <p className="mt-1 text-sm text-ink-700 leading-relaxed">{advice}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* timing */}
        <Section id="timing" icon={Clock} title="Timing & Conditions">
          <dl>
            <Row label="Seasons" value={g.timing.seasons} />
            <Row label="Time of day" value={g.timing.timeOfDay} />
            <Row label="Weather" value={g.timing.weather} />
            <Row label="Wind" value={g.timing.wind} />
            <Row label="Water temp" value={g.timing.waterTemp} />
            <Row label="Tides" value={g.timing.tide} />
            <Row label="Moon" value={g.timing.moon} />
            <Row label="Pressure" value={g.timing.pressure} />
            <Row label="Seasonal movement" value={g.timing.movement} />
          </dl>
          <div className="mt-3">
            <ButtonLink href="/conditions" variant="secondary" size="sm">
              Check today&apos;s local conditions →
            </ButtonLink>
          </div>
        </Section>

        {/* habitat */}
        <Section id="habitat" icon={MapIcon} title="Habitat — Where to Find Them">
          <p className="text-sm text-ink-700 leading-relaxed">{g.habitat.overview}</p>
          <dl className="mt-3">
            <Row label="Depth range" value={g.habitat.depthRange} />
            <Row label="Look for" value={g.habitat.lookFor} />
            <Row label="Migration" value={g.habitat.migration} />
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {g.habitat.structures.map((st) => (
              <Badge key={st} variant="outline" className="capitalize">{st}</Badge>
            ))}
          </div>
        </Section>

        {/* mistakes */}
        <Section id="mistakes" icon={AlertTriangle} title="Common Mistakes">
          <ul className="space-y-2.5">
            {g.mistakes.map((m) => (
              <li key={m} className="flex gap-3 text-sm text-ink-700 leading-relaxed">
                <span className="mt-1.5 size-1.5 rounded-full bg-bait-500 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </Section>

        {/* handling */}
        <Section id="handling" icon={HeartHandshake} title="Catch, Handling & Release">
          <dl>
            <Row label="Landing" value={g.handling.landing} />
            <Row label="Handling" value={g.handling.handling} />
            <Row label="Release" value={g.handling.release} />
            <Row label="Conservation" value={g.handling.regulations} />
          </dl>
        </Section>

        {/* lookalikes */}
        {s.lookalikes.length > 0 && (
          <Section id="lookalikes" icon={Eye} title="Common Lookalikes">
            <div className="space-y-3">
              {s.lookalikes.map((l) => (
                <div key={l.name} className="rounded-xl bg-sand-100/70 p-4">
                  <div className="font-bold text-sm text-ink-900">{l.name}</div>
                  <p className="mt-0.5 text-sm text-ink-700 leading-relaxed">{l.howToTell}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* regulations */}
        <Section id="regulations" icon={Scale} title="Local Regulations">
          <p className="text-sm text-ink-700 leading-relaxed">
            Size limits, bag limits, seasons, and gear rules change every year and differ by state
            (and often by individual water). Always verify with the official source before keeping fish.
          </p>
          {userReg && (
            <a
              href={userReg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-tide-300 bg-tide-50 p-4 hover:border-tide-500 transition-colors"
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-tide-700">
                  Your state — {userReg.state}
                </div>
                <div className="font-bold text-ink-900">{userReg.agency}</div>
                {userReg.notes && <div className="text-xs text-ink-500 mt-0.5">{userReg.notes}</div>}
              </div>
              <span className="text-tide-700 font-bold text-sm whitespace-nowrap">Open →</span>
            </a>
          )}
          <details className="mt-4 group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm font-bold text-ink-700 select-none">
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              All state sources for this species
            </summary>
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {regs
                .filter((r) => relevantStates.includes(r.state))
                .map((r) => (
                  <a
                    key={r.state}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm hover:bg-sand-100"
                  >
                    <span className="font-bold text-tide-700 w-8">{r.state}</span>
                    <span className="text-ink-700 truncate">{r.agency}</span>
                  </a>
                ))}
            </div>
          </details>
        </Section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={`/catches/new?species=${s.slug}`}>
          <Trophy className="size-4" /> Log a {s.commonName} catch
        </ButtonLink>
        <ButtonLink href={`/trips/new?species=${s.slug}`} variant="dark">
          Plan a trip for this fish
        </ButtonLink>
        <ButtonLink href="/fish" variant="outline">
          ← Back to Fish Finder
        </ButtonLink>
      </div>

      <p className="mt-6 text-xs text-ink-300">
        Guide data is editorial and general — conditions, regulations, and fish behavior vary by
        water. Photo: {fresh?.imageCredit ?? "pending"}.
      </p>

    </div>
  );
}
