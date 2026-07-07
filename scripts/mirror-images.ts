/**
 * Downloads every species photo into public/species/<slug>.<ext> and rewrites
 * src/data/species/images.ts to the local paths (originals kept as sourceUrl
 * comments for attribution). Slow + retrying to respect Wikimedia limits.
 */
import fs from "fs";
import path from "path";
import { speciesImages } from "../src/data/species/images";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const OUT = path.join(process.cwd(), "public", "species");

async function download(url: string, attempt = 1): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": "ReelFishHelp/1.0 (one-time image mirror; exceldaily7@gmail.com)" },
  });
  if (res.status === 429 && attempt <= 5) {
    await sleep(5000 * attempt);
    return download(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function extOf(url: string): string {
  const m = url.toLowerCase().match(/\.(jpe?g|png|webp)(\?|$)/);
  if (!m) return ".jpg";
  return m[1] === "jpeg" ? ".jpg" : `.${m[1]}`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const entries: string[] = [];
  for (const [slug, img] of Object.entries(speciesImages)) {
    const ext = extOf(img.url);
    const file = `${slug}${ext}`;
    const target = path.join(OUT, file);
    if (!fs.existsSync(target)) {
      const buf = await download(img.url);
      if (buf.length < 10_000) throw new Error(`suspiciously small file for ${slug} (${buf.length}b)`);
      fs.writeFileSync(target, buf);
      console.log(`saved ${file}  ${(buf.length / 1024).toFixed(0)} KB`);
      await sleep(1500);
    } else {
      console.log(`exists ${file}`);
    }
    entries.push(
      `  "${slug}": { url: "/species/${file}", credit: ${JSON.stringify(img.credit)}, sourceUrl: ${JSON.stringify(img.url)} },`
    );
  }

  const out = `/**
 * Species photos, self-hosted in public/species/ (mirrored from Wikimedia
 * Commons — see sourceUrl per entry for the original/attribution page).
 * Regenerate the set with scripts/generate-image-map.ts + scripts/mirror-images.ts.
 */
export const speciesImages: Record<string, { url: string; credit: string; sourceUrl?: string }> = {
${entries.join("\n")}
};
`;
  fs.writeFileSync(path.join(process.cwd(), "src", "data", "species", "images.ts"), out);
  console.log(`\nmirrored ${entries.length} images; images.ts now uses local paths`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
