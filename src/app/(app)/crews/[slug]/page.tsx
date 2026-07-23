import Link from "next/link";
import { verifiedTitleMap, primaryTitle } from "@/lib/verified";
import { VerifiedTitleBadge } from "@/components/verified-badge";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { UsersRound, Lock, MapPin, Settings, Trash2, UserCircle2 } from "lucide-react";
import { getDb, crews, crewPosts, catches, type Crew } from "@/db";
import { currentUser } from "@/lib/auth-helpers";
import { crewRole, canModerate } from "@/lib/crews";
import { US_STATES } from "@/data/regulations";
import { PageHeader, Card, Badge, Button, ButtonLink, SectionTitle, EmptyState } from "@/components/ui";
import { CatchCard } from "@/components/catch-card";
import { CrewPostForm } from "@/components/crew-post-form";
import { InviteJoin } from "@/components/invite-join";
import { joinCrew, leaveCrew, deleteCrewPost, removeMember, setMemberRole } from "@/lib/actions/crew-actions";

const stateName = (code: string | null) =>
  code ? US_STATES.find((s) => s.code === code)?.name ?? code : null;
const roleRank: Record<string, number> = { owner: 0, admin: 1, member: 2 };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const crew = await db.query.crews.findFirst({ where: eq(crews.slug, slug) });
  return { title: crew?.name ?? "Crew" };
}

function Avatar({ url, className = "size-8" }: { url: string | null | undefined; className?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={`${className} shrink-0 rounded-full object-cover`} />;
  }
  return <UserCircle2 className={`${className} shrink-0 text-ink-300`} />;
}

function PrivateGate({ crew, loggedIn }: { crew: Crew; loggedIn: boolean }) {
  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title={crew.name} subtitle="This crew is private." />
      <Card className="p-6 text-center">
        <Lock className="size-8 mx-auto text-ink-300" />
        <h3 className="mt-2 font-display font-bold text-ink-900">Invite-only crew</h3>
        <p className="mt-1 text-sm text-ink-500">Ask a member for the invite code to join and see the feed.</p>
        <div className="mt-4 text-left">
          {loggedIn ? <InviteJoin /> : <div className="text-center"><ButtonLink href="/login">Log in to join</ButtonLink></div>}
        </div>
      </Card>
    </div>
  );
}

export default async function CrewDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const user = await currentUser();

  const crew = await db.query.crews.findFirst({
    where: eq(crews.slug, slug),
    with: {
      owner: { with: { profile: true } },
      members: { with: { user: { with: { profile: true } } } },
    },
  });
  if (!crew) notFound();

  const role = await crewRole(crew.id, user?.id);
  const isMember = !!role;
  const isOwner = role === "owner";
  const moderator = canModerate(role);

  // Private crews never expose their feed or member list to non-members.
  if (crew.privacy === "private" && !isMember) {
    return <PrivateGate crew={crew} loggedIn={!!user} />;
  }

  const posts = isMember
    ? await db.query.crewPosts.findMany({
        where: eq(crewPosts.crewId, crew.id),
        orderBy: [desc(crewPosts.createdAt)],
        limit: 50,
        with: {
          user: { with: { profile: true } },
          catch: { with: { species: true, photos: true } },
        },
      })
    : [];

  const myCatches =
    isMember && user
      ? await db.query.catches.findMany({
          where: and(eq(catches.userId, user.id), eq(catches.visibility, "public")),
          orderBy: [desc(catches.caughtAt)],
          limit: 50,
          with: { species: true },
        })
      : [];
  const catchOptions = myCatches.map((c) => ({
    id: c.id,
    label: `${c.species?.commonName ?? c.customSpeciesName ?? "Catch"} — ${new Date(c.caughtAt).toLocaleDateString()}`,
  }));

  const titleMap = await verifiedTitleMap(db, [
    ...posts.map((p) => p.userId),
    ...crew.members.map((m) => m.userId),
  ]);

  const members = [...crew.members].sort(
    (a, b) =>
      (roleRank[a.role] - roleRank[b.role]) ||
      (a.user.profile?.displayName ?? "").localeCompare(b.user.profile?.displayName ?? "")
  );

  return (
    <div>
      {/* header */}
      <Card className="overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-br from-tide-800 to-tide-950 relative">
          {crew.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={crew.avatarUrl} alt="" className="absolute inset-0 size-full object-cover" />
          )}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-ink-900">{crew.name}</h1>
                {crew.privacy === "private" ? (
                  <Badge variant="dark"><Lock className="size-3" /> Private</Badge>
                ) : (
                  <Badge variant="salt">Open</Badge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                <span className="inline-flex items-center gap-1"><UsersRound className="size-4" />{crew.memberCount} {crew.memberCount === 1 ? "member" : "members"}</span>
                {stateName(crew.homeState) && (
                  <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{stateName(crew.homeState)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!user ? (
                <ButtonLink href="/login" size="sm">Log in to join</ButtonLink>
              ) : isOwner ? (
                <>
                  <Badge variant="dark">Owner</Badge>
                  <ButtonLink href={`/crews/${crew.slug}/settings`} variant="outline" size="sm">
                    <Settings className="size-4" /> Manage
                  </ButtonLink>
                </>
              ) : isMember ? (
                <form action={leaveCrew}>
                  <input type="hidden" name="crewId" value={crew.id} />
                  <Button type="submit" variant="outline" size="sm">Leave crew</Button>
                </form>
              ) : crew.privacy === "open" ? (
                <form action={joinCrew}>
                  <input type="hidden" name="crewId" value={crew.id} />
                  <Button type="submit" size="sm">Join crew</Button>
                </form>
              ) : null}
            </div>
          </div>
          {crew.description && <p className="mt-3 text-[15px] text-ink-700 whitespace-pre-wrap">{crew.description}</p>}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* feed */}
        <div className="space-y-4">
          {isMember ? (
            <>
              <CrewPostForm crewId={crew.id} catches={catchOptions} />
              {posts.length === 0 ? (
                <EmptyState icon={<UsersRound />} title="No posts yet" body="Be the first to share something with your crew." />
              ) : (
                posts.map((p) => (
                  <Card key={p.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar url={p.user.profile?.avatarUrl} />
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">{p.user.profile?.displayName ?? "Angler"} <VerifiedTitleBadge slug={primaryTitle(titleMap.get(p.userId))} compact /></div>
                          <div className="text-xs text-ink-400">
                            {new Date(p.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </div>
                      {(p.userId === user?.id || moderator) && (
                        <form action={deleteCrewPost}>
                          <input type="hidden" name="postId" value={p.id} />
                          <button type="submit" aria-label="Delete post" className="text-ink-300 hover:text-red-600">
                            <Trash2 className="size-4" />
                          </button>
                        </form>
                      )}
                    </div>
                    {p.body && <p className="mt-3 text-[15px] text-ink-800 whitespace-pre-wrap">{p.body}</p>}
                    {p.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt="" className="mt-3 rounded-xl max-h-96 w-full object-cover" />
                    )}
                    {p.catch && (
                      <div className="mt-3">
                        <CatchCard
                          c={{
                            id: p.catch.id,
                            speciesName: p.catch.species?.commonName ?? p.catch.customSpeciesName ?? "Catch",
                            photoUrl: p.catch.photos?.[0]?.url ?? null,
                            caughtAt: p.catch.caughtAt,
                            lengthIn: p.catch.lengthIn,
                            weightLb: p.catch.weightLb,
                            bait: p.catch.bait,
                            released: p.catch.released,
                            visibility: p.catch.visibility,
                            locationLabel: p.catch.broadAreaLabel ?? p.catch.locationLabel,
                            showLocation: !!(p.catch.broadAreaLabel ?? (p.catch.showLocation ? p.catch.locationLabel : null)),
                            author: null,
                          }}
                        />
                      </div>
                    )}
                  </Card>
                ))
              )}
            </>
          ) : (
            <EmptyState
              icon={<UsersRound />}
              title="Join to see the feed"
              body="This crew's posts and shared catches are visible to members only."
            />
          )}
        </div>

        {/* members */}
        <div>
          <SectionTitle>Members</SectionTitle>
          <Card className="p-3">
            <ul className="divide-y divide-sand-100">
              {members.map((m) => {
                const prof = m.user.profile;
                const isCrewOwner = m.role === "owner";
                return (
                  <li key={m.userId} className="flex items-center justify-between gap-2 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar url={prof?.avatarUrl} className="size-7" />
                      <div className="min-w-0">
                        {prof ? (
                          <Link href={`/u/${prof.username}`} className="text-sm font-semibold text-ink-900 hover:text-tide-700 truncate block">
                            <span className="inline-flex items-center gap-1.5">{prof.displayName} <VerifiedTitleBadge slug={primaryTitle(titleMap.get(m.userId))} compact /></span>
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-ink-900">Angler</span>
                        )}
                      </div>
                      {m.role !== "member" && (
                        <Badge variant={isCrewOwner ? "dark" : "outline"} className="capitalize">{m.role}</Badge>
                      )}
                    </div>
                    {moderator && !isCrewOwner && m.userId !== user?.id && (
                      <div className="flex items-center gap-2 shrink-0">
                        {isOwner && (
                          <form action={setMemberRole}>
                            <input type="hidden" name="crewId" value={crew.id} />
                            <input type="hidden" name="userId" value={m.userId} />
                            <input type="hidden" name="role" value={m.role === "admin" ? "member" : "admin"} />
                            <button type="submit" className="text-xs font-semibold text-tide-700 hover:underline">
                              {m.role === "admin" ? "Demote" : "Make admin"}
                            </button>
                          </form>
                        )}
                        {(isOwner || m.role !== "admin") && (
                          <form action={removeMember}>
                            <input type="hidden" name="crewId" value={crew.id} />
                            <input type="hidden" name="userId" value={m.userId} />
                            <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
                          </form>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
