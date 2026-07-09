/**
 * Setup Builder scoring — pure, deterministic, and data-driven. Compares a
 * user's setup against curated per-species gear requirements and returns a
 * practical verdict + plain-language reasons for each species, plus overall
 * strengths / weak points / suggestions. No randomness.
 */

export type PowerLevel =
  | "ultralight"
  | "light"
  | "medium-light"
  | "medium"
  | "medium-heavy"
  | "heavy"
  | "extra-heavy";

export const POWER_ORDER: PowerLevel[] = [
  "ultralight",
  "light",
  "medium-light",
  "medium",
  "medium-heavy",
  "heavy",
  "extra-heavy",
];

export type SetupInput = {
  water?: string | null; // freshwater | saltwater | inshore | offshore | surf | lake | pond | river ...
  lineLb?: number | null;
  lineType?: string | null; // braid | monofilament | fluorocarbon | ...
  leaderLb?: number | null;
  leaderType?: string | null;
  rodPower?: string | null; // a PowerLevel
  reelSize?: number | null; // spinning size-class equivalent
  method?: string | null; // casting | trolling | bottom fishing | jigging | ...
};

export type SpeciesReq = {
  speciesSlug: string;
  name: string;
  water?: string | null; // freshwater | saltwater | both
  lineLbMin: number;
  lineLbIdeal: number;
  lineLbMax: number;
  leaderLbMin?: number | null;
  leaderLbMax?: number | null;
  rodPower: string[];
  reelSizeMin?: number | null;
  reelSizeMax?: number | null;
  fightStrength: number;
  structureRisk: number;
  methods: string[];
};

export type Verdict =
  | "Excellent Match"
  | "Good Match"
  | "Usable With Caution"
  | "Too Light"
  | "Too Heavy"
  | "Wrong Setup Type";

export type SpeciesScore = { slug: string; name: string; verdict: Verdict; reasons: string[] };

export type ScoreResult = {
  best: SpeciesScore[];
  okay: SpeciesScore[];
  tooLight: SpeciesScore[];
  tooHeavy: SpeciesScore[];
  wrongType: SpeciesScore[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  environments: string[];
  techniques: string[];
};

function powerIndex(p?: string | null): number {
  return p ? POWER_ORDER.indexOf(p as PowerLevel) : -1;
}

/** Map any fishing-type/water label to a base water for filtering. */
export function normalizeWater(w?: string | null): "freshwater" | "saltwater" | null {
  if (!w) return null;
  const s = w.toLowerCase();
  if (["freshwater", "lake", "pond", "river", "creek"].some((k) => s.includes(k))) return "freshwater";
  if (["saltwater", "inshore", "offshore", "surf", "pier", "flats", "nearshore", "reef", "bay"].some((k) => s.includes(k)))
    return "saltwater";
  if (s === "both") return null;
  return null;
}

/** Score one species against the setup. */
export function scoreSpecies(setup: SetupInput, req: SpeciesReq): SpeciesScore {
  const reasons: string[] = [];
  let tooLight = false;
  let tooHeavy = false;
  let caution = false;
  let wrongType = false;
  let strong = 0;

  // ── main line ──
  if (setup.lineLb != null) {
    if (setup.lineLb < req.lineLbMin) {
      const deficit = (req.lineLbMin - setup.lineLb) / req.lineLbMin;
      if (deficit > 0.34) {
        tooLight = true;
        reasons.push(`${setup.lineLb} lb line is under the ${req.lineLbMin} lb minimum for ${req.name}.`);
      } else {
        caution = true;
        reasons.push(`Line is a touch light for ${req.name} — aim for around ${req.lineLbIdeal} lb.`);
      }
    } else if (setup.lineLb > req.lineLbMax) {
      const excess = (setup.lineLb - req.lineLbMax) / req.lineLbMax;
      if (excess > 0.6 && req.structureRisk < 4) {
        tooHeavy = true;
        reasons.push(`${setup.lineLb} lb line is heavier than ${req.name} needs — you'll lose bites and feel.`);
      } else {
        caution = true;
      }
    } else {
      const band = Math.abs(setup.lineLb - req.lineLbIdeal) / Math.max(1, req.lineLbIdeal);
      if (band <= 0.35) strong += 1;
    }
  }

  // ── leader ──
  if (req.leaderLbMin != null) {
    if (setup.leaderLb == null) {
      caution = true;
      reasons.push(`${req.name} usually needs a leader (${req.leaderLbMin}–${req.leaderLbMax ?? req.leaderLbMin} lb).`);
    } else if (setup.leaderLb < req.leaderLbMin) {
      const d = (req.leaderLbMin - setup.leaderLb) / req.leaderLbMin;
      if (d > 0.3 && req.structureRisk >= 4) {
        tooLight = true;
        reasons.push(`Leader is too light for ${req.name} around structure — use ${req.leaderLbMin}+ lb.`);
      } else {
        caution = true;
        reasons.push(`Consider a heavier leader for ${req.name}.`);
      }
    } else {
      strong += 0.5;
    }
  }

  // ── rod power ──
  if (setup.rodPower) {
    if (req.rodPower.includes(setup.rodPower)) {
      strong += 1;
    } else {
      const ui = powerIndex(setup.rodPower);
      const idx = req.rodPower.map(powerIndex).filter((i) => i >= 0);
      if (idx.length && ui >= 0) {
        const lo = Math.min(...idx);
        const hi = Math.max(...idx);
        if (ui < lo - 1) {
          tooLight = true;
          reasons.push(`Rod is under-powered for ${req.name}.`);
        } else if (ui > hi + 1) {
          tooHeavy = true;
          reasons.push(`Rod is heavier than ${req.name} calls for.`);
        } else {
          caution = true;
        }
      }
    }
  }

  // ── reel size ──
  if (setup.reelSize != null && req.reelSizeMin != null && req.reelSizeMax != null) {
    if (setup.reelSize < req.reelSizeMin * 0.7) {
      tooLight = true;
      reasons.push(`Reel is undersized for ${req.name} — not enough line capacity or drag.`);
    } else if (setup.reelSize > req.reelSizeMax * 1.7) {
      tooHeavy = true;
      reasons.push(`Reel is oversized for ${req.name}.`);
    }
  }

  // ── method ──
  if (setup.method && req.methods.length && !req.methods.includes(setup.method)) {
    wrongType = true;
    reasons.push(`${req.name} isn't typically caught by ${setup.method}.`);
  }

  let verdict: Verdict;
  if (wrongType && (tooLight || tooHeavy)) verdict = "Wrong Setup Type";
  else if (tooLight) verdict = "Too Light";
  else if (tooHeavy) verdict = "Too Heavy";
  else if (wrongType) verdict = "Wrong Setup Type";
  else if (caution) verdict = "Usable With Caution";
  else if (strong >= 2) verdict = "Excellent Match";
  else verdict = "Good Match";

  return { slug: req.speciesSlug, name: req.name, verdict, reasons };
}

/** Score the setup against all provided species requirements. */
export function scoreSetup(setup: SetupInput, reqs: SpeciesReq[]): ScoreResult {
  const water = normalizeWater(setup.water);
  const scored = reqs
    .filter((r) => !water || !r.water || r.water === "both" || r.water === water)
    .map((r) => scoreSpecies(setup, r));

  const best = scored.filter((s) => s.verdict === "Excellent Match" || s.verdict === "Good Match");
  const okay = scored.filter((s) => s.verdict === "Usable With Caution");
  const tooLight = scored.filter((s) => s.verdict === "Too Light");
  const tooHeavy = scored.filter((s) => s.verdict === "Too Heavy");
  const wrongType = scored.filter((s) => s.verdict === "Wrong Setup Type");

  // ── overall read ──
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  if (best.length) strengths.push(`Well-matched to ${best.length} species${best.length > 3 ? " across the range" : ""}.`);
  if (setup.lineType === "braid" && setup.leaderLb) strengths.push("Braid main line + leader is a strong, versatile modern system.");
  const pIdx = powerIndex(setup.rodPower);
  if (pIdx >= 2 && pIdx <= 4 && water === "saltwater") strengths.push("Solid all-around inshore power range.");
  if (pIdx >= 5) strengths.push("Plenty of backbone for big, structure-oriented fish.");

  if (setup.lineType === "braid" && !setup.leaderLb)
    suggestions.push("You're on braid with no leader — add a fluorocarbon leader so fish don't see the line.");
  if (setup.lineType === "monofilament" && water === "saltwater")
    suggestions.push("Consider braid main line + a fluorocarbon leader for more distance, sensitivity, and stealth.");
  if (tooLight.length > best.length && tooLight.length > 0)
    suggestions.push("This setup runs light for your water — size up line, leader, or rod power for the bigger targets.");
  if (tooHeavy.length > best.length && tooHeavy.length > 0)
    suggestions.push("This setup is heavy for most of these fish — a lighter line/rod would get more bites and be more fun.");

  if (tooLight.length) weaknesses.push(`Too light for ${tooLight.slice(0, 4).map((s) => s.name).join(", ")}.`);
  if (tooHeavy.length) weaknesses.push(`Overkill for ${tooHeavy.slice(0, 4).map((s) => s.name).join(", ")}.`);

  // ── environments + techniques (heuristic from water + power + method) ──
  const environments: string[] = [];
  const techniques: string[] = [];
  if (water === "freshwater") environments.push("Lakes, ponds, and rivers");
  if (water === "saltwater") {
    if (pIdx >= 5) environments.push("Offshore reefs and wrecks", "Nearshore structure");
    else environments.push("Inshore flats, bays, and marshes", "Docks and shorelines");
  }
  if (setup.method) techniques.push(setup.method[0].toUpperCase() + setup.method.slice(1));
  if (pIdx >= 0 && pIdx <= 2) techniques.push("Finesse and light-tackle casting");
  else if (pIdx >= 5) techniques.push("Bottom fishing and jigging");
  else techniques.push("All-around casting");

  const dedupe = (a: string[]) => Array.from(new Set(a));
  return {
    best,
    okay,
    tooLight,
    tooHeavy,
    wrongType,
    strengths: dedupe(strengths),
    weaknesses: dedupe(weaknesses),
    suggestions: dedupe(suggestions),
    environments: dedupe(environments),
    techniques: dedupe(techniques),
  };
}
