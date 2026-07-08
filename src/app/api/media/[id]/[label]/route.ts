import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, mediaAssets, follows, type VariantLabel } from "@/db";
import { currentUser } from "@/lib/auth-helpers";
import { readLocalMedia } from "@/lib/media";
import { getObject, signedGetUrl } from "@/lib/r2";

/**
 * Protected media delivery. Enforces ownership + visibility BEFORE returning
 * any bytes, so private catches, followers-only posts, and exact-location
 * imagery never leak through a guessable URL. The R2 bucket itself is private.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; label: string }> }
) {
  const { id, label } = await params;
  const db = await getDb();

  const asset = await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, id) });
  if (!asset || asset.status !== "ready") return notFound();

  // ---- authorization ----
  if (asset.visibility !== "public") {
    const viewer = await currentUser();
    if (!viewer) return notFound();
    const isOwner = viewer.id === asset.ownerId;
    const isAdmin = viewer.role === "admin";
    if (!isOwner && !isAdmin) {
      if (asset.visibility === "private") return notFound();
      // followers-only: viewer must follow the owner
      const rel = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, viewer.id), eq(follows.followingId, asset.ownerId)),
      });
      if (!rel) return notFound();
    }
  }

  const variant =
    asset.variants.find((v) => v.label === (label as VariantLabel)) ??
    asset.variants.find((v) => v.label === "feed") ??
    asset.variants[0];
  if (!variant) return notFound();

  const cache = asset.visibility === "public"
    ? "public, max-age=31536000, immutable"
    : "private, max-age=3600";

  // ---- serve from the correct backend ----
  if (asset.backend === "blob") {
    // blob keys are already full https URLs
    return NextResponse.redirect(variant.key);
  }

  if (asset.backend === "r2") {
    if (asset.visibility === "public") {
      // offload bandwidth to R2's edge with a short-lived signed URL
      const url = await signedGetUrl(variant.key, 3600);
      return NextResponse.redirect(url);
    }
    const obj = await getObject(variant.key);
    if (!obj) return notFound();
    return new NextResponse(obj.body, {
      headers: { "Content-Type": variant.format === "webp" ? "image/webp" : obj.contentType, "Cache-Control": cache },
    });
  }

  // local disk
  const buf = await readLocalMedia(variant.key);
  if (!buf) return notFound();
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": "image/webp", "Cache-Control": cache },
  });
}

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}
