import Link from "next/link";
import { HardDrive, AlertTriangle, ImageIcon, Users as UsersIcon, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth-helpers";
import { getStorageStats, formatBytes } from "@/lib/storage-admin";
import { PageHeader, Card, Badge } from "@/components/ui";
import { StorageCleanupButton } from "@/components/storage-cleanup-button";

export const metadata = { title: "Storage — Admin" };

const BACKEND_LABEL: Record<string, string> = {
  r2: "Cloudflare R2",
  blob: "Vercel Blob",
  local: "Local disk (dev)",
};

export default async function AdminStoragePage() {
  await requireAdmin();
  const s = await getStorageStats();
  const maxDay = Math.max(1, ...s.perDay.map((d) => d.count));

  return (
    <div>
      <PageHeader
        title={<span className="inline-flex items-center gap-2.5"><HardDrive className="size-7 text-tide-600" /> Storage</span>}
        subtitle="Photo storage usage and lifecycle management."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-500">Backend:</span>
        <Badge variant={s.backend === "r2" ? "salt" : s.backend === "blob" ? "neutral" : "orange"}>
          {BACKEND_LABEL[s.backend]}
        </Badge>
        {s.backend !== "r2" && (
          <span className="text-ink-400">— set R2 env vars to switch to Cloudflare R2</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          [formatBytes(s.totalBytes), "Total stored", ImageIcon],
          [s.readyAssets, "Photos", ImageIcon],
          [s.failedAssets, "Failed uploads", AlertTriangle],
          [s.pendingPurge, "Pending purge", Trash2],
        ].map(([n, label, Icon]) => {
          const I = Icon as React.ComponentType<{ className?: string }>;
          return (
            <Card key={label as string} className="p-4 flex items-center gap-3">
              <span className="size-10 rounded-xl bg-tide-100 grid place-items-center"><I className="size-5 text-tide-700" /></span>
              <div>
                <div className="font-display text-xl font-extrabold text-ink-900">{n as React.ReactNode}</div>
                <div className="text-xs font-bold uppercase tracking-wide text-ink-500">{label as string}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-8">
        {/* by category */}
        <Card className="p-5">
          <h3 className="font-display font-bold text-ink-900 mb-3">Storage by category</h3>
          {s.byKind.length === 0 ? (
            <p className="text-sm text-ink-500">No media stored yet.</p>
          ) : (
            <ul className="space-y-2">
              {s.byKind
                .sort((a, b) => b.bytes - a.bytes)
                .map((k) => (
                  <li key={k.kind} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-ink-700">{k.kind}</span>
                    <span className="text-ink-500">
                      {formatBytes(k.bytes)} <span className="text-ink-400">· {k.count}</span>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        {/* upload activity */}
        <Card className="p-5">
          <h3 className="font-display font-bold text-ink-900 mb-3">Uploads · last 14 days</h3>
          {s.perDay.length === 0 ? (
            <p className="text-sm text-ink-500">No recent uploads.</p>
          ) : (
            <div className="flex items-end gap-1 h-28">
              {s.perDay.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.count} (${formatBytes(d.bytes)})`}>
                  <div
                    className="w-full rounded-t bg-tide-400"
                    style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count ? 4 : 0 }}
                  />
                  <span className="text-[9px] text-ink-400">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* top users */}
      <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
        <UsersIcon className="size-5 text-tide-600" /> Largest storage users
      </h2>
      <Card className="p-0 overflow-hidden mb-8">
        {s.topUsers.length === 0 ? (
          <p className="p-6 text-sm text-ink-500">No users have uploaded photos yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-tide-50 text-ink-500 text-left">
              <tr>
                <th className="px-4 py-2 font-bold">User</th>
                <th className="px-4 py-2 font-bold text-right">Photos</th>
                <th className="px-4 py-2 font-bold text-right">Storage</th>
                <th className="px-4 py-2 font-bold text-right">% of default quota</th>
              </tr>
            </thead>
            <tbody>
              {s.topUsers.map((u) => {
                const pct = Math.round((u.bytes / s.defaultQuotaBytes) * 100);
                return (
                  <tr key={u.userId} className="border-t border-tide-100">
                    <td className="px-4 py-2">
                      {u.username ? (
                        <Link href={`/u/${u.username}`} className="text-tide-700 hover:underline">@{u.username}</Link>
                      ) : (
                        <span className="text-ink-400">{u.userId.slice(0, 8)}…</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-ink-600">{u.count}</td>
                    <td className="px-4 py-2 text-right text-ink-600">{formatBytes(u.bytes)}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={pct >= s.alertRatio * 100 ? "text-red-600 font-bold" : "text-ink-500"}>{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* lifecycle controls */}
      <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
        <Trash2 className="size-5 text-tide-600" /> Lifecycle cleanup
      </h2>
      <Card className="p-5">
        <p className="text-sm text-ink-600 mb-1">
          Runs automatically every night (Vercel Cron). It purges soft-deleted photos past the 24-hour recovery
          window, abandoned/failed uploads older than 7 days, and temporary originals older than 7 days.
        </p>
        <ul className="text-sm text-ink-500 mb-4 mt-2 space-y-1">
          <li>· <strong className="text-ink-700">{s.pendingPurge}</strong> photo{s.pendingPurge === 1 ? "" : "s"} soft-deleted, awaiting purge</li>
          <li>· <strong className="text-ink-700">{s.failedAssets}</strong> failed upload{s.failedAssets === 1 ? "" : "s"}</li>
          <li>· <strong className="text-ink-700">{s.withOriginals}</strong> temporary original{s.withOriginals === 1 ? "" : "s"} retained</li>
        </ul>
        <StorageCleanupButton />
      </Card>

      <div className="mt-6 text-sm">
        <Link href="/admin" className="text-tide-700 hover:underline">← Back to Admin</Link>
      </div>
    </div>
  );
}
