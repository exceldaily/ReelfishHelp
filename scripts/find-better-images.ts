/**
 * Finds high-res replacement photos on Wikimedia Commons (species category)
 * for species whose Wikipedia lead image is too small. Prints candidates.
 */
import { allSpecies } from "../src/data/species";

const FLAGGED: Record<string, string> = {
  // slug -> Commons category (scientific name)
  redfish: "Sciaenops ocellatus",
  "king-mackerel": "Scomberomorus cavalla",
  tuna: "Thunnus albacares",
  "spanish-mackerel": "Scomberomorus maculatus",
  "hybrid-striped-bass": "Morone hybrids",
  sheepshead: "Archosargus probatocephalus",
  "striped-bass": "Morone saxatilis",
  "spotted-bass": "Micropterus punctulatus",
  bluegill: "Lepomis macrochirus",
  grouper: "Mycteroperca microlepis",
  wahoo: "Acanthocybium solandri",
  "brook-trout": "Salvelinus fontinalis",
};

const BAD_WORDS =
  /map|distribution|range|egg|larva|skeleton|illustration|drawing|stamp|cooked|dish|fillet|logo|sign|diagram|anatomy|x-ray|xray|scale|otolith|fossil|model/i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Candidate = { title: string; w: number; h: number; thumb: string };

async function categoryImages(category: string): Promise<Candidate[]> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers` +
    `&gcmtitle=${encodeURIComponent("Category:" + category)}&gcmtype=file&gcmlimit=200` +
    `&prop=imageinfo&iiprop=url%7Csize%7Cmime&iiurlwidth=1280&format=json&origin=*`;
  const res = await fetch(url, { headers: { "User-Agent": "ReelFishHelp/1.0 (image curation)" } });
  if (!res.ok) return [];
  const d = await res.json();
  const pages = d?.query?.pages ?? {};
  const out: Candidate[] = [];
  for (const p of Object.values(pages) as {
    title: string;
    imageinfo?: { width: number; height: number; mime: string; thumburl?: string; url: string }[];
  }[]) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    if (!/jpeg|png|webp/.test(ii.mime)) continue;
    if (BAD_WORDS.test(p.title)) continue;
    const ar = ii.width / ii.height;
    if (ii.width < 1100 || ar < 1.25 || ar > 2.3) continue;
    out.push({ title: p.title, w: ii.width, h: ii.height, thumb: ii.thumburl ?? ii.url });
  }
  // biggest area first
  return out.sort((a, b) => b.w * b.h - a.w * a.h);
}

async function main() {
  for (const [slug, category] of Object.entries(FLAGGED)) {
    const s = allSpecies.find((x) => x.slug === slug);
    console.log(`\n=== ${slug} (${category}) — current: ${s?.imageUrl?.slice(0, 80)}`);
    const cands = await categoryImages(category);
    for (const c of cands.slice(0, 3)) {
      console.log(`  ${c.w}x${c.h}  ${c.title}`);
      console.log(`      ${c.thumb}`);
    }
    if (cands.length === 0) console.log("  (no suitable candidates)");
    await sleep(400);
  }
}

main();
