/** Dev helper: writes an HTML preview of the SEA map as the component renders it. */
import fs from "fs";
import { SEA_MAP_VIEWBOX, SEA_REGION_PATHS } from "../src/data/sea-map-paths";

const OFFSET_LABELS: Record<string, { lx: number; ly: number }> = {
  "sea-singapore": { lx: 132, ly: 566 },
  "sea-brunei": { lx: 420, ly: 462 },
};
const demo: Record<string, number> = { "sea-thailand": 7, "sea-peninsular-malaysia": 4, "sea-luzon": 2 };
const heat = (c: number) => (c >= 6 ? "#164556" : c >= 3 ? "#22829b" : c >= 1 ? "#abd9e4" : "#e8e1cf");

const svg = `<svg viewBox="${SEA_MAP_VIEWBOX}" style="width:720px">
<rect x="0" y="0" width="760" height="850" rx="14" fill="#eef6f8"/>
${SEA_REGION_PATHS.map((r) => {
  const count = demo[r.slug] ?? 0;
  const o = OFFSET_LABELS[r.slug];
  const lx = o?.lx ?? r.x, ly = o?.ly ?? r.y;
  return `<g>
    <path d="${r.d}" fill="${heat(count)}" stroke="#fff" stroke-width="1"/>
    ${o ? `<line x1="${r.x}" y1="${r.y}" x2="${lx}" y2="${ly - 4}" stroke="#8ba0aa" stroke-width="1"/>` : ""}
    <text x="${lx}" y="${ly}" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3">
      <tspan x="${lx}" dy="-2" font-size="11" font-weight="700" fill="#2b3d47">${r.label}</tspan>
      <tspan x="${lx}" dy="14" font-size="13" font-weight="800" fill="#175468">${count}</tspan>
    </text>
  </g>`;
}).join("")}
</svg>`;
fs.writeFileSync(process.argv[2], `<!doctype html><body style="margin:16px;font-family:sans-serif">${svg}</body>`);
console.log("preview written");
