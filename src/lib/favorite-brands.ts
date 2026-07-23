export const BRAND_CATEGORIES = [
  ["rods", "Rods"],
  ["reels", "Reels"],
  ["lures", "Lures"],
  ["clothes", "Clothes"],
] as const;

export type BrandCategoryKey = (typeof BRAND_CATEGORIES)[number][0];

/** Early profiles stored one brand string per category; newer ones store arrays. */
export function brandList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((s) => s.trim()).filter(Boolean);
}
