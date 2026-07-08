import Link from "next/link";
import { desc, eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { getDb, mediaAssets } from "@/db";
import { getUsage } from "@/lib/media";
import { formatBytes } from "@/lib/storage-admin";
import { PageHeader, Card } from "@/components/ui";
import { PhotoManager } from "@/components/photo-manager";

export const metadata = { title: "My Photos" };

export default async function MyPhotosPage() {
  const user = await requireUser();
  const db = await getDb();
  const [usage, assets] = await Promise.all([
    getUsage(user.id),
    db.query.mediaAssets.findMany({
      where: and(eq(mediaAssets.ownerId, user.id), eq(mediaAssets.status, "ready")),
      orderBy: [desc(mediaAssets.createdAt)],
      limit: 200,
    }),
  ]);

  const pct = Math.min(100, Math.round(usage.ratio * 100));

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="My Photos" subtitle="Manage your uploaded photos and storage." />

      <Card className="p-5 mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="font-display text-2xl font-extrabold text-ink-900">{formatBytes(usage.totalBytes)}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-ink-500">
              of {formatBytes(usage.quotaBytes)} · {usage.photoCount} photo{usage.photoCount === 1 ? "" : "s"}
            </div>
          </div>
          <div className={`text-sm font-bold ${usage.nearQuota ? "text-red-600" : "text-ink-500"}`}>{pct}%</div>
        </div>
        <div className="h-2.5 rounded-full bg-sand-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${usage.nearQuota ? "bg-red-500" : "bg-tide-500"}`}
            style={{ width: `${Math.max(2, pct)}%` }}
          />
        </div>
        {usage.nearQuota && (
          <p className="mt-2 text-sm text-red-600">
            You&apos;re close to your storage limit. Delete some photos to free up space.
          </p>
        )}
      </Card>

      <PhotoManager
        assets={assets.map((a) => ({
          id: a.id,
          kind: a.kind,
          url: `/api/media/${a.id}/thumbnail`,
          bytes: a.byteSize,
          visibility: a.visibility,
          createdAt: a.createdAt.toISOString(),
        }))}
      />

      <div className="mt-6 text-sm">
        <Link href="/settings" className="text-tide-700 hover:underline">← Back to settings</Link>
      </div>
    </div>
  );
}
