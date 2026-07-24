import type { NewSpecies } from "@/db/schema";
import { freshwaterBassPanfishCats } from "./freshwater-1";
import { freshwaterTroutWalleyeOthers } from "./freshwater-2";
import { saltwaterInshore } from "./saltwater-1";
import { saltwaterNearshoreOffshore } from "./saltwater-2";
import { saltwaterTunaAndReef } from "./saltwater-3";
import { saltwaterSnapperGrouper } from "./saltwater-4";
import { speciesAdditions1 } from "./additions-1";
import { seaSpecies1 } from "./sea-1";
import { seaSpecies2 } from "./sea-2";
import { speciesImages } from "./images";

/** Species seed entries use their slug as a stable primary key. */
export type SpeciesSeed = NewSpecies & { id: string; slug: string };

export const allSpecies: SpeciesSeed[] = [
  ...freshwaterBassPanfishCats,
  ...freshwaterTroutWalleyeOthers,
  ...saltwaterInshore,
  ...saltwaterNearshoreOffshore,
  ...saltwaterTunaAndReef,
  ...saltwaterSnapperGrouper,
  ...speciesAdditions1,
  ...seaSpecies1,
  ...seaSpecies2,
].map((s) => ({
  ...s,
  imageUrl: speciesImages[s.slug]?.url ?? s.imageUrl ?? null,
  imageCredit: speciesImages[s.slug]?.credit ?? s.imageCredit ?? null,
}));

export const US_REGIONS = [
  "Northeast",
  "Southeast",
  "Florida",
  "Gulf Coast",
  "Atlantic Coast",
  "Midwest",
  "South Central",
  "Southwest",
  "West",
  "Pacific Northwest",
  "Pacific Coast",
  "Nationwide",
] as const;

export const ENVIRONMENTS = [
  "lake",
  "pond",
  "river",
  "creek",
  "canal",
  "dock",
  "beach",
  "surf",
  "pier",
  "marsh",
  "flats",
  "inshore",
  "reef",
  "wreck",
  "bridge",
  "jetty",
  "nearshore",
  "offshore",
] as const;

export const STYLES = ["shore", "kayak", "boat", "pier", "surf"] as const;
export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
