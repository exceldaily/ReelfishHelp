import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { UserCircle2, MapPin, Award, Fish, Backpack, Star, Waves } from "lucide-react";
import { BRAND_CATEGORIES, brandList } from "@/lib/favorite-brands";
import { getDb, profiles, catches, follows, gearItems, spots, savedGuides } from "@/db";
import { auth } from "@/auth";
import { getViewerUnits } from "@/lib/auth-helpers";
import { Card, Badge, EmptyState, ButtonLink } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";
import { FollowButton } from "@/components/follow-button";
import { MessageButton } from "@/components/message-button";
import { ReportButton } from "@/components/report-button";
import { BadgeRow } from "@/components/badge-row";
import { VerifiedTitleRow } from "@/components/verified-badge";
import { VerifiedReportCard } from "@/components/verified-report-card";
import { activeTitlesFor, latestVerifiedReports } from "@/lib/verified";
import { professionalProfiles } from "@/db/schema";
import { titleDef } from "@/data/verified-titles";
import { Globe, Phone, CalendarCheck } from "lucide-react";
import { earnedBadges } from "@/lib/badges";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const db = await getDb();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.username, username.toLowerCase()),
  });
  if (!profile) notFound();

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const units = await getViewerUnits();
  const isOwner = viewerId === profile.userId;

  const isFollowing = viewerId
    ? !!(await db.query.follows.findFirst({
        where: and(eq(follows.followerId, viewerId), eq(follows.followingId, profile.userId)),
      }))
    : false;

  // profile privacy
  if (!isOwner && profile.visibility === "private") {
    return (
      <div className="max-w-lg mx-auto pt-10">
        <EmptyState icon={<UserCircle2 />} title="This profile is private" body="The angler has chosen to keep their profile to themselves." />
      </div>
    );
  }
  const followerGated = !isOwner && profile.visibility === "followers" && !isFollowing;

  const [verifiedSlugs, proProfile, verifiedReports] = await Promise.all([
    activeTitlesFor(db, profile.userId),
    db.query.professionalProfiles.findFirst({ where: eq(professionalProfiles.userId, profile.userId) }),
    latestVerifiedReports(db, { userId: profile.userId, limit: 3 }),
  ]);

  const [allCatches, followerRows, followingRows, gear, sharedSpots, saved] = await Promise.all([
    db.query.catches.findMany({
      where: eq(catches.userId, profile.userId),
      orderBy: [desc(catches.caughtAt)],
      with: { species: true, photos: true, likes: true, comments: true },
    }),
    db.query.follows.findMany({ where: eq(follows.followingId, profile.userId) }),
    db.query.follows.findMany({ where: eq(follows.followerId, profile.userId) }),
    db.query.gearItems.findMany({
      where: and(eq(gearItems.userId, profile.userId), eq(gearItems.isPublic, true)),
      orderBy: [desc(gearItems.favorite), desc(gearItems.createdAt)],
    }),
    db.query.spots.findMany({
      where: and(eq(spots.userId, profile.userId), inArray(spots.privacy, ["shared_area", "public_broad"])),
    }),
    db.query.savedGuides.findMany({ where: eq(savedGuides.userId, profile.userId) }),
  ]);

  const visibleCatches = allCatches.filter((c) => {
    if (isOwner) return true;
    if (c.visibility === "public") return true;
    if (c.visibility === "followers") return isFollowing;
    return false;
  });

  const speciesSet = new Set(
    allCatches.map((c) => c.speciesId ?? c.customSpeciesName).filter(Boolean)
  );
  const stats = {
    catches: allCatches.length,
    species: speciesSet.size,
    released: allCatches.filter((c) => c.released).length,
    trips: 0,
  };
  const likesReceived = allCatches.reduce((n, c) => n + c.likes.length, 0);
  const earned = await earnedBadges(db, profile.userId, {
    catchCount: allCatches.length,
    likesReceived,
  });

  // friends = mutual follows (each follows the other)
  const followerIds = new Set(followerRows.map((f) => f.followerId));
  const friendsCount = followingRows.filter((f) => followerIds.has(f.followingId)).length;

  const brandEntries = BRAND_CATEGORIES.map(
    ([key, label]) => [label, brandList(profile.favoriteBrands[key])] as const
  ).filter(([, list]) => list.length > 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* header */}
      <Card className="p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-start gap-5">
          {profile.avatarUrl ? (
            <div className="relative size-20 rounded-full overflow-hidden bg-tide-100 shrink-0">
              <Image src={profile.avatarUrl} alt="" fill sizes="80px" className="object-cover" unoptimized={profile.avatarUrl.startsWith("/api/")} />
            </div>
          ) : (
            <div className="size-20 rounded-full bg-tide-100 grid place-items-center shrink-0">
              <UserCircle2 className="size-11 text-tide-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold text-ink-900">{profile.displayName}</h1>
            <div className="text-sm text-ink-500">@{profile.username}</div>
            {verifiedSlugs.length > 0 && (
              <div className="mt-1.5">
                <VerifiedTitleRow slugs={verifiedSlugs} />
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2.5">
            {!isOwner && (
              <>
                <FollowButton targetUserId={profile.userId} initialFollowing={isFollowing} signedIn={!!viewerId} />
                <MessageButton targetUserId={profile.userId} signedIn={!!viewerId} />
                <ReportButton targetType="profile" targetId={profile.userId} signedIn={!!viewerId} />
              </>
            )}
            {isOwner && <ButtonLink href="/settings" variant="outline" size="sm">Edit profile</ButtonLink>}
          </div>
        </div>

        {/* meta line spans the full card (like the bio) so it never gets squeezed beside the avatar on phones */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-ink-500">
          <span
            className={`inline-flex items-center gap-1 ${
              profile.waterPref === "saltwater" ? "text-tide-700" : profile.waterPref === "freshwater" ? "text-moss-600" : "text-reef-600"
            }`}
          >
            <Waves className="size-3.5" />
            {profile.waterPref === "both" ? "Fresh + Salt" : profile.waterPref === "saltwater" ? "Saltwater" : "Freshwater"}
          </span>
          <span aria-hidden className="text-sand-400">•</span>
          <span>{profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)} angler</span>
          {profile.homeState && (
            <>
              <span aria-hidden className="text-sand-400">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {profile.homeState}
              </span>
            </>
          )}
          {profile.fishingStyles.length > 0 && (
            <>
              <span aria-hidden className="text-sand-400">•</span>
              <span className="font-medium">{profile.fishingStyles.slice(0, 4).join(" · ")}</span>
            </>
          )}
        </div>

        {/* Tackle Favorites — a tackle-box style card with the label riding the top border */}
        {brandEntries.length > 0 && (
          <div className="relative mt-5 rounded-2xl border border-sand-300/80 bg-gradient-to-br from-sand-50/90 to-card px-4 pb-3.5 pt-4">
            <span className="absolute -top-3 left-3.5 inline-flex items-center gap-1 rounded-full border border-sand-300/80 bg-bait-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-bait-700 shadow-sm">
              <Star className="size-3 fill-bait-500 text-bait-500" /> Tackle Favorites
            </span>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {brandEntries.map(([label, list]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-bait-700/80">{label}</dt>
                  <dd className="text-[13px] font-semibold leading-snug text-ink-800">{list.join("  ·  ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* bio spans the full card so it never gets squeezed beside the avatar on phones */}
        {profile.bio && <p className="mt-4 text-sm text-ink-700 leading-relaxed max-w-2xl">{profile.bio}</p>}

        {/* earned badges — hover or focus one to see what it's for */}
        {earned.length > 0 && (
          <div className="mt-4">
            <BadgeRow badges={earned} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
          {[
            { n: stats.catches, label: "Catches" },
            { n: stats.species, label: "Species" },
            { n: stats.released, label: "Released" },
            { n: friendsCount, label: "Friends" },
            { n: followerRows.length, label: "Followers", href: `/u/${profile.username}/followers` },
            { n: followingRows.length, label: "Following", href: `/u/${profile.username}/following` },
          ].map(({ n, label, href }) => {
            const inner = (
              <>
                <div className="font-display text-xl font-extrabold text-ink-900">{n}</div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{label}</div>
              </>
            );
            return href ? (
              <Link key={label} href={href} className="rounded-xl bg-sand-100/70 py-3 hover:bg-sand-200 transition-colors">
                {inner}
              </Link>
            ) : (
              <div key={label} className="rounded-xl bg-sand-100/70 py-3">
                {inner}
              </div>
            );
          })}
        </div>

        {saved.length > 0 && (
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tide-100 text-tide-800 px-3 py-1 text-xs font-bold">
              <Award className="size-3.5" /> {saved.length} saved guide{saved.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </Card>

      {/* professional profile — public fields unlocked by an approved title */}
      {verifiedSlugs.length > 0 && proProfile && (
        <Card className="mb-6 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
            <CalendarCheck className="size-5 text-reef-500" />
            {proProfile.businessName ?? titleDef(verifiedSlugs[0])?.label}
          </h2>
          {proProfile.publicBio && <p className="text-sm leading-relaxed text-ink-700">{proProfile.publicBio}</p>}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-700">
            {proProfile.serviceArea && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-tide-600" /> {proProfile.serviceArea}</span>}
            {proProfile.address && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-tide-600" /> {proProfile.address}</span>}
            {proProfile.phone && <span className="inline-flex items-center gap-1.5"><Phone className="size-4 text-tide-600" /> {proProfile.phone}</span>}
            {proProfile.website && (
              <a href={proProfile.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 font-semibold text-tide-700 hover:underline">
                <Globe className="size-4" /> Website
              </a>
            )}
            {proProfile.hours && <span className="text-ink-500">{proProfile.hours}</span>}
          </div>
          {Object.keys(proProfile.details).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(proProfile.details).map(([k, v]) => (
                <Badge key={k} variant="neutral">{v}</Badge>
              ))}
            </div>
          )}
          {proProfile.bookingLink && (
            <a
              href={proProfile.bookingLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-bait-500 px-4 text-sm font-bold text-white hover:bg-bait-600"
            >
              Book a trip
            </a>
          )}
        </Card>
      )}

      {/* latest verified reports by this pro */}
      {verifiedReports.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
            <CalendarCheck className="size-5 text-tide-600" /> Latest reports
          </h2>
          {verifiedReports.map((r) => (
            <VerifiedReportCard key={r.id} report={r} compact />
          ))}
        </div>
      )}

      {followerGated ? (
        <EmptyState
          icon={<UserCircle2 />}
          title="Followers only"
          body="Follow this angler to see their catches and activity."
        />
      ) : (
        <>
          {/* catches */}
          <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
            <Fish className="size-5 text-tide-600" /> {isOwner ? "Your catches" : "Recent catches"}
          </h2>
          {visibleCatches.length === 0 ? (
            <Card className="p-6 text-sm text-ink-500 mb-6">No visible catches yet.</Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {visibleCatches.slice(0, 9).map((c) => (
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
                    showLocation: isOwner || c.showLocation,
                    likeCount: c.likes.length,
                    commentCount: c.comments.length,
                  }}
                />
              ))}
            </div>
          )}

          {/* public gear */}
          {gear.length > 0 && (
            <>
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                <Backpack className="size-5 text-tide-600" /> Public gear
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {gear.map((g) => (
                  <Card key={g.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-ink-900">{g.name}</div>
                      {g.favorite && (
                        <Badge variant="orange" className="shrink-0">
                          <Star className="size-3 fill-bait-500 text-bait-500" /> Favorite gear
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {[g.brand, g.model].filter(Boolean).join(" · ") || g.category}
                    </div>
                    {g.notes && <p className="mt-1.5 text-xs text-ink-500 line-clamp-2">{g.notes}</p>}
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* shared areas */}
          {sharedSpots.length > 0 && (
            <>
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                <MapPin className="size-5 text-tide-600" /> Shared fishing areas
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 mb-8">
                {sharedSpots.map((s) => (
                  <Card key={s.id} className="p-4">
                    <div className="font-bold text-sm text-ink-900">{s.areaLabel ?? s.name}</div>
                    <div className="mt-1 flex gap-1.5">
                      <Badge variant={s.privacy === "shared_area" ? "salt" : "orange"}>
                        {s.privacy === "shared_area" ? "General area" : "Broad area"}
                      </Badge>
                      {s.waterType && <Badge variant="outline">{s.waterType}</Badge>}
                    </div>
                    {s.speciesNotes && <p className="mt-2 text-xs text-ink-500">Fish here: {s.speciesNotes}</p>}
                    <p className="mt-1.5 text-[11px] text-ink-300">Exact location not shared.</p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
