import { eq } from "drizzle-orm";
import { getDb, species } from "@/db";

/**
 * Resolves a species photo from the Wikipedia REST API (free, no key) and
 * caches the URL in the species row. Admins can override image_url directly.
 */
export async function resolveSpeciesImage(speciesId: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.query.species.findFirst({ where: eq(species.id, speciesId) });
  if (!row) return null;
  if (row.imageUrl) return row.imageUrl;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(row.wikiTitle)}`,
      {
        headers: { "User-Agent": "ReelFishHelp/1.0 (fishing guide app)" },
        next: { revalidate: 60 * 60 * 24 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      originalimage?: { source: string };
      thumbnail?: { source: string };
    };
    const url = data.originalimage?.source ?? data.thumbnail?.source ?? null;
    if (url) {
      await db
        .update(species)
        .set({ imageUrl: url, imageCredit: `Wikipedia — ${row.wikiTitle}` })
        .where(eq(species.id, speciesId));
    }
    return url;
  } catch {
    return null;
  }
}

/** Resolve images for many species, tolerating failures. Used by list pages. */
export async function resolveManyImages(rows: { id: string; imageUrl: string | null }[]) {
  const missing = rows.filter((r) => !r.imageUrl);
  if (missing.length === 0) return;
  await Promise.allSettled(missing.map((r) => resolveSpeciesImage(r.id)));
}
