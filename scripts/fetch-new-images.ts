/**
 * Fetches a correct lead photo for each new species straight from its Wikipedia
 * page (REST summary → originalimage), saving to public/species/<slug>.<ext> and
 * printing ready-to-paste images.ts entries. Using the page's own lead image
 * guarantees the photo matches the species (no hand-guessed file URLs).
 *
 * Usage: npx tsx scripts/fetch-new-images.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

// slug → Wikipedia page title
const TARGETS: Record<string, string> = {
  "red-snapper": "Northern red snapper",
  "mangrove-snapper": "Mangrove snapper",
  "yellowtail-snapper": "Yellowtail snapper",
  "mutton-snapper": "Mutton snapper",
  "lane-snapper": "Lane snapper",
  "vermilion-snapper": "Vermilion snapper",
  "cubera-snapper": "Cubera snapper",
  "gag-grouper": "Gag grouper",
  "red-grouper": "Red grouper",
  "black-grouper": "Black grouper",
  "scamp-grouper": "Scamp grouper",
  "snowy-grouper": "Snowy grouper",
  "red-hind": "Red hind",
};

const OUT = path.join(process.cwd(), "public", "species");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const lines: string[] = [];
  for (const [slug, title] of Object.entries(TARGETS)) {
    const api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(api, { headers: { "User-Agent": "ReelFishHelp/1.0 (species images; exceldaily7@gmail.com)" } });
    if (!res.ok) {
      console.log(`FAIL summary ${slug}: HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    const src: string | undefined = data.originalimage?.source ?? data.thumbnail?.source;
    if (!src) {
      console.log(`FAIL no image ${slug}`);
      continue;
    }
    const file = `${slug}.jpg`;
    const img = await fetch(src, { headers: { "User-Agent": "ReelFishHelp/1.0 (species images; exceldaily7@gmail.com)" } });
    if (!img.ok) {
      console.log(`FAIL download ${slug}: HTTP ${img.status}`);
      continue;
    }
    const raw = Buffer.from(await img.arrayBuffer());
    const buf = await sharp(raw)
      .rotate()
      .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, file), buf);
    console.log(`saved ${file}  ${(buf.length / 1024).toFixed(0)} KB  <- ${title}`);
    lines.push(
      `  "${slug}": { url: "/species/${file}", credit: ${JSON.stringify(`Wikipedia — ${title}`)}, sourceUrl: ${JSON.stringify(src)} },`
    );
    await sleep(800);
  }
  console.log("\n--- paste into src/data/species/images.ts ---");
  console.log(lines.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
