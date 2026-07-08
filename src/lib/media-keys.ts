import type { MediaKind } from "@/db/schema";

/**
 * Pure R2 object-key construction. Kept dependency-free so it can be unit
 * tested in isolation (no DB / sharp / network imports).
 *
 * Layout (matches the spec):
 *   users/{userId}/profile/{mediaId}/{variant}.webp
 *   catches/{userId}/{catchId}/{mediaId}/{variant}.webp
 *   gear/{userId}/{gearId}/{mediaId}/{variant}.webp
 *   spots/{userId}/{spotId}/{mediaId}/{variant}.webp
 *   temporary/{userId}/{mediaId}/original
 */
export function mediaBaseKey(
  kind: MediaKind,
  ownerId: string,
  relatedId: string | null,
  mediaId: string
): string {
  switch (kind) {
    case "catch":
      return `catches/${ownerId}/${relatedId ?? "loose"}/${mediaId}`;
    case "profile":
      return `users/${ownerId}/profile/${mediaId}`;
    case "gear":
      return `gear/${ownerId}/${relatedId ?? "loose"}/${mediaId}`;
    case "spot":
      return `spots/${ownerId}/${relatedId ?? "loose"}/${mediaId}`;
    default:
      return `misc/${ownerId}/${mediaId}`;
  }
}

export function variantKey(baseKey: string, label: string): string {
  return `${baseKey}/${label}.webp`;
}

export function temporaryOriginalKey(ownerId: string, mediaId: string): string {
  return `temporary/${ownerId}/${mediaId}/original`;
}
