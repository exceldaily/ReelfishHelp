import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { and, eq, sql as dsql } from "drizzle-orm";
import {
  getDb,
  mediaAssets,
  mediaVariants,
  userStorageUsage,
  type MediaAsset,
  type MediaKind,
  type Visibility,
  type StorageBackend,
  type VariantLabel,
} from "@/db";
import { processImage, type ProcessedVariant } from "@/lib/image-pipeline";
import { r2Enabled, putObject, deleteObjects } from "@/lib/r2";
import { mediaBaseKey, variantKey, temporaryOriginalKey } from "@/lib/media-keys";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB hard cap on originals
export const DEFAULT_QUOTA_BYTES =
  (Number(process.env.STORAGE_FREE_QUOTA_MB) || 500) * 1024 * 1024; // 500 MB default
export const STORAGE_ALERT_RATIO = Number(process.env.STORAGE_ALERT_RATIO) || 0.85;

const LOCAL_MEDIA_DIR = path.join(process.cwd(), ".data", "media");

function backend(): StorageBackend {
  if (r2Enabled()) return "r2";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "local";
}

export type StoreMediaInput = {
  file: File;
  ownerId: string;
  kind: MediaKind;
  relatedId?: string | null;
  visibility?: Visibility;
  /** keep the untouched original temporarily (fish ID / retries); auto-purged */
  keepOriginal?: boolean;
};

/**
 * Full upload pipeline: validate → strip EXIF + generate WebP variants →
 * upload to R2 (or blob/local fallback) → record metadata → update usage.
 * Returns the ready MediaAsset. Neon never receives image binaries.
 */
export async function storeMedia(input: StoreMediaInput): Promise<MediaAsset> {
  const { file, ownerId, kind } = input;
  const relatedId = input.relatedId ?? null;
  const visibility = input.visibility ?? "private";

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (15 MB max).");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const processed = await processImage(buf, file.type, { square: kind === "profile" }); // throws on non-image

  const db = await getDb();
  const mediaId = crypto.randomUUID();
  const be = backend();
  const baseKey = mediaBaseKey(kind, ownerId, relatedId, mediaId);

  // upload every variant to the chosen backend
  const stored: {
    label: VariantLabel;
    key: string;
    url: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
  }[] = [];

  for (const v of processed.variants) {
    const key = variantKey(baseKey, v.label);
    const location = await uploadVariant(be, key, v);
    stored.push({
      label: v.label,
      key: location,
      url: `/api/media/${mediaId}/${v.label}`,
      width: v.width,
      height: v.height,
      bytes: v.bytes,
      format: "webp",
    });
  }

  // optionally retain the original in a temporary location (auto-cleaned)
  let originalKey: string | null = null;
  let hasOriginal = false;
  if (input.keepOriginal) {
    const tmpKey = temporaryOriginalKey(ownerId, mediaId);
    originalKey = await uploadRaw(be, tmpKey, buf, file.type);
    hasOriginal = true;
  }

  const totalBytes = stored.reduce((n, v) => n + v.bytes, 0);
  const detail = stored.find((v) => v.label === "detail") ?? stored[stored.length - 1];

  const [asset] = await db
    .insert(mediaAssets)
    .values({
      id: mediaId,
      ownerId,
      kind,
      relatedId,
      backend: be,
      baseKey,
      contentType: "image/webp",
      originalName: file.name?.slice(0, 200) || null,
      byteSize: totalBytes,
      width: processed.master.width,
      height: processed.master.height,
      visibility,
      status: "ready",
      hasOriginal,
      originalKey,
      variants: stored.map((s) => ({ ...s, label: s.label })),
    })
    .returning();

  await db.insert(mediaVariants).values(
    stored.map((s) => ({
      assetId: mediaId,
      label: s.label,
      key: s.key,
      url: s.url,
      format: s.format,
      width: s.width,
      height: s.height,
      byteSize: s.bytes,
    }))
  );

  await bumpUsage(ownerId, totalBytes, 1, 1);
  return asset;
}

/**
 * Convenience wrapper for single-photo forms (gear, spot, avatar): runs the
 * full pipeline and returns the feed-size delivery URL to store in the existing
 * `photo_url` / `avatar_url` columns. Drop-in replacement for `storeImage`.
 */
export async function storeMediaUrl(input: StoreMediaInput): Promise<string> {
  const asset = await storeMedia(input);
  const feed = asset.variants.find((v) => v.label === "feed") ?? asset.variants[asset.variants.length - 1];
  return feed?.url ?? `/api/media/${asset.id}/feed`;
}

async function uploadVariant(be: StorageBackend, key: string, v: ProcessedVariant): Promise<string> {
  return uploadRaw(be, key, v.buffer, v.contentType);
}

async function uploadRaw(
  be: StorageBackend,
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (be === "r2") {
    await putObject(key, body, contentType);
    return key; // variant.key = R2 object key
  }
  if (be === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, body, {
      access: "public",
      contentType,
    });
    return blob.url; // variant.key = blob URL
  }
  // local disk
  const abs = path.join(LOCAL_MEDIA_DIR, key);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, body);
  return key; // variant.key = relative local path
}

/** Read a stored variant's bytes for the protected delivery route (local/r2). */
export async function readLocalMedia(key: string): Promise<Buffer | null> {
  const abs = path.join(LOCAL_MEDIA_DIR, key);
  // prevent traversal outside the media dir
  if (!path.resolve(abs).startsWith(path.resolve(LOCAL_MEDIA_DIR))) return null;
  try {
    return await fs.readFile(abs);
  } catch {
    return null;
  }
}

async function deleteLocalMedia(key: string): Promise<void> {
  const abs = path.join(LOCAL_MEDIA_DIR, key);
  await fs.rm(abs, { force: true }).catch(() => {});
}

/**
 * Soft-delete an asset (owner or admin). Bytes are freed from the user's usage
 * immediately; the actual objects are purged by the cleanup job after a short
 * recovery window (see media-cleanup route).
 */
export async function deleteMedia(assetId: string, requesterId: string, isAdmin = false): Promise<void> {
  const db = await getDb();
  const asset = await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, assetId) });
  if (!asset || asset.status === "deleted") return;
  if (asset.ownerId !== requesterId && !isAdmin) throw new Error("Not allowed");

  await db
    .update(mediaAssets)
    .set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(mediaAssets.id, assetId));
  await bumpUsage(asset.ownerId, -asset.byteSize, -1, -1);
}

/** Soft-delete every asset attached to a parent (e.g. all photos of a catch). */
export async function deleteMediaByRelation(
  kind: MediaKind,
  relatedId: string,
  ownerId: string
): Promise<void> {
  const db = await getDb();
  const rows = await db.query.mediaAssets.findMany({
    where: and(
      eq(mediaAssets.kind, kind),
      eq(mediaAssets.relatedId, relatedId),
      eq(mediaAssets.status, "ready")
    ),
  });
  for (const a of rows) {
    await deleteMedia(a.id, ownerId, true);
  }
}

/** Permanently purge the objects for an asset from the backend + drop rows. */
export async function purgeMedia(asset: MediaAsset): Promise<void> {
  const db = await getDb();
  const keys = asset.variants.map((v) => v.key);
  if (asset.originalKey) keys.push(asset.originalKey);

  if (asset.backend === "r2") {
    await deleteObjects(keys);
  } else if (asset.backend === "blob") {
    const { del } = await import("@vercel/blob");
    await del(keys.filter((k) => k.startsWith("http"))).catch(() => {});
  } else {
    await Promise.all(keys.map(deleteLocalMedia));
  }
  await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id)); // variants cascade
}

/** Drop just the temporary original once processing/ID is done. */
export async function dropOriginal(asset: MediaAsset): Promise<void> {
  if (!asset.hasOriginal || !asset.originalKey) return;
  const db = await getDb();
  if (asset.backend === "r2") await deleteObjects([asset.originalKey]);
  else if (asset.backend === "local") await deleteLocalMedia(asset.originalKey);
  await db
    .update(mediaAssets)
    .set({ hasOriginal: false, originalKey: null, updatedAt: new Date() })
    .where(eq(mediaAssets.id, asset.id));
}

/* --------------------------------- usage ---------------------------------- */

export async function bumpUsage(
  userId: string,
  deltaBytes: number,
  deltaAssets: number,
  deltaPhotos: number
): Promise<void> {
  const db = await getDb();
  await db
    .insert(userStorageUsage)
    .values({
      userId,
      totalBytes: Math.max(0, deltaBytes),
      assetCount: Math.max(0, deltaAssets),
      photoCount: Math.max(0, deltaPhotos),
    })
    .onConflictDoUpdate({
      target: userStorageUsage.userId,
      set: {
        totalBytes: dsql`GREATEST(0, ${userStorageUsage.totalBytes} + ${deltaBytes})`,
        assetCount: dsql`GREATEST(0, ${userStorageUsage.assetCount} + ${deltaAssets})`,
        photoCount: dsql`GREATEST(0, ${userStorageUsage.photoCount} + ${deltaPhotos})`,
        updatedAt: new Date(),
      },
    });
}

export type UsageInfo = {
  totalBytes: number;
  assetCount: number;
  photoCount: number;
  quotaBytes: number;
  ratio: number;
  overQuota: boolean;
  nearQuota: boolean;
};

export async function getUsage(userId: string): Promise<UsageInfo> {
  const db = await getDb();
  const row = await db.query.userStorageUsage.findFirst({
    where: eq(userStorageUsage.userId, userId),
  });
  const totalBytes = row?.totalBytes ?? 0;
  const quotaBytes = row?.quotaBytes ?? DEFAULT_QUOTA_BYTES;
  const ratio = quotaBytes > 0 ? totalBytes / quotaBytes : 0;
  return {
    totalBytes,
    assetCount: row?.assetCount ?? 0,
    photoCount: row?.photoCount ?? 0,
    quotaBytes,
    ratio,
    overQuota: totalBytes >= quotaBytes,
    nearQuota: ratio >= STORAGE_ALERT_RATIO,
  };
}

export async function assertUnderQuota(userId: string): Promise<void> {
  const usage = await getUsage(userId);
  if (usage.overQuota) {
    throw new Error("You've reached your photo storage limit. Delete some photos to upload more.");
  }
}

/** Recompute a user's usage from source-of-truth rows (repair / after bulk ops). */
export async function recomputeUsage(userId: string): Promise<void> {
  const db = await getDb();
  const [agg] = await db
    .select({
      bytes: dsql<number>`COALESCE(SUM(${mediaAssets.byteSize}), 0)`,
      assets: dsql<number>`COUNT(*)`,
    })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.ownerId, userId), eq(mediaAssets.status, "ready")));

  await db
    .insert(userStorageUsage)
    .values({
      userId,
      totalBytes: Number(agg?.bytes ?? 0),
      assetCount: Number(agg?.assets ?? 0),
      photoCount: Number(agg?.assets ?? 0),
    })
    .onConflictDoUpdate({
      target: userStorageUsage.userId,
      set: {
        totalBytes: Number(agg?.bytes ?? 0),
        assetCount: Number(agg?.assets ?? 0),
        photoCount: Number(agg?.assets ?? 0),
        updatedAt: new Date(),
      },
    });
}
