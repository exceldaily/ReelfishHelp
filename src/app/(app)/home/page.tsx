import Link from "next/link";
import { verifiedTitleMap, primaryTitle, latestVerifiedReports } from "@/lib/verified";
import { VerifiedReportCard } from "@/components/verified-report-card";
import { InstallAppBanner } from "@/components/install-app-banner";
import { DailyTipCard } from "@/components/daily-tip-card";
import { getDailyTip } from "@/lib/tips";
import { PushPrompt } from "@/components/push-prompt";
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
import { unitSystemForRegion, toRegion } from "@/lib/regions";
import { toLanguage } from "@/lib/languages";
import { t, tDyn } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/languages";
import { getConditions, type ConditionsBundle } from "@/lib/conditions";
import { fishIdEnabled } from "@/lib/flags";
import { Card, Badge, ButtonLink, SectionTitle, WaterBadge } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";
import { NewsFeedCard } from "@/components/news-feed";

export const metadata = { title: "Home" };

const quickActions = (fishId: boolean, lang: LanguageCode) => [
  ...(fishId
    ? [{ href: "/identify", label: t(lang, "home.identifyFish"), icon: Camera }]
    : [{ href: "/spots", label: t(lang, "home.mySpots"), icon: MapPin }]),
  { href: "/fish", label: t(lang, "nav.findFish"), icon: Fish },
  { href: "/catches/new", label: t(lang, "home.logCatch"), icon: Trophy },
  { href: "/my-gear", label: t(lang, "home.addGear"), icon: Backpack },
  { href: "/trips/new", label: t(lang, "home.planTrip"), icon: CalendarDays },
];

export default async function HomePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");
  if (!profile.onboarded) redirect("/onboarding");
  const units = unitSystemForRegion(profile.region);
  const lang = toLanguage(profile.language);

  const db = await getDb();

  let conditions: ConditionsBundle | null = null;
  if (profile.lastLat != null && profile.lastLng != null) {
    try {
      conditions = await getConditions(profile.lastLat, profile.lastLng, undefined, toRegion(profile.region));
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

  // daily tip: a failed fetch must never take down the home page
  const dailyTip = await getDailyTip(db, user.id).catch((e) => {
    console.error("[daily-tip] fetch failed:", e instanceof Error ? e.message : e);
    return null;
  });

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

  const titleMap = await verifiedTitleMap(db, friendActivity.map((c) => c.userId));
  const proReports = await latestVerifiedReports(db, { limit: 2 });

  return (
    <div>
      <InstallAppBanner />
      <PushPrompt />
      {/* greeting + quick actions */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold italic tracking-tight text-ink-900">
          {t(lang, "page.homeGreeting", { name: profile.displayName.split(" ")[0] })}
        </h1>
        <span className="mt-2 flex items-center gap-1" aria-hidden="true">
          <span className="h-1 w-14 -skew-x-[24deg] rounded-sm bg-gradient-to-r from-reef-600 to-reef-300" />
          <span className="h-1 w-4 -skew-x-[24deg] rounded-sm bg-sand-400" />
          <span className="h-1 w-1.5 -skew-x-[24deg] rounded-sm bg-bait-500" />
        </span>
        {profile.lastLocationLabel && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-edge bg-card/80 px-3 py-1 text-sm text-ink-500 shadow-card">
            <MapPin className="size-4 text-reef-600" /> {t(lang, "home.fishingNear")}{" "}
            <span className="font-semibold text-ink-900">{profile.lastLocationLabel}</span>
            <Link href="/settings" className="text-tide-600 font-semibold hover:underline">{t(lang, "home.change")}</Link>
          </p>
        )}
      </div>

      {dailyTip && (
        <div className="mb-6">
          <DailyTipCard
            tip={{
              id: dailyTip.id,
              slug: dailyTip.slug,
              title: dailyTip.title,
              tipText: dailyTip.tipText,
              category: dailyTip.category,
              icon: dailyTip.icon,
              helpfulCount: dailyTip.helpfulCount,
              viewerHelpful: dailyTip.viewerHelpful,
              viewerSaved: dailyTip.viewerSaved,
            }}
            signedIn
            lang={lang}
          />
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-7">
        {quickActions(fishIdEnabled(), lang).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2 rounded-2xl bg-card border border-edge shadow-card py-4 transition-all hover:-translate-y-0.5 hover:shadow-lift hover:border-tide-300 active:translate-y-0"
          >
            <span className="size-10 rounded-xl bg-gradient-to-br from-tide-700 to-reef-500 grid place-items-center shadow-sm transition-transform group-hover:scale-110">
              <Icon className="size-5 text-white" />
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
                  <CloudSun className="size-5 text-tide-600" /> {t(lang, "home.rightNow")}
                </SectionTitle>
                <Link href="/conditions" className="text-sm font-bold text-tide-700 hover:underline">
                  {t(lang, "home.fullConditions")}
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="font-display text-4xl font-extrabold text-ink-900">
                  {Math.round(conditions.weather.current.tempF)}°
                </div>
                <div className="text-sm text-ink-700">
                  <div className="font-semibold">{tDyn(lang, "wx", conditions.weather.current.conditionText)}</div>
                  <div className="text-ink-500">
                    {t(lang, "home.wind")} {Math.round(conditions.weather.current.windMph)} mph {conditions.weather.current.windDirCompass} ·{" "}
                    {conditions.moon.emoji} {tDyn(lang, "moon", conditions.moon.name)}
                    {conditions.tides?.events.find((e) => new Date(e.time) > new Date()) && (
                      <>
                        {" · "}{t(lang, "home.next")}{" "}
                        {conditions.tides.events.find((e) => new Date(e.time) > new Date())!.type === "H" ? t(lang, "home.high") : t(lang, "home.low")}{" "}
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
                    {tDyn(lang, "cond", conditions.rating.label)}
                  </div>
                  <div className="ml-auto mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-sand-100">
                    <div
                      className={`h-full rounded-full ${
                        conditions.rating.score >= 60 ? "bg-moss-500" : conditions.rating.score >= 42 ? "bg-bait-500" : "bg-red-600"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(4, conditions.rating.score))}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-ink-500">{t(lang, "home.activity", { score: String(conditions.rating.score) })}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-sand-100">
                <div className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2">{t(lang, "home.worthTargeting")}</div>
                <div className="flex flex-wrap gap-2">
                  {conditions.suggestions.slice(0, 5).map((s) => (
                    <Link
                      key={s.id}
                      href={`/fish/${s.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-tide-200 bg-tide-50 px-3.5 py-1.5 text-sm font-semibold text-tide-800 transition-colors hover:border-reef-500 hover:bg-reef-100/60"
                    >
                      {s.commonName}
                      <ArrowRight className="size-3.5 text-reef-600" />
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <SectionTitle>{t(lang, "home.setLocationTitle")}</SectionTitle>
              <p className="text-sm text-ink-500 mb-4">{t(lang, "home.setLocationBody")}</p>
              <ButtonLink href="/conditions">{t(lang, "home.openConditions")}</ButtonLink>
            </Card>
          )}

          {/* recent catches */}
          <div>
            <div className="flex items-baseline gap-3 mb-3">
              <SectionTitle className="mb-0">{t(lang, "home.recentCatches")}</SectionTitle>
              <Link href="/catches" className="text-sm font-bold text-tide-700 hover:underline">{t(lang, "home.allCatches")}</Link>
            </div>
            {myCatches.length === 0 ? (
              <Card className="p-6 text-sm text-ink-500">{t(lang, "home.noCatches")}</Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {myCatches.map((c) => (
                  <CatchCard
                    key={c.id}
                    units={units}
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
                  <Users className="size-5 text-tide-600" /> {t(lang, "home.fromAnglers")}
                </SectionTitle>
                <Link href="/community" className="text-sm font-bold text-tide-700 hover:underline">{t(lang, "home.community")}</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {friendActivity.map((c) => (
                  <CatchCard
                    key={c.id}
                    units={units}
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
                      verifiedTitle: primaryTitle(titleMap.get(c.userId)),
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
          {/* industry news */}
          <NewsFeedCard lang={lang} />
          {proReports.length > 0 && (
            <div className="space-y-3">
              {proReports.map((r) => (
                <VerifiedReportCard key={r.id} report={r} compact />
              ))}
            </div>
          )}

          {/* upcoming trips */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0">{t(lang, "home.upcomingTrips")}</SectionTitle>
              <Link href="/trips" className="text-xs font-bold text-tide-700 hover:underline">{t(lang, "home.all")}</Link>
            </div>
            {upcomingTrips.length === 0 ? (
              <p className="text-sm text-ink-500">
                {t(lang, "home.nothingPlanned")} <Link href="/trips/new" className="font-bold text-tide-700 hover:underline">{t(lang, "home.planOne")}</Link> {t(lang, "home.aroundTide")}
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
                <BookmarkCheck className="size-4 text-tide-600" /> {t(lang, "home.savedGuides")}
              </SectionTitle>
              <Link href="/fish" className="text-xs font-bold text-tide-700 hover:underline">{t(lang, "home.findFishLink")}</Link>
            </div>
            {savedSpecies.length === 0 ? (
              <p className="text-sm text-ink-500">{t(lang, "home.saveGuidesHint")}</p>
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
              <SectionTitle className="mb-0">{t(lang, "home.gearLocker")}</SectionTitle>
              <Link href="/my-gear" className="text-xs font-bold text-tide-700 hover:underline">{t(lang, "home.open")}</Link>
            </div>
            <p className="text-sm text-ink-700">
              <strong>{gear.filter((g) => !g.wishlist).length}</strong> {t(lang, "home.items")} ·{" "}
              <strong>{gear.filter((g) => g.wishlist).length}</strong> {t(lang, "home.onWishlist")}
            </p>
            {gear.filter((g) => g.favorite).slice(0, 3).map((g) => (
              <div key={g.id} className="mt-2 text-sm text-ink-500">⭐ {g.name}</div>
            ))}
          </Card>

          {/* favorite spots */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0">{t(lang, "home.spots")}</SectionTitle>
              <Link href="/spots" className="text-xs font-bold text-tide-700 hover:underline">{t(lang, "home.map")}</Link>
            </div>
            {mySpots.length === 0 ? (
              <p className="text-sm text-ink-500">{t(lang, "home.noSpots")}</p>
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
