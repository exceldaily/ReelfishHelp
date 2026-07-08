import { NextRequest, NextResponse } from "next/server";
import { and, eq, lt, isNotNull } from "drizzle-orm";
import { getDb, mediaAssets } from "@/db";
import { currentUser } from "@/lib/auth-helpers";
import { purgeMedia, dropOriginal } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY = 24 * 60 * 60 * 1000;
const RECOVERY_WINDOW_MS = 1 * DAY; // soft-deleted assets are recoverable for 24h
const TEMP_ORIGINAL_TTL_MS = 7 * DAY; // temporary originals purged after 7 days
const FAILED_TTL_MS = 7 * DAY; // abandoned/failed uploads purged after 7 days

/**
 * Lifecycle cleanup for media. Trigger via Vercel Cron (see vercel.json) or an
 * external scheduler hitting this URL with `Authorization: Bearer $CRON_SECRET`.
 * Admins may also run it manually while signed in.
 */
export async function GET(req: NextRequest) {
  if (!(await authorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const now = Date.now();
  let purgedDeleted = 0;
  let purgedFailed = 0;
  let droppedOriginals = 0;

  // 1. soft-deleted assets past the recovery window → purge objects + rows
  const deleted = await db.query.mediaAssets.findMany({
    where: and(
      eq(mediaAssets.status, "deleted"),
      isNotNull(mediaAssets.deletedAt),
      lt(mediaAssets.deletedAt, new Date(now - RECOVERY_WINDOW_MS))
    ),
    limit: 500,
  });
  for (const a of deleted) {
    await purgeMedia(a);
    purgedDeleted++;
  }

  // 2. failed / abandoned uploads older than 7 days → purge
  const failed = await db.query.mediaAssets.findMany({
    where: and(eq(mediaAssets.status, "failed"), lt(mediaAssets.createdAt, new Date(now - FAILED_TTL_MS))),
    limit: 500,
  });
  for (const a of failed) {
    await purgeMedia(a);
    purgedFailed++;
  }

  // 3. temporary originals older than 7 days → drop just the original
  const withOriginals = await db.query.mediaAssets.findMany({
    where: and(
      eq(mediaAssets.hasOriginal, true),
      lt(mediaAssets.createdAt, new Date(now - TEMP_ORIGINAL_TTL_MS))
    ),
    limit: 500,
  });
  for (const a of withOriginals) {
    await dropOriginal(a);
    droppedOriginals++;
  }

  return NextResponse.json({
    ok: true,
    purgedDeleted,
    purgedFailed,
    droppedOriginals,
    ranAt: new Date().toISOString(),
  });
}

async function authorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = req.headers.get("authorization");
    if (header === `Bearer ${secret}`) return true;
  }
  // allow an admin to trigger it manually from the dashboard
  const user = await currentUser();
  return user?.role === "admin";
}
