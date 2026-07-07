import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, species, identifications } from "@/db";

export const identificationSchema = z.object({
  isFish: z.boolean().describe("Whether the image clearly contains a fish"),
  primary: z.object({
    commonName: z.string().describe("Most likely species common name"),
    scientificName: z.string(),
    knownSlug: z
      .string()
      .nullable()
      .describe("Matching slug from the provided species list, or null if not in the list"),
    confidencePct: z.number().describe("Confidence 0-100 for the primary match"),
    reasoning: z.string().describe("2-3 sentences on the visual features that identify it"),
  }),
  alternates: z
    .array(
      z.object({
        commonName: z.string(),
        knownSlug: z.string().nullable(),
        confidencePct: z.number(),
        howToTell: z.string().describe("One sentence on distinguishing it from the primary"),
      })
    )
    .describe("Up to 3 alternative possibilities, most likely first"),
  handlingNote: z
    .string()
    .describe("One practical safety/legal handling note for this fish (spines, teeth, regulations)"),
  notFishDescription: z
    .string()
    .nullable()
    .describe("If isFish is false, what the image appears to show"),
});

export type IdentificationResult = z.infer<typeof identificationSchema> & {
  id: string;
  imageUrl: string | null;
  primarySpecies: KnownSpecies | null;
  alternateSpecies: (KnownSpecies | null)[];
};

export type KnownSpecies = {
  id: string;
  slug: string;
  commonName: string;
  water: string;
  imageUrl: string | null;
  lookalikes: { name: string; howToTell: string }[];
};

export function identifyConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

export async function identifyFish(input: {
  imageBase64: string;
  mediaType: string;
  imageUrl: string | null;
  userId: string | null;
}): Promise<IdentificationResult> {
  if (!identifyConfigured()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!MEDIA_TYPES.includes(input.mediaType as MediaType)) {
    throw new Error("Unsupported image type for identification. Use JPG, PNG, or WEBP.");
  }

  const db = await getDb();
  const known = await db.query.species.findMany({ where: eq(species.active, true) });
  const speciesList = known
    .map((s) => `- ${s.slug}: ${s.commonName} (${s.scientificName})`)
    .join("\n");

  const client = new Anthropic();
  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system:
      "You are a fish identification expert for a US recreational fishing app covering freshwater and saltwater species. " +
      "Identify the fish in the user's photo. Consider body shape, fin structure and position, mouth shape, coloration, markings, and any visible habitat context. " +
      "When the species matches one in the app's known list, set knownSlug to that slug. If the fish is not in the list, still identify it and set knownSlug to null. " +
      "Be honest about uncertainty: lower confidence for poor lighting, partial views, or juvenile fish. Regional US species are far more likely than exotic ones.\n\n" +
      `Known species list (slug: name):\n${speciesList}`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: input.mediaType as MediaType,
              data: input.imageBase64,
            },
          },
          { type: "text", text: "Identify this fish." },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(identificationSchema) },
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error("Identification could not be completed for this image. Try a clearer photo.");
  }
  const result = response.parsed_output;

  // enrich with known species records
  const bySlug = (slug: string | null): KnownSpecies | null => {
    if (!slug) return null;
    const s = known.find((k) => k.slug === slug);
    if (!s) return null;
    return {
      id: s.id,
      slug: s.slug,
      commonName: s.commonName,
      water: s.water,
      imageUrl: s.imageUrl,
      lookalikes: s.lookalikes,
    };
  };

  const [row] = await db
    .insert(identifications)
    .values({
      userId: input.userId,
      imageUrl: input.imageUrl,
      result: result as unknown as Record<string, unknown>,
    })
    .returning();

  return {
    ...result,
    id: row.id,
    imageUrl: input.imageUrl,
    primarySpecies: bySlug(result.primary.knownSlug),
    alternateSpecies: result.alternates.map((a) => bySlug(a.knownSlug)),
  };
}
