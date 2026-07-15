/**
 * Client-side image downscaling. Runs in the browser before upload so that:
 *  - phone photos (5–12 MB) fit under Vercel's ~4.5 MB request-body cap
 *  - iPhone HEIC/HEIF is re-encoded to JPEG (renders everywhere)
 *  - stored images stay small and fast
 * Falls back to the original file if anything goes wrong.
 */

/** per-file target after compression — 6 photos stay well under the cap */
const TARGET_BYTES = 700 * 1024;

/** quality/dimension ladder: keep stepping down until the file fits */
const LADDER: [number, number][] = [
  [1600, 0.82],
  [1400, 0.74],
  [1200, 0.66],
  [1000, 0.58],
];

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  // createImageBitmap is the most reliable decoder on mobile and applies
  // EXIF orientation; fall back to an <img> element where unsupported.
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    /* fall through */
  }
  try {
    const url = URL.createObjectURL(file);
    try {
      const img = document.createElement("img");
      img.decoding = "async";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("decode failed"));
        img.src = url;
      });
      return img.naturalWidth && img.naturalHeight ? img : null;
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

function encodeFrom(
  source: ImageBitmap | HTMLImageElement,
  maxDim: number,
  quality: number
): Promise<Blob | null> {
  const srcW = "naturalWidth" in source ? source.naturalWidth : source.width;
  const srcH = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(source, 0, 0, w, h);
  return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    return file;
  }
  // already small and browser-safe — leave it alone
  if (file.size <= TARGET_BYTES && /^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  try {
    const source = await decode(file);
    if (!source) return file;

    let best: Blob | null = null;
    const steps: [number, number][] = [[Math.min(maxDim, LADDER[0][0]), quality], ...LADDER.slice(1)];
    for (const [dim, q] of steps) {
      const blob = await encodeFrom(source, dim, q);
      if (!blob || blob.size === 0) continue;
      if (best === null || blob.size < best.size) best = blob;
      if (blob.size <= TARGET_BYTES) break;
    }
    if ("close" in source) source.close();
    if (!best) return file;
    // never "compress" upward when the original was already browser-safe
    if (best.size >= file.size && /^image\/(jpeg|png|webp)$/.test(file.type)) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([best], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

/** Total-payload guard for multi-photo forms (Vercel rejects bodies over ~4.5 MB). */
export const UPLOAD_BUDGET_BYTES = 4 * 1024 * 1024;
