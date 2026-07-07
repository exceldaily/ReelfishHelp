import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB (photos are compressed client-side first)
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heic",
};

export function storageMode(): "blob" | "local" {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

/**
 * Stores an uploaded image and returns its public URL.
 * - BLOB_READ_WRITE_TOKEN set  → Vercel Blob (production)
 * - otherwise                  → .data/uploads served via /api/uploads (local dev)
 */
export async function storeImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("Unsupported image type. Use JPG, PNG, WEBP, or HEIC.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (8 MB max).");
  }
  const ext = ALLOWED_TYPES[file.type];
  const name = `${folder}/${crypto.randomUUID()}${ext}`;

  if (storageMode() === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public" });
    return blob.url;
  }

  const dir = path.join(process.cwd(), ".data", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  const filename = path.basename(name);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buf);
  return `/api/uploads/${folder}/${filename}`;
}
