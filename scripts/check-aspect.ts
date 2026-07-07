/** Dev helper: reports aspect ratio of every species photo — flags portrait/odd crops. */
import { allSpecies } from "../src/data/species";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  for (const s of allSpecies) {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(s.wikiTitle)}`,
      { headers: { "User-Agent": "ReelFishHelp/1.0 (aspect check)" } }
    );
    if (!res.ok) {
      console.log(`FETCH ${res.status} ${s.slug}`);
      await sleep(400);
      continue;
    }
    const d = (await res.json()) as { originalimage?: { width: number; height: number; source: string } };
    const w = d.originalimage?.width ?? 0;
    const h = d.originalimage?.height ?? 0;
    const ar = h ? (w / h).toFixed(2) : "?";
    const flag = h > 0 && w / h < 1.15 ? "  <-- PORTRAIT/SQUARE (bad crop)" : "";
    console.log(`${ar}  ${s.slug}  ${w}x${h}${flag}`);
    await sleep(350);
  }
}

main();
