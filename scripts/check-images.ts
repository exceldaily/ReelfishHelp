/** Dev helper: checks every species wikiTitle against the Wikipedia REST API. */
import { allSpecies } from "../src/data/species";

async function main() {
  for (const s of allSpecies) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(s.wikiTitle)}`,
        { headers: { "User-Agent": "ReelFishHelp/1.0 (dev image check)" } }
      );
      if (!res.ok) {
        console.log(`HTTP ${res.status}  ${s.slug}  (title: ${s.wikiTitle})`);
        continue;
      }
      const d = (await res.json()) as {
        title?: string;
        thumbnail?: { source: string; width: number };
        originalimage?: { source: string; width: number; height: number };
      };
      const orig = d.originalimage?.source ?? "";
      const thumb = d.thumbnail?.source ?? "";
      if (!orig && !thumb) {
        console.log(`NO IMAGE  ${s.slug}  (resolved page: ${d.title})`);
      } else if (/\.(svg|tiff?|gif)$/i.test(orig)) {
        console.log(`BAD FORMAT ${s.slug}  ${orig}`);
      } else {
        const w = d.originalimage?.width ?? 0;
        console.log(`ok ${s.slug}  ${w}px  ${orig.slice(0, 90)}`);
      }
    } catch (e) {
      console.log(`ERROR ${s.slug}: ${e}`);
    }
  }
}

main();
