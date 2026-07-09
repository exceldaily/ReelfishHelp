import { gearArticles, knots, gearSetups, gearBrands, fishGearRequirements } from "@/db/schema";

export type FieldKind = "text" | "textarea" | "number" | "select" | "status" | "json";
export type Field = { name: string; label: string; kind: FieldKind; options?: string[]; required?: boolean };
export type GearTypeKey = "articles" | "knots" | "setups" | "brands" | "requirements";

export const STATUS_OPTIONS = ["draft", "review", "published"];

export const TYPE_CFG: Record<GearTypeKey, { label: string; titleField: string; idField: "id" | "speciesSlug"; fields: Field[] }> = {
  articles: {
    label: "Education Articles",
    titleField: "name",
    idField: "id",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "slug", label: "Slug", kind: "text", required: true },
      { name: "category", label: "Category", kind: "select", options: ["rod", "reel", "line", "leader", "terminal", "concept"] },
      { name: "subtype", label: "Subtype", kind: "text" },
      { name: "summary", label: "Summary", kind: "textarea", required: true },
      { name: "difficulty", label: "Difficulty (1-5)", kind: "number" },
      { name: "sort", label: "Sort order", kind: "number" },
      { name: "status", label: "Status", kind: "status" },
      { name: "waterTypes", label: "Water types (JSON array)", kind: "json" },
      { name: "relatedSpecies", label: "Related species slugs (JSON array)", kind: "json" },
      { name: "body", label: "Body (JSON: useCases/pros/cons/facts…)", kind: "json" },
    ],
  },
  knots: {
    label: "Knots",
    titleField: "name",
    idField: "id",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "slug", label: "Slug", kind: "text", required: true },
      { name: "useCategory", label: "Use category", kind: "select", options: ["line-to-hook", "line-to-lure", "braid-to-leader", "line-to-line", "loop", "offshore", "fly", "wire"] },
      { name: "bestUse", label: "Best use", kind: "textarea", required: true },
      { name: "difficulty", label: "Difficulty (1-5)", kind: "number" },
      { name: "strengthRating", label: "Strength rating (1-5)", kind: "number" },
      { name: "imageUrl", label: "Image URL (diagram)", kind: "text" },
      { name: "videoUrl", label: "Video URL", kind: "text" },
      { name: "whenNotToUse", label: "When not to use", kind: "textarea" },
      { name: "sort", label: "Sort order", kind: "number" },
      { name: "status", label: "Status", kind: "status" },
      { name: "lineTypes", label: "Line types (JSON array)", kind: "json" },
      { name: "species", label: "Species slugs (JSON array)", kind: "json" },
      { name: "alternatives", label: "Alternative knot slugs (JSON array)", kind: "json" },
      { name: "steps", label: "Steps (JSON: [{n,text}])", kind: "json" },
      { name: "mistakes", label: "Mistakes (JSON array)", kind: "json" },
    ],
  },
  setups: {
    label: "Gear Setups",
    titleField: "name",
    idField: "id",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "slug", label: "Slug", kind: "text", required: true },
      { name: "category", label: "Category", kind: "select", options: ["all-around", "shore", "pier", "kayak", "inshore-boat", "offshore", "technique", "trophy"] },
      { name: "water", label: "Water", kind: "select", options: ["freshwater", "saltwater", "both"] },
      { name: "summary", label: "Summary", kind: "textarea", required: true },
      { name: "rod", label: "Rod", kind: "text" },
      { name: "reel", label: "Reel", kind: "text" },
      { name: "mainLine", label: "Main line", kind: "text" },
      { name: "leader", label: "Leader", kind: "text" },
      { name: "hook", label: "Hook", kind: "text" },
      { name: "rig", label: "Rig", kind: "text" },
      { name: "lureBait", label: "Lure / bait", kind: "text" },
      { name: "knot", label: "Knot", kind: "text" },
      { name: "whyItWorks", label: "Why it works", kind: "textarea" },
      { name: "sort", label: "Sort order", kind: "number" },
      { name: "status", label: "Status", kind: "status" },
      { name: "environments", label: "Environments (JSON array)", kind: "json" },
      { name: "methods", label: "Methods (JSON array)", kind: "json" },
      { name: "relatedSpecies", label: "Related species slugs (JSON array)", kind: "json" },
      { name: "flags", label: "Flags (JSON object)", kind: "json" },
    ],
  },
  brands: {
    label: "Brands",
    titleField: "name",
    idField: "id",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "slug", label: "Slug", kind: "text", required: true },
      { name: "water", label: "Water", kind: "select", options: ["freshwater", "saltwater", "both"] },
      { name: "reputation", label: "Reputation", kind: "textarea", required: true },
      { name: "beginnerNotes", label: "Beginner notes", kind: "textarea" },
      { name: "sort", label: "Sort order", kind: "number" },
      { name: "status", label: "Status", kind: "status" },
      { name: "categories", label: "Categories (JSON array: rod/reel/line/tackle)", kind: "json" },
      { name: "bestKnownFor", label: "Best known for (JSON array)", kind: "json" },
      { name: "useCases", label: "Use cases (JSON array)", kind: "json" },
    ],
  },
  requirements: {
    label: "Fish Gear Requirements",
    titleField: "speciesSlug",
    idField: "speciesSlug",
    fields: [
      { name: "speciesSlug", label: "Species slug", kind: "text", required: true },
      { name: "lineLbMin", label: "Line lb min", kind: "number", required: true },
      { name: "lineLbIdeal", label: "Line lb ideal", kind: "number", required: true },
      { name: "lineLbMax", label: "Line lb max", kind: "number", required: true },
      { name: "leaderLbMin", label: "Leader lb min", kind: "number" },
      { name: "leaderLbMax", label: "Leader lb max", kind: "number" },
      { name: "reelSizeMin", label: "Reel size min", kind: "number" },
      { name: "reelSizeMax", label: "Reel size max", kind: "number" },
      { name: "hookSize", label: "Hook size", kind: "text" },
      { name: "typicalSizeLb", label: "Typical size (lb)", kind: "number" },
      { name: "fightStrength", label: "Fight strength (1-5)", kind: "number" },
      { name: "structureRisk", label: "Structure risk (1-5)", kind: "number" },
      { name: "notes", label: "Notes", kind: "textarea" },
      { name: "status", label: "Status", kind: "status" },
      { name: "rodPower", label: "Rod power (JSON array)", kind: "json" },
      { name: "methods", label: "Methods (JSON array)", kind: "json" },
    ],
  },
};

export function isGearType(t: string): t is GearTypeKey {
  return t in TYPE_CFG;
}

/** Drizzle table + id column for a type. */
export function tableFor(type: GearTypeKey) {
  switch (type) {
    case "articles": return { table: gearArticles, idCol: gearArticles.id, hasUpdatedAt: true };
    case "knots": return { table: knots, idCol: knots.id, hasUpdatedAt: true };
    case "setups": return { table: gearSetups, idCol: gearSetups.id, hasUpdatedAt: true };
    case "brands": return { table: gearBrands, idCol: gearBrands.id, hasUpdatedAt: false };
    case "requirements": return { table: fishGearRequirements, idCol: fishGearRequirements.speciesSlug, hasUpdatedAt: false };
  }
}

/** Coerce submitted form values into DB values per the field config. Returns an error string on bad JSON. */
export function buildRowValues(type: GearTypeKey, formData: FormData): { values: Record<string, unknown> } | { error: string } {
  const values: Record<string, unknown> = {};
  for (const f of TYPE_CFG[type].fields) {
    const raw = formData.get(f.name);
    const str = raw == null ? "" : String(raw).trim();
    if (f.kind === "number") {
      values[f.name] = str === "" ? null : Number(str);
    } else if (f.kind === "json") {
      if (str === "") { values[f.name] = f.name === "flags" || f.name === "body" ? {} : []; continue; }
      try {
        values[f.name] = JSON.parse(str);
      } catch {
        return { error: `Invalid JSON in "${f.label}".` };
      }
    } else {
      // text/textarea/select/status
      values[f.name] = str === "" ? (f.required ? "" : null) : str;
    }
  }
  return { values };
}
