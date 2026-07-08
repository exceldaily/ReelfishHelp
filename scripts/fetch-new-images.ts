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

// slug → Wikipedia page title
const TARGETS: Record<string, string> = {
  "blackfin-tuna": "Blackfin tuna",
  "yellowfin-tuna": "Yellowfin tuna",
  "bluefin-tuna": "Atlantic bluefin tuna",
  "bigeye-tuna": "Bigeye tuna",
  "albacore-tuna": "Albacore",
  "skipjack-tuna": "Skipjack tuna",
  "hogfish": "Hogfish",
};

const OUT = path.join(process.cwd(), "public", "species");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extOf(url: string): string {
  const m = url.toLowerCase().match(/\.(jpe?g|png|webp)(\?|$)/);
  if (!m) return ".jpg";
  return m[1] === "jpeg" ? ".jpg" : `.${m[1]}`;
}

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
    const ext = extOf(src);
    const file = `${slug}${ext}`;
    const img = await fetch(src, { headers: { "User-Agent": "ReelFishHelp/1.0 (species images; exceldaily7@gmail.com)" } });
    if (!img.ok) {
      console.log(`FAIL download ${slug}: HTTP ${img.status}`);
      continue;
    }
    const buf = Buffer.from(await img.arrayBuffer());
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
