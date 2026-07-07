import Image from "next/image";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { UserCircle2, MapPin, Award, Fish, Backpack } from "lucide-react";
import { getDb, profiles, catches, follows, gearItems, spots, savedGuides } from "@/db";
import { auth } from "@/auth";
import { Card, Badge, WaterBadge, EmptyState, ButtonLink } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";
import { FollowButton } from "@/components/follow-button";
import { MessageButton } from "@/components/message-button";
import { ReportButton } from "@/components/report-button";

function badges(stats: { catches: number; species: number; released: number; trips: number }) {
  const out: { label: string; emoji: string }[] = [];
  if (stats.catches >= 1) out.push({ label: "First catch", emoji: "🎣" });
  if (stats.catches >= 10) out.push({ label: "10 catches", emoji: "🔟" });
  if (stats.catches >= 50) out.push({ label: "50 catches", emoji: "🏆" });
  if (stats.species >= 5) out.push({ label: "5 species", emoji: "🐟" });
  if (stats.species >= 15) out.push({ label: "Species collector", emoji: "🌊" });
  if (stats.released >= 10) out.push({ label: "Conservationist", emoji: "💚" });
  return out;
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const db = await getDb();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.username, username.toLowerCase()),
  });
  if (!profile) notFound();

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
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
  const earned = badges(stats);

  // friends = mutual follows (each follows the other)
  const followerIds = new Set(followerRows.map((f) => f.followerId));
  const friendsCount = followingRows.filter((f) => followerIds.has(f.followingId)).length;

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
            <div className="mt-2 flex flex-wrap gap-1.5">
              <WaterBadge water={profile.waterPref} />
              <Badge variant="neutral" className="capitalize">{profile.experience} angler</Badge>
              {profile.homeState && (
                <Badge variant="outline"><MapPin className="size-3" /> {profile.homeState}</Badge>
              )}
              {profile.fishingStyles.slice(0, 4).map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
            {profile.bio && <p className="mt-3 text-sm text-ink-700 leading-relaxed max-w-xl">{profile.bio}</p>}
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

        <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
          {[
            [stats.catches, "Catches"],
            [stats.species, "Species"],
            [stats.released, "Released"],
            [friendsCount, "Friends"],
            [followerRows.length, "Followers"],
            [followingRows.length, "Following"],
          ].map(([n, label]) => (
            <div key={label} className="rounded-xl bg-sand-100/70 py-3">
              <div className="font-display text-xl font-extrabold text-ink-900">{n}</div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{label}</div>
            </div>
          ))}
        </div>

        {earned.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {earned.map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full bg-bait-100 text-bait-700 px-3 py-1 text-xs font-bold">
                {b.emoji} {b.label}
              </span>
            ))}
            {saved.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-tide-100 text-tide-800 px-3 py-1 text-xs font-bold">
                <Award className="size-3.5" /> {saved.length} saved guide{saved.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}
      </Card>

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
                    <div className="font-bold text-sm text-ink-900">{g.name}</div>
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
