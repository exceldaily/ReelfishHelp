import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { loadConnections } from "@/lib/follows-data";
import { ConnectionsView } from "@/components/connections-view";

export const metadata = { title: "Followers" };

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const res = await loadConnections(username, "followers", viewerId);
  if (res.status === "not_found") notFound();
  return <ConnectionsView res={res} tab="followers" viewerId={viewerId} />;
}
