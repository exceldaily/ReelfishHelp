/** Dev helper: HEAD-checks every baked species image URL. */
import { speciesImages } from "../src/data/species/images";

async function main() {
  let bad = 0;
  for (const [slug, img] of Object.entries(speciesImages)) {
    const res = await fetch(img.url, {
      method: "HEAD",
      headers: { "User-Agent": "ReelFishHelp/1.0 (image check)" },
    });
    if (!res.ok) {
      console.log("BAD", res.status, slug, img.url);
      bad++;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log(bad === 0 ? "all 41 image URLs return 200" : `${bad} broken`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
