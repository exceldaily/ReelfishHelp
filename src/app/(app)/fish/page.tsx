import Link from "next/link";
import { eq } from "drizzle-orm";
import { Fish, SlidersHorizontal, MapPin } from "lucide-react";
import { getDb, species, type Species } from "@/db";
import { auth } from "@/auth";
import { getProfile } from "@/lib/auth-helpers";
import { resolveManyImages } from "@/lib/wiki-images";
import { regionsForState, seasonForMonth } from "@/lib/suggestions";
import { US_STATES } from "@/data/regulations";
import { FishImage } from "@/components/fish-image";
import { PageHeader, WaterBadge, Badge, DifficultyDots, EmptyState, ButtonLink } from "@/components/ui";

export const metadata = { title: "Find Fish" };

const ENV_OPTIONS = [
  "lake", "pond", "river", "creek", "canal", "dock", "beach", "surf", "pier", "marsh",
  "flats", "inshore", "reef", "wreck", "bridge", "jetty", "nearshore", "offshore",
];
const STYLE_OPTIONS = ["shore", "kayak", "boat", "pier", "surf"];
const SEASON_OPTIONS = ["spring", "summer", "fall", "winter"];

type Filters = {
  q?: string;
  water?: string;
  state?: string;
  env?: string;
  style?: string;
  season?: string;
  beginner?: string;
  near?: string;
};

function matchesFilters(s: Species, f: Filters, userState: string | null): boolean {
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = `${s.commonName} ${s.scientificName} ${s.category}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.water && f.water !== "all" && s.water !== f.water && s.water !== "both") return false;
  if (f.env && !s.environments.includes(f.env)) return false;
  if (f.style && !s.styles.includes(f.style)) return false;
  if (f.season && !s.seasons.includes(f.season)) return false;
  if (f.beginner === "1" && !s.beginnerFriendly) return false;
  const state = f.state || (f.near === "1" ? userState : null);
  if (state) {
    const regions = regionsForState(state);
    const ok =
      s.regions.includes("Nationwide") ||
      (s.states.length > 0 && s.states.includes(state)) ||
      s.regions.some((r) => regions.includes(r));
    if (!ok) return false;
  }
  return true;
}

export default async function FishFinderPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const f = await searchParams;
  const session = await auth();
  const profile = session?.user ? await getProfile(session.user.id) : null;
  const userState = profile?.manualState ?? profile?.homeState ?? null;

  const db = await getDb();
  const all = await db.query.species.findMany({ where: eq(species.active, true) });
  const results = all
    .filter((s) => matchesFilters(s, f, userState))
    .sort((a, b) => a.commonName.localeCompare(b.commonName));

  await resolveManyImages(results.slice(0, 24));
  const refreshed = await db.query.species.findMany({ where: eq(species.active, true) });
  const withImages = results.map((r) => refreshed.find((s) => s.id === r.id) ?? r);

  const season = seasonForMonth(new Date().getMonth());
  const activeFilterCount = ["water", "state", "env", "style", "season", "beginner"].filter(
    (k) => f[k as keyof Filters]
  ).length;

  return (
    <div>
      <PageHeader
        title="Fish Finder"
        subtitle="Search 40+ US fresh and saltwater species and open the full catch guide for any of them."
      />

      {/* filters */}
      <form method="GET" role="search" aria-label="Fish finder filters" className="rounded-2xl bg-white border border-sand-200 shadow-card p-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            name="q"
            defaultValue={f.q ?? ""}
            aria-label="Search species"
            placeholder="Search species…"
            className="w-full rounded-xl border border-sand-300 px-3.5 py-2.5 text-[15px] min-h-11 sm:col-span-2 lg:col-span-1"
          />
          <select name="water" aria-label="Water type" defaultValue={f.water ?? ""} className="rounded-xl border border-sand-300 px-3 py-2.5 min-h-11 text-[15px] bg-white">
            <option value="">Fresh + saltwater</option>
            <option value="freshwater">Freshwater</option>
            <option value="saltwater">Saltwater</option>
          </select>
          <select name="state" aria-label="State" defaultValue={f.state ?? ""} className="rounded-xl border border-sand-300 px-3 py-2.5 min-h-11 text-[15px] bg-white">
            <option value="">Any state</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
          <select name="env" aria-label="Environment" defaultValue={f.env ?? ""} className="rounded-xl border border-sand-300 px-3 py-2.5 min-h-11 text-[15px] bg-white capitalize">
            <option value="">Any water type</option>
            {ENV_OPTIONS.map((e) => (
              <option key={e} value={e} className="capitalize">{e}</option>
            ))}
          </select>
          <select name="style" aria-label="Fishing style" defaultValue={f.style ?? ""} className="rounded-xl border border-sand-300 px-3 py-2.5 min-h-11 text-[15px] bg-white capitalize">
            <option value="">Any fishing style</option>
            {STYLE_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">{s} fishing</option>
            ))}
          </select>
          <select name="season" aria-label="Season" defaultValue={f.season ?? ""} className="rounded-xl border border-sand-300 px-3 py-2.5 min-h-11 text-[15px] bg-white capitalize">
            <option value="">Any season</option>
            {SEASON_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}{s === season ? " (now)" : ""}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2.5 rounded-xl border border-sand-300 px-3.5 min-h-11 text-sm font-semibold text-ink-700 bg-white cursor-pointer">
            <input type="checkbox" name="beginner" value="1" defaultChecked={f.beginner === "1"} className="size-4 accent-bait-500" />
            Beginner-friendly only
          </label>
          {userState && (
            <label className="flex items-center gap-2.5 rounded-xl border border-sand-300 px-3.5 min-h-11 text-sm font-semibold text-ink-700 bg-white cursor-pointer">
              <input type="checkbox" name="near" value="1" defaultChecked={f.near === "1"} className="size-4 accent-bait-500" />
              <MapPin className="size-4 text-tide-600" /> Near me ({userState})
            </label>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-tide-900 text-white font-bold px-5 py-2.5 min-h-11 hover:bg-tide-800">
            <SlidersHorizontal className="size-4" /> Apply filters
          </button>
          {activeFilterCount > 0 && (
            <Link href="/fish" className="text-sm font-semibold text-ink-500 hover:text-ink-900">
              Clear all
            </Link>
          )}
          <span className="ml-auto text-sm text-ink-500">
            {results.length} species
          </span>
        </div>
      </form>

      {/* results */}
      {withImages.length === 0 ? (
        <EmptyState
          icon={<Fish />}
          title="No species match those filters"
          body="Try widening the water type or season — or clear filters to browse the full guide library."
          action={<ButtonLink href="/fish" variant="secondary">Clear filters</ButtonLink>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withImages.map((s) => (
            <Link
              key={s.id}
              href={`/fish/${s.slug}`}
              className="group bg-card rounded-2xl border border-edge shadow-card overflow-hidden hover:shadow-lift transition-shadow"
            >
              <FishImage src={s.imageUrl} alt={s.commonName} className="h-44" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">
                      {s.commonName}
                    </h3>
                    <p className="text-xs italic text-ink-300">{s.scientificName}</p>
                  </div>
                  <WaterBadge water={s.water} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <DifficultyDots level={s.difficulty} />
                  {s.beginnerFriendly && <Badge variant="orange">Beginner friendly</Badge>}
                  {s.seasons.includes(season) && <Badge variant="fresh">In season</Badge>}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-ink-300 text-[10px]">Best seasons</dt>
                    <dd className="text-ink-700 capitalize">{s.seasons.join(", ") || "Year-round"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-wide text-ink-300 text-[10px]">Habitat</dt>
                    <dd className="text-ink-700 capitalize">{s.environments.slice(0, 3).join(", ")}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-bold uppercase tracking-wide text-ink-300 text-[10px]">Go-to bait</dt>
                    <dd className="text-ink-700">{s.baitTypes.slice(0, 3).join(", ")}</dd>
                  </div>
                </dl>
                <div className="mt-4 rounded-xl bg-tide-900 group-hover:bg-tide-800 text-white text-center text-sm font-bold py-2.5 transition-colors">
                  Open Catch Guide
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
