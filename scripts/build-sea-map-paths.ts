/**
 * Generates src/data/sea-map-paths.ts — real Southeast Asia coastline SVG paths
 * for the SEA bite-board map — from the public-domain Natural Earth 1:50m
 * admin-0 countries GeoJSON (naturalearthdata.com, credit optional).
 *
 *   npx tsx scripts/build-sea-map-paths.ts <path-to-ne_50m_admin_0_countries.geojson>
 *
 * Countries are bucketed into the 17 SEA board regions; Malaysia, Indonesia,
 * and the Philippines are split per-polygon by centroid (Natural Earth country
 * multipolygons carry land borders, so Kalimantan/Sabah/Sarawak are separate
 * polygons already). Maluku and Papua are outside the board set and dropped.
 */
import fs from "fs";
import path from "path";

type Ring = [number, number][];
type Feature = {
  properties: Record<string, unknown>;
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
};

const src = process.argv[2];
if (!src) throw new Error("Pass the path to ne_50m_admin_0_countries.geojson");
const geo = JSON.parse(fs.readFileSync(src, "utf8")) as { features: Feature[] };

const ISO_KEYS = ["ISO_A3", "ADM0_A3", "iso_a3", "adm0_a3", "SOV_A3"];
function iso(f: Feature): string {
  for (const k of ISO_KEYS) {
    const v = f.properties[k];
    if (typeof v === "string" && v !== "-99") return v;
  }
  return "";
}

const SEA_ISO = new Set(["MMR", "THA", "LAO", "VNM", "KHM", "MYS", "SGP", "BRN", "IDN", "PHL"]);

function centroid(ring: Ring): [number, number] {
  let x = 0, y = 0;
  for (const [lon, lat] of ring) { x += lon; y += lat; }
  return [x / ring.length, y / ring.length];
}

/** Rough shoelace area in deg² — only used to rank/filter polygons. */
function area(ring: Ring): number {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(a / 2);
}

function classify(isoCode: string, [lon, lat]: [number, number]): string | null {
  switch (isoCode) {
    case "MMR": return "sea-myanmar";
    case "THA": return "sea-thailand";
    case "LAO": return "sea-laos";
    case "VNM": return "sea-vietnam";
    case "KHM": return "sea-cambodia";
    case "SGP": return "sea-singapore";
    case "BRN": return "sea-brunei";
    case "MYS": return lon < 106 ? "sea-peninsular-malaysia" : "sea-malaysian-borneo";
    case "IDN":
      if (lon < 106.5 && lat > -7) return "sea-sumatra";
      if (lat <= -5.6 && lon >= 104.5 && lon < 114.6) return "sea-java";
      if (lon >= 107.5 && lon < 117.8 && lat > -4.5) return "sea-kalimantan";
      if (lon >= 118.5 && lon <= 125.6 && lat > -6.5 && lat < 2.2) return "sea-sulawesi";
      if (lat < -5.5 && lon >= 114.6 && lon <= 127.5) return "sea-bali-nusa-tenggara";
      return null; // Maluku, Papua — outside the board set
    case "PHL":
      if (lat >= 12.6) return "sea-luzon";
      if (lon < 121 && lat >= 8.5) return "sea-luzon"; // Palawan (Mimaropa → Luzon group)
      if (lat >= 9.2) return "sea-visayas";
      return "sea-mindanao";
    default: return null;
  }
}

// ---- projection: plain equirectangular, fine this close to the equator ----
const LON_MIN = 92, LON_MAX = 127.6, LAT_MIN = -11.2, LAT_MAX = 28.6;
const W = 760;
const SCALE = W / (LON_MAX - LON_MIN);
const H = Math.round((LAT_MAX - LAT_MIN) * SCALE);
const px = (lon: number) => (lon - LON_MIN) * SCALE;
const py = (lat: number) => (LAT_MAX - lat) * SCALE;

/** viewBox-space simplification: drop points closer than ~1.4 units. */
function toPath(ring: Ring): string | null {
  const pts: [number, number][] = [];
  for (const [lon, lat] of ring) {
    const x = Math.round(px(lon) * 10) / 10;
    const y = Math.round(py(lat) * 10) / 10;
    const prev = pts[pts.length - 1];
    if (!prev || Math.abs(prev[0] - x) + Math.abs(prev[1] - y) > 1.4) pts.push([x, y]);
  }
  if (pts.length < 4) return null;
  return `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
}

const LABELS: Record<string, string> = {
  "sea-myanmar": "Myanmar",
  "sea-thailand": "Thailand",
  "sea-laos": "Laos",
  "sea-vietnam": "Vietnam",
  "sea-cambodia": "Cambodia",
  "sea-peninsular-malaysia": "Pen. Malaysia",
  "sea-malaysian-borneo": "Sabah / Sarawak",
  "sea-singapore": "Singapore",
  "sea-brunei": "Brunei",
  "sea-sumatra": "Sumatra",
  "sea-java": "Java",
  "sea-kalimantan": "Kalimantan",
  "sea-sulawesi": "Sulawesi",
  "sea-bali-nusa-tenggara": "Bali & Nusa Tenggara",
  "sea-luzon": "Luzon",
  "sea-visayas": "Visayas",
  "sea-mindanao": "Mindanao",
};

/** hand-tuned label anchors (viewBox coords) where the auto-centroid sits badly */
const LABEL_OVERRIDES: Record<string, [number, number]> = {
  "sea-vietnam": [333, 305], // centroid lands on the thin panhandle; sit just offshore
  "sea-laos": [238, 212], // pull off the Vietnam border
  "sea-malaysian-borneo": [565, 514], // pull east, clear of the Brunei label
  "sea-thailand": [180, 300],
};

const regions = new Map<string, { paths: string[]; best: { area: number; cx: number; cy: number } }>();

for (const f of geo.features) {
  const code = iso(f);
  if (!SEA_ISO.has(code)) continue;
  const polys: number[][][][] =
    f.geometry.type === "Polygon" ? [f.geometry.coordinates as number[][][]] : (f.geometry.coordinates as number[][][][]);
  for (const poly of polys) {
    const outer = poly[0] as Ring;
    const a = area(outer);
    if (a < 0.004) continue; // skip specks that only bloat the payload
    const c = centroid(outer);
    const slug = classify(code, c);
    if (!slug) continue;
    const d = toPath(outer);
    if (!d) continue;
    const entry = regions.get(slug) ?? { paths: [], best: { area: -1, cx: 0, cy: 0 } };
    entry.paths.push(d);
    if (a > entry.best.area) entry.best = { area: a, cx: px(c[0]), cy: py(c[1]) };
    regions.set(slug, entry);
  }
}

const missing = Object.keys(LABELS).filter((slug) => !regions.has(slug));
if (missing.length) throw new Error(`No polygons classified for: ${missing.join(", ")}`);

const out = Object.keys(LABELS).map((slug) => {
  const r = regions.get(slug)!;
  const [ox, oy] = LABEL_OVERRIDES[slug] ?? [r.best.cx, r.best.cy];
  return {
    slug,
    label: LABELS[slug],
    d: r.paths.join(""),
    x: Math.round(ox),
    y: Math.round(oy),
  };
});

const file = `// AUTO-GENERATED by scripts/build-sea-map-paths.ts — do not edit by hand.
// Coastlines: Natural Earth 1:50m admin-0 countries (public domain).

export const SEA_MAP_VIEWBOX = "0 0 ${W} ${H}";

export type SeaRegionPath = { slug: string; label: string; d: string; x: number; y: number };

export const SEA_REGION_PATHS: SeaRegionPath[] = ${JSON.stringify(out, null, 2)};
`;

const dest = path.join(__dirname, "..", "src", "data", "sea-map-paths.ts");
fs.writeFileSync(dest, file);
const kb = Math.round(Buffer.byteLength(file) / 1024);
console.log(`Wrote ${dest} (${kb} KB, viewBox 0 0 ${W} ${H})`);
for (const r of out) console.log(`  ${r.slug}: ${r.d.length} path chars, label at ${r.x},${r.y}`);
