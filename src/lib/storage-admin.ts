import { and, desc, eq, sql as dsql } from "drizzle-orm";
import { getDb, mediaAssets, profiles } from "@/db";
import { r2Enabled } from "@/lib/r2";
import { DEFAULT_QUOTA_BYTES, STORAGE_ALERT_RATIO } from "@/lib/media";

export type StorageStats = {
  backend: "r2" | "blob" | "local";
  totalBytes: number;
  readyAssets: number;
  failedAssets: number;
  pendingPurge: number; // soft-deleted, awaiting cleanup job
  withOriginals: number; // temporary originals still retained
  byKind: { kind: string; bytes: number; count: number }[];
  topUsers: { userId: string; username: string | null; bytes: number; count: number }[];
  perDay: { day: string; count: number; bytes: number }[];
  defaultQuotaBytes: number;
  alertRatio: number;
};

export async function getStorageStats(): Promise<StorageStats> {
  const db = await getDb();

  const [totals] = await db
    .select({
      bytes: dsql<number>`COALESCE(SUM(${mediaAssets.byteSize}), 0)`,
      count: dsql<number>`COUNT(*)`,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.status, "ready"));

  const [[failed], [pending], [origs]] = await Promise.all([
    db.select({ n: dsql<number>`COUNT(*)` }).from(mediaAssets).where(eq(mediaAssets.status, "failed")),
    db.select({ n: dsql<number>`COUNT(*)` }).from(mediaAssets).where(eq(mediaAssets.status, "deleted")),
    db
      .select({ n: dsql<number>`COUNT(*)` })
      .from(mediaAssets)
      .where(and(eq(mediaAssets.hasOriginal, true))),
  ]);

  const byKind = await db
    .select({
      kind: mediaAssets.kind,
      bytes: dsql<number>`COALESCE(SUM(${mediaAssets.byteSize}), 0)`,
      count: dsql<number>`COUNT(*)`,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.status, "ready"))
    .groupBy(mediaAssets.kind);

  const topUsers = await db
    .select({
      userId: mediaAssets.ownerId,
      username: profiles.username,
      bytes: dsql<number>`COALESCE(SUM(${mediaAssets.byteSize}), 0)`,
      count: dsql<number>`COUNT(*)`,
    })
    .from(mediaAssets)
    .leftJoin(profiles, eq(profiles.userId, mediaAssets.ownerId))
    .where(eq(mediaAssets.status, "ready"))
    .groupBy(mediaAssets.ownerId, profiles.username)
    .orderBy(desc(dsql`COALESCE(SUM(${mediaAssets.byteSize}), 0)`))
    .limit(10);

  const perDay = await db
    .select({
      day: dsql<string>`to_char(date_trunc('day', ${mediaAssets.createdAt}), 'YYYY-MM-DD')`,
      count: dsql<number>`COUNT(*)`,
      bytes: dsql<number>`COALESCE(SUM(${mediaAssets.byteSize}), 0)`,
    })
    .from(mediaAssets)
    .where(dsql`${mediaAssets.createdAt} > NOW() - INTERVAL '14 days'`)
    .groupBy(dsql`date_trunc('day', ${mediaAssets.createdAt})`)
    .orderBy(dsql`date_trunc('day', ${mediaAssets.createdAt})`);

  return {
    backend: r2Enabled() ? "r2" : process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local",
    totalBytes: Number(totals?.bytes ?? 0),
    readyAssets: Number(totals?.count ?? 0),
    failedAssets: Number(failed?.n ?? 0),
    pendingPurge: Number(pending?.n ?? 0),
    withOriginals: Number(origs?.n ?? 0),
    byKind: byKind.map((r) => ({ kind: r.kind, bytes: Number(r.bytes), count: Number(r.count) })),
    topUsers: topUsers.map((r) => ({
      userId: r.userId,
      username: r.username,
      bytes: Number(r.bytes),
      count: Number(r.count),
    })),
    perDay: perDay.map((r) => ({ day: r.day, count: Number(r.count), bytes: Number(r.bytes) })),
    defaultQuotaBytes: DEFAULT_QUOTA_BYTES,
    alertRatio: STORAGE_ALERT_RATIO,
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
