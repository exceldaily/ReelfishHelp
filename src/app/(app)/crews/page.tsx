import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { UsersRound, PlusCircle, Lock, MapPin } from "lucide-react";
import { getDb, crews, crewMembers, type Crew } from "@/db";
import { currentUser, getViewerLang } from "@/lib/auth-helpers";
import { t } from "@/lib/i18n";
import { US_STATES } from "@/data/regulations";
import { PageHeader, Card, Badge, ButtonLink, EmptyState, SectionTitle } from "@/components/ui";
import { InviteJoin } from "@/components/invite-join";

export const metadata = { title: "Crews" };

const stateName = (code: string | null) =>
  code ? US_STATES.find((s) => s.code === code)?.name ?? code : null;

function CrewCard({ crew, mine }: { crew: Crew; mine?: boolean }) {
  return (
    <Link
      href={`/crews/${crew.slug}`}
      className="group bg-card rounded-2xl border border-edge shadow-card overflow-hidden hover:shadow-lift transition-shadow"
    >
      <div className="relative h-28 bg-gradient-to-br from-tide-800 to-tide-950">
        {crew.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crew.avatarUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <UsersRound className="size-9 text-tide-500/60" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {crew.privacy === "private" ? (
            <Badge variant="dark"><Lock className="size-3" /> Private</Badge>
          ) : (
            <Badge variant="salt">Open</Badge>
          )}
          {mine && <Badge variant="orange">Member</Badge>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">{crew.name}</h3>
        {crew.description && <p className="mt-1 text-sm text-ink-500 line-clamp-2">{crew.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1"><UsersRound className="size-3.5" />{crew.memberCount} {crew.memberCount === 1 ? "member" : "members"}</span>
          {stateName(crew.homeState) && (
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{stateName(crew.homeState)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function CrewsPage() {
  const db = await getDb();
  const user = await currentUser();
  const lang = await getViewerLang();

  const myMemberships = user
    ? await db.query.crewMembers.findMany({
        where: eq(crewMembers.userId, user.id),
        with: { crew: true },
      })
    : [];
  const myCrews = myMemberships
    .map((m) => m.crew)
    .filter((c): c is Crew => !!c)
    .sort((a, b) => a.name.localeCompare(b.name));
  const myCrewIds = new Set(myCrews.map((c) => c.id));

  const openCrews = await db.query.crews.findMany({
    where: eq(crews.privacy, "open"),
    orderBy: [desc(crews.memberCount), desc(crews.createdAt)],
    limit: 60,
  });
  const discover = openCrews.filter((c) => !myCrewIds.has(c.id));

  return (
    <div>
      <PageHeader
        title={t(lang, "page.crewsTitle")}
        subtitle="Team up with other anglers. Crews are open (anyone can join) or private (invite-only) — each has its own members-only feed of posts and shared catches."
        action={
          <ButtonLink href="/crews/new">
            <PlusCircle className="size-4" /> Create a crew
          </ButtonLink>
        }
      />

      {user && (
        <Card className="p-4 mb-6">
          <SectionTitle className="mb-2">Have an invite code?</SectionTitle>
          <p className="text-sm text-ink-500 mb-3">Private crews aren&apos;t listed here — join one with the code a member gave you.</p>
          <InviteJoin />
        </Card>
      )}

      {myCrews.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Your crews</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCrews.map((c) => (
              <CrewCard key={c.id} crew={c} mine />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>Discover crews</SectionTitle>
        {discover.length === 0 ? (
          <EmptyState
            icon={<UsersRound />}
            title="No open crews yet"
            body="Be the first to start one — create a crew and invite your fishing buddies."
            action={<ButtonLink href="/crews/new">Create a crew</ButtonLink>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discover.map((c) => (
              <CrewCard key={c.id} crew={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
