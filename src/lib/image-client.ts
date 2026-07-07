/**
 * Client-side image downscaling. Runs in the browser before upload so that:
 *  - phone photos (5–12 MB) fit under the server-action body limit
 *  - iPhone HEIC/HEIF is re-encoded to JPEG (renders everywhere)
 *  - stored images stay small and fast
 * Falls back to the original file if anything goes wrong.
 */
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    return file;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = document.createElement("img");
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });

    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    if (!srcW || !srcH) return file;

    const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", quality)
    );
    if (!blob || blob.size === 0) return file;

    // If the original was already smaller and a browser-safe format, keep it.
    if (blob.size >= file.size && /^image\/(jpeg|png|webp)$/.test(file.type)) {
      return file;
    }

    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
