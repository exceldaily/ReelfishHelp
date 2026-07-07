import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { MapPin, Ruler, Weight, Trash2 } from "lucide-react";
import { getDb, catches, follows, likes as likesTable, savedPosts } from "@/db";
import { auth } from "@/auth";
import { Card, Badge, WaterBadge, ButtonLink } from "@/components/ui";
import { CatchSocialBar, CommentSection } from "@/components/catch-social";
import { deleteCatch } from "@/lib/actions/catch-actions";

export default async function CatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const c = await db.query.catches.findFirst({
    where: eq(catches.id, id),
    with: {
      species: true,
      photos: true,
      likes: true,
      comments: { with: { user: { with: { profile: true } } } },
      user: { with: { profile: true } },
    },
  });
  if (!c) notFound();

  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const isOwner = viewerId === c.userId;
  const isAdmin = session?.user?.role === "admin";

  // visibility enforcement
  if (!isOwner && !isAdmin) {
    if (c.visibility === "private") notFound();
    if (c.visibility === "followers") {
      if (!viewerId) notFound();
      const f = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, viewerId), eq(follows.followingId, c.userId)),
      });
      if (!f) notFound();
    }
  }

  const liked = viewerId
    ? !!(await db.query.likes.findFirst({
        where: and(eq(likesTable.userId, viewerId), eq(likesTable.catchId, c.id)),
      }))
    : false;
  const saved = viewerId
    ? !!(await db.query.savedPosts.findFirst({
        where: and(eq(savedPosts.userId, viewerId), eq(savedPosts.catchId, c.id)),
      }))
    : false;

  const speciesName = c.species?.commonName ?? c.customSpeciesName ?? "Unknown species";
  const authorProfile = c.user.profile;
  const showLocation = isOwner || c.showLocation;

  return (
    <div className="max-w-3xl mx-auto">
      {/* photos */}
      {c.photos.length > 0 && (
        <div className={`grid gap-2 mb-5 ${c.photos.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {c.photos.map((p, i) => (
            <div key={p.id} className={`relative rounded-2xl overflow-hidden bg-tide-950 ${i === 0 ? "h-80 sm:col-span-2" : "h-52"}`}>
              <Image
                src={p.url}
                alt={`${speciesName} photo ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
                unoptimized={p.url.startsWith("/api/")}
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">{speciesName}</h1>
            <div className="mt-1 text-sm text-ink-500">
              {authorProfile ? (
                <Link href={`/u/${authorProfile.username}`} className="font-semibold hover:text-tide-700">
                  {authorProfile.displayName} @{authorProfile.username}
                </Link>
              ) : (
                "An angler"
              )}
              {" · "}
              {new Date(c.caughtAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
          <div className="flex gap-1.5">
            {c.species && <WaterBadge water={c.species.water} />}
            {c.released ? <Badge variant="fresh">Released</Badge> : <Badge variant="neutral">Kept</Badge>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {c.lengthIn != null && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand-100 px-3.5 py-2 text-sm font-bold">
              <Ruler className="size-4 text-tide-600" /> {c.lengthIn}&quot;
            </span>
          )}
          {c.weightLb != null && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand-100 px-3.5 py-2 text-sm font-bold">
              <Weight className="size-4 text-tide-600" /> {c.weightLb} lb
            </span>
          )}
          {showLocation && c.locationLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand-100 px-3.5 py-2 text-sm font-bold">
              <MapPin className="size-4 text-tide-600" /> {c.locationLabel}
              <span className="text-xs font-normal text-ink-500">(approximate)</span>
            </span>
          )}
        </div>

        <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {c.bait && (
            <div><dt className="font-bold text-ink-300 text-xs uppercase tracking-wide">Bait / lure</dt><dd className="text-ink-700 mt-0.5">{c.bait}</dd></div>
          )}
          {c.gearNotes && (
            <div><dt className="font-bold text-ink-300 text-xs uppercase tracking-wide">Gear</dt><dd className="text-ink-700 mt-0.5">{c.gearNotes}</dd></div>
          )}
          {c.method && (
            <div><dt className="font-bold text-ink-300 text-xs uppercase tracking-wide">Method</dt><dd className="text-ink-700 mt-0.5 capitalize">{c.method}{c.waterType ? ` · ${c.waterType}` : ""}</dd></div>
          )}
          {c.weatherNotes && (
            <div><dt className="font-bold text-ink-300 text-xs uppercase tracking-wide">Weather</dt><dd className="text-ink-700 mt-0.5">{c.weatherNotes}</dd></div>
          )}
          {c.tideNotes && (
            <div><dt className="font-bold text-ink-300 text-xs uppercase tracking-wide">Tide</dt><dd className="text-ink-700 mt-0.5">{c.tideNotes}</dd></div>
          )}
        </dl>

        {c.story && <p className="mt-5 text-[15px] text-ink-700 leading-relaxed whitespace-pre-line">{c.story}</p>}

        {c.species && (
          <div className="mt-5">
            <ButtonLink href={`/fish/${c.species.slug}`} variant="secondary" size="sm">
              Open the {c.species.commonName} catch guide →
            </ButtonLink>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-sand-100">
          <CatchSocialBar
            catchId={c.id}
            initialLiked={liked}
            initialSaved={saved}
            likeCount={c.likes.length}
            signedIn={!!viewerId}
          />
        </div>

        <div className="mt-6 pt-5 border-t border-sand-100">
          <CommentSection
            catchId={c.id}
            comments={c.comments.map((cm) => ({
              id: cm.id,
              body: cm.body,
              createdAt: cm.createdAt.toISOString(),
              userId: cm.userId,
              author: cm.user.profile?.displayName ?? "Angler",
              username: cm.user.profile?.username ?? null,
            }))}
            signedIn={!!viewerId}
            currentUserId={viewerId}
            catchOwnerId={c.userId}
            isAdmin={isAdmin}
          />
        </div>

        {isOwner && (
          <form
            action={async () => {
              "use server";
              await deleteCatch(c.id);
            }}
            className="mt-6 pt-4 border-t border-sand-100 text-right"
          >
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-300 hover:text-red-600">
              <Trash2 className="size-3.5" /> Delete this catch
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
