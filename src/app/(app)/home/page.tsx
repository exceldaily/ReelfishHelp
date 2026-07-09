import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  Camera,
  Fish,
  Trophy,
  Backpack,
  CalendarDays,
  MapPin,
  CloudSun,
  BookmarkCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  getDb,
  catches,
  trips,
  gearItems,
  spots,
  savedGuides,
  follows,
  species,
} from "@/db";
import { requireUser, getProfile } from "@/lib/auth-helpers";
import { getConditions, type ConditionsBundle } from "@/lib/conditions";
import { fishIdEnabled } from "@/lib/flags";
import { Card, Badge, ButtonLink, SectionTitle, WaterBadge } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";

export const metadata = { title: "Home" };

const quickActions = (fishId: boolean) => [
  ...(fishId
    ? [{ href: "/identify", label: "Identify Fish", icon: Camera }]
    : [{ href: "/spots", label: "My Spots", icon: MapPin }]),
  { href: "/fish", label: "Find Fish", icon: Fish },
  { href: "/catches/new", label: "Log Catch", icon: Trophy },
  { href: "/my-gear", label: "Add Gear", icon: Backpack },
  { href: "/trips/new", label: "Plan Trip", icon: CalendarDays },
];

export default async function HomePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");
  if (!profile.onboarded) redirect("/onboarding");

  const db = await getDb();

  let conditions: ConditionsBundle | null = null;
  if (profile.lastLat != null && profile.lastLng != null) {
    try {
      conditions = await getConditions(profile.lastLat, profile.lastLng);
    } catch {
      conditions = null;
    }
  }

  const [myCatches, upcomingTrips, gear, mySpots, saved, followingRows] = await Promise.all([
    db.query.catches.findMany({
      where: eq(catches.userId, user.id),
      orderBy: [desc(catches.caughtAt)],
      limit: 3,
      with: { species: true, photos: true },
    }),
    db.query.trips.findMany({
      where: and(eq(trips.userId, user.id), eq(trips.status, "planned")),
      orderBy: [trips.date],
      limit: 3,
    }),
    db.query.gearItems.findMany({ where: eq(gearItems.userId, user.id) }),
    db.query.spots.findMany({
      where: eq(spots.userId, user.id),
      orderBy: [desc(spots.favorite)],
      limit: 4,
    }),
    db.query.savedGuides.findMany({
      where: eq(savedGuides.userId, user.id),
    }),
    db.query.follows.findMany({ where: eq(follows.followerId, user.id) }),
  ]);

  const savedSpecies =
    saved.length > 0
      ? await db.query.species.findMany({
          where: inArray(species.id, saved.map((s) => s.speciesId)),
        })
      : [];

  const followedIds = followingRows.map((f) => f.followingId);
  const friendActivity =
    followedIds.length > 0
      ? await db.query.catches.findMany({
          where: and(inArray(catches.userId, followedIds), inArray(catches.visibility, ["public", "followers"])),
          orderBy: [desc(catches.createdAt)],
          limit: 3,
          with: { species: true, photos: true, user: { with: { profile: true } } },
        })
      : [];

  return (
    <div>
      {/* greeting + quick actions */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          Ready to Fish, {profile.displayName.split(" ")[0]}?
        </h1>
        {profile.lastLocationLabel && (
          <p className="text-ink-500 mt-1 flex items-center gap-1.5 text-sm">
            <MapPin className="size-4" /> Fishing near {profile.lastLocationLabel}
            <Link href="/settings" className="text-tide-700 font-semibold hover:underline">change</Link>
          </p>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-7">
        {quickActions(fishIdEnabled()).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-sand-200 shadow-card py-4 hover:shadow-lift hover:border-tide-300 transition-all"
          >
            <span className="size-10 rounded-xl bg-tide-100 grid place-items-center">
              <Icon className="size-5 text-tide-700" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-ink-700 text-center leading-tight px-1">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* left: conditions + suggestions */}
        <div className="lg:col-span-2 space-y-5">
          {conditions ? (
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <SectionTitle className="mb-0 flex items-center gap-2">
                  <CloudSun className="size-5 text-tide-600" /> Right now on your water
                </SectionTitle>
                <Link href="/conditions" className="text-sm font-bold text-tide-700 hover:underline">
                  Full conditions →
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="font-display text-4xl font-extrabold text-ink-900">
                  {Math.round(conditions.weather.current.tempF)}°
                </div>
                <div className="text-sm text-ink-700">
                  <div className="font-semibold">{conditions.weather.current.conditionText}</div>
                  <div className="text-ink-500">
                    Wind {Math.round(conditions.weather.current.windMph)} mph {conditions.weather.current.windDirCompass} ·{" "}
                    {conditions.moon.emoji} {conditions.moon.name}
                    {conditions.tides?.events.find((e) => new Date(e.time) > new Date()) && (
                      <>
                        {" · next "}
                        {conditions.tides.events.find((e) => new Date(e.time) > new Date())!.type === "H" ? "high" : "low"}{" "}
                        {new Date(
                          conditions.tides.events.find((e) => new Date(e.time) > new Date())!.time
                        ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div
                    className={`font-display text-lg font-bold ${
                      conditions.rating.score >= 60 ? "text-moss-600" : conditions.rating.score >= 42 ? "text-bait-600" : "text-red-700"
                    }`}
                  >
                    {conditions.rating.label}
                  </div>
                  <div className="text-xs text-ink-500">{conditions.rating.score}/100 activity indicator</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-sand-100">
                <div className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">Worth targeting today</div>
                <div className="flex flex-wrap gap-2">
                  {conditions.suggestions.slice(0, 5).map((s) => (
                    <Link
                      key={s.id}
                      href={`/fish/${s.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-sand-50 hover:border-tide-400 px-3.5 py-1.5 text-sm font-semibold text-ink-900 transition-colors"
                    >
                      {s.commonName}
                      <ArrowRight className="size-3.5 text-tide-600" />
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <SectionTitle>Set your location for live conditions</SectionTitle>
              <p className="text-sm text-ink-500 mb-4">
                Weather, tides, moon, and species suggestions all key off your approximate area.
              </p>
              <ButtonLink href="/conditions">Open conditions & set location</ButtonLink>
            </Card>
          )}

          {/* recent catches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0">Recent catches</SectionTitle>
              <Link href="/catches" className="text-sm font-bold text-tide-700 hover:underline">All catches →</Link>
            </div>
            {myCatches.length === 0 ? (
              <Card className="p-6 text-sm text-ink-500">
                Nothing logged yet — your first catch is one tap away with the Log Catch button.
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {myCatches.map((c) => (
                  <CatchCard
                    key={c.id}
                    c={{
                      id: c.id,
                      speciesName: c.species?.commonName ?? c.customSpeciesName ?? "Unknown",
                      photoUrl: c.photos[0]?.url ?? null,
                      caughtAt: c.caughtAt,
                      lengthIn: c.lengthIn,
                      weightLb: c.weightLb,
                      bait: c.bait,
                      released: c.released,
                      visibility: c.visibility,
                      locationLabel: c.locationLabel,
                      showLocation: true,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* friend activity */}
          {friendActivity.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionTitle className="mb-0 flex items-center gap-2">
                  <Users className="size-5 text-tide-600" /> From anglers you follow
                </SectionTitle>
                <Link href="/community" className="text-sm font-bold text-tide-700 hover:underline">Community →</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {friendActivity.map((c) => (
                  <CatchCard
                    key={c.id}
                    c={{
                      id: c.id,
                      speciesName: c.species?.commonName ?? c.customSpeciesName ?? "Unknown",
                      photoUrl: c.photos[0]?.url ?? null,
                      caughtAt: c.caughtAt,
                      lengthIn: c.lengthIn,
                      weightLb: c.weightLb,
                      bait: c.bait,
                      released: c.released,
                      visibility: c.visibility,
                      locationLabel: c.locationLabel,
                      showLocation: c.showLocation,
                      author: c.user.profile
                        ? { username: c.user.profile.username, displayName: c.user.profile.displayName, avatarUrl: c.user.profile.avatarUrl }
                        : null,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* right rail */}
        <div className="space-y-5">
          {/* upcoming trips */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0">Upcoming trips</SectionTitle>
              <Link href="/trips" className="text-xs font-bold text-tide-700 hover:underline">All →</Link>
            </div>
            {upcomingTrips.length === 0 ? (
              <p className="text-sm text-ink-500">
                Nothing planned. <Link href="/trips/new" className="font-bold text-tide-700 hover:underline">Plan one</Link> around a good tide.
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingTrips.map((t) => (
                  <Link key={t.id} href={`/trips/${t.id}`} className="block rounded-xl bg-sand-100/60 hover:bg-sand-100 px-3.5 py-2.5">
                    <div className="font-bold text-sm text-ink-900">{t.title}</div>
                    <div className="text-xs text-ink-500">
                      {new Date(t.date + "T12:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                      {t.time ? ` · ${t.time}` : ""}
                      {t.locationLabel ? ` · ${t.locationLabel}` : ""}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* saved guides */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0 flex items-center gap-2">
                <BookmarkCheck className="size-4 text-tide-600" /> Saved guides
              </SectionTitle>
              <Link href="/fish" className="text-xs font-bold text-tide-700 hover:underline">Find fish →</Link>
            </div>
            {savedSpecies.length === 0 ? (
              <p className="text-sm text-ink-500">Save catch guides from the Fish Finder to keep them here.</p>
            ) : (
              <div className="space-y-1.5">
                {savedSpecies.map((s) => (
                  <Link key={s.id} href={`/fish/${s.slug}`} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 hover:bg-sand-100">
                    <span className="text-sm font-semibold text-ink-900">{s.commonName}</span>
                    <WaterBadge water={s.water} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* gear summary */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0">Gear locker</SectionTitle>
              <Link href="/my-gear" className="text-xs font-bold text-tide-700 hover:underline">Open →</Link>
            </div>
            <p className="text-sm text-ink-700">
              <strong>{gear.filter((g) => !g.wishlist).length}</strong> items ·{" "}
              <strong>{gear.filter((g) => g.wishlist).length}</strong> on the wishlist
            </p>
            {gear.filter((g) => g.favorite).slice(0, 3).map((g) => (
              <div key={g.id} className="mt-2 text-sm text-ink-500">⭐ {g.name}</div>
            ))}
          </Card>

          {/* favorite spots */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0">Spots</SectionTitle>
              <Link href="/spots" className="text-xs font-bold text-tide-700 hover:underline">Map →</Link>
            </div>
            {mySpots.length === 0 ? (
              <p className="text-sm text-ink-500">No saved spots yet — build your private map.</p>
            ) : (
              <div className="space-y-1.5">
                {mySpots.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <MapPin className="size-3.5 text-tide-600 shrink-0" />
                    <span className="font-semibold text-ink-900 truncate">{s.name}</span>
                    {s.favorite && <Badge variant="orange">★</Badge>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
