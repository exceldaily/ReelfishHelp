import sharp from "sharp";

/**
 * Server-side image processing for uploaded photos.
 *
 * Privacy: sharp drops ALL input metadata by default (we never call
 * `.withMetadata()`), so EXIF — including GPS coordinates, device info and
 * timestamps — is stripped from every stored variant. `.rotate()` bakes the
 * EXIF orientation into pixels first so images still display upright.
 */

export type VariantSpec = { label: "thumbnail" | "feed" | "detail"; maxDim: number; quality: number };

// Only these are ever stored permanently. Ordered smallest → largest.
export const VARIANT_SPECS: VariantSpec[] = [
  { label: "thumbnail", maxDim: 400, quality: 72 },
  { label: "feed", maxDim: 1080, quality: 80 },
  { label: "detail", maxDim: 1600, quality: 82 },
];

export type ProcessedVariant = {
  label: VariantSpec["label"];
  buffer: Buffer;
  width: number;
  height: number;
  bytes: number;
  format: "webp";
  contentType: "image/webp";
};

export type ProcessedImage = {
  variants: ProcessedVariant[];
  master: { width: number; height: number }; // dimensions of the source after orientation
};

const ACCEPTED_INPUT = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
]);

export function isAcceptedImageType(mime: string): boolean {
  return ACCEPTED_INPUT.has(mime);
}

/**
 * Validate + transform an uploaded image into a set of optimized, metadata-free
 * WebP variants. Throws on non-images, corrupt files, or absurd dimensions.
 */
export async function processImage(input: Buffer, mime: string): Promise<ProcessedImage> {
  if (!isAcceptedImageType(mime)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WEBP, HEIC, or AVIF.");
  }

  // `.rotate()` (no arg) auto-orients from EXIF, then metadata is discarded.
  const base = sharp(input, { failOn: "error" }).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) {
    throw new Error("File is not a readable image.");
  }
  // guard against decompression-bomb style inputs
  if (meta.width * meta.height > 60_000_000) {
    throw new Error("Image resolution is too large.");
  }

  const srcW = meta.width;
  const srcH = meta.height;

  const variants: ProcessedVariant[] = [];
  for (const spec of VARIANT_SPECS) {
    // never upscale
    const fits = Math.max(srcW, srcH) <= spec.maxDim;
    const pipeline = sharp(input)
      .rotate()
      .resize({
        width: fits ? srcW : undefined,
        height: fits ? srcH : undefined,
        ...(fits ? {} : { width: spec.maxDim, height: spec.maxDim, fit: "inside", withoutEnlargement: true }),
      })
      .webp({ quality: spec.quality });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    variants.push({
      label: spec.label,
      buffer: data,
      width: info.width,
      height: info.height,
      bytes: data.byteLength,
      format: "webp",
      contentType: "image/webp",
    });
  }

  return { variants, master: { width: srcW, height: srcH } };
}
