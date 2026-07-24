/**
 * App regions ("which country/area version of ReelFishHelp am I using").
 * Phase 1 ships the USA (default) and Southeast Asia. Every existing user and
 * every existing species is region "us" — new SEA content is tagged "sea".
 *
 * This is a coarse market dimension, separate from species.regions (which holds
 * US sub-regions like "Gulf Coast") and from a user's home state/location.
 */

import type { UnitSystem } from "./units";

export type Region = "us" | "sea";

export const DEFAULT_REGION: Region = "us";

export type RegionMeta = {
  id: Region;
  /** Short name for switchers and pills. */
  short: string;
  /** Full name for headings and prose. */
  name: string;
  flag: string;
  units: UnitSystem;
  /** NOAA CO-OPS tide predictions only cover US waters. */
  hasTides: boolean;
  /** US uses per-state regulation agencies; SEA is country-level (Phase 1: guidance only). */
  hasStateRegulations: boolean;
  /** One-line description shown in the region picker. */
  blurb: string;
};

export const REGIONS: Record<Region, RegionMeta> = {
  us: {
    id: "us",
    short: "USA",
    name: "United States",
    flag: "🇺🇸",
    units: "imperial",
    hasTides: true,
    hasStateRegulations: true,
    blurb: "US fresh and saltwater species, state regulations, and NOAA tides.",
  },
  sea: {
    id: "sea",
    short: "SEA",
    name: "Southeast Asia",
    flag: "🌏",
    units: "metric",
    hasTides: false,
    hasStateRegulations: false,
    blurb: "Southeast Asian species with metric units. Growing catalog.",
  },
};

/** Ordered list for pickers. */
export const REGION_LIST: RegionMeta[] = [REGIONS.us, REGIONS.sea];

export function isRegion(value: unknown): value is Region {
  return value === "us" || value === "sea";
}

/** Coerce any stored/input value to a valid region, defaulting to USA. */
export function toRegion(value: unknown): Region {
  return isRegion(value) ? value : DEFAULT_REGION;
}

export function regionMeta(value: unknown): RegionMeta {
  return REGIONS[toRegion(value)];
}

/** Unit system for a region — the single source of truth for metric vs imperial. */
export function unitSystemForRegion(value: unknown): UnitSystem {
  return regionMeta(value).units;
}
