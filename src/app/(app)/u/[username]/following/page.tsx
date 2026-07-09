import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { loadConnections } from "@/lib/follows-data";
import { ConnectionsView } from "@/components/connections-view";

export const metadata = { title: "Following" };

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const res = await loadConnections(username, "following", viewerId);
  if (res.status === "not_found") notFound();
  return <ConnectionsView res={res} tab="following" viewerId={viewerId} />;
}
