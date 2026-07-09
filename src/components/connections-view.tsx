import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { Card, WaterBadge, Badge, EmptyState, PageHeader } from "@/components/ui";
import { FollowButton } from "@/components/follow-button";
import type { ConnectionsResult } from "@/lib/follows-data";

type Loaded = Exclude<ConnectionsResult, { status: "not_found" }>;

function Tabs({ base, tab }: { base: string; tab: "followers" | "following" }) {
  const cls = (active: boolean) =>
    `rounded-lg px-4 py-1.5 text-sm font-bold ${active ? "bg-white shadow-card text-ink-900" : "text-ink-500 hover:text-ink-900"}`;
  return (
    <div className="flex gap-1.5 rounded-xl bg-sand-100 p-1 w-fit mb-5">
      <Link href={`${base}/followers`} className={cls(tab === "followers")}>Followers</Link>
      <Link href={`${base}/following`} className={cls(tab === "following")}>Following</Link>
    </div>
  );
}

export function ConnectionsView({
  res,
  tab,
  viewerId,
}: {
  res: Loaded;
  tab: "followers" | "following";
  viewerId: string | null;
}) {
  const profile = res.profile;
  const base = `/u/${profile.username}`;

  if (res.status === "private") {
    return (
      <div className="max-w-lg mx-auto pt-10">
        <EmptyState icon={<UserCircle2 />} title="This profile is private" body="The angler has chosen to keep their profile to themselves." />
      </div>
    );
  }
  if (res.status === "gated") {
    return (
      <div className="max-w-2xl mx-auto">
        <Link href={base} className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-3">
          <ArrowLeft className="size-4" /> {profile.displayName}
        </Link>
        <EmptyState icon={<UserCircle2 />} title="Followers only" body="Follow this angler to see their connections." />
      </div>
    );
  }

  const { people } = res;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={base} className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> {profile.displayName}
      </Link>
      <PageHeader title={tab === "followers" ? "Followers" : "Following"} subtitle={`@${profile.username}`} />
      <Tabs base={base} tab={tab} />

      {people.length === 0 ? (
        <EmptyState
          icon={<UserCircle2 />}
          title={tab === "followers" ? "No followers yet" : "Not following anyone yet"}
          body={
            tab === "followers"
              ? "When anglers follow this profile, they'll show up here."
              : "Follow other anglers to see their catches and activity in your feed."
          }
        />
      ) : (
        <div className="space-y-2">
          {people.map((p) => (
            <Card key={p.userId} className="p-3.5 flex items-center gap-3">
              <Link href={`/u/${p.username}`} className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80">
                {p.avatarUrl ? (
                  <div className="relative size-11 rounded-full overflow-hidden bg-tide-100 shrink-0">
                    <Image src={p.avatarUrl} alt="" fill sizes="44px" className="object-cover" unoptimized={p.avatarUrl.startsWith("/api/")} />
                  </div>
                ) : (
                  <UserCircle2 className="size-11 text-tide-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-bold text-sm text-ink-900 truncate">{p.displayName}</div>
                  <div className="text-xs text-ink-500 truncate">@{p.username}</div>
                </div>
              </Link>
              <div className="hidden sm:flex gap-1.5 shrink-0">
                <WaterBadge water={p.waterPref} />
                {p.homeState && <Badge variant="outline">{p.homeState}</Badge>}
              </div>
              {viewerId && p.userId !== viewerId && (
                <FollowButton targetUserId={p.userId} initialFollowing={p.viewerFollows} signedIn />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
