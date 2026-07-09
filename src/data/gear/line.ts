import type { NewGearArticle } from "@/db/schema";

/** Fishing line education: the main line types with honest strengths/weaknesses. */
export const lineArticles: NewGearArticle[] = [
  {
    slug: "monofilament",
    category: "line",
    subtype: "monofilament",
    name: "Monofilament",
    summary:
      "A single strand of nylon. Cheap, forgiving, stretchy, and floats. The classic beginner line and still the best choice for treble-hook baits and topwater.",
    body: {
      useCases: ["Beginners", "Topwater and treble-hook baits", "Live bait with a bit of give", "Reel backing"],
      pros: ["Inexpensive", "Stretch forgives mistakes and cushions hooksets", "Easy knots", "Floats (good for topwater)"],
      cons: ["Stretch kills sensitivity at distance/depth", "Weakens in UV over time", "Larger diameter than braid"],
      underwaterVisibility: "Moderate — clear/low-vis colors help",
      stretch: "High",
      abrasion: "Good",
      casting: "Good",
      knotStrength: "Excellent — very knot-friendly",
      mistakes: ["Leaving mono on the reel for years until it's brittle", "Expecting braid-like sensitivity"],
      bestSpeciesNote: "Panfish, trout, bass on cranks/topwater, surf bait",
    },
    waterTypes: ["freshwater", "saltwater"],
    difficulty: 1,
    sort: 10,
  },
  {
    slug: "fluorocarbon",
    category: "line",
    subtype: "fluorocarbon",
    name: "Fluorocarbon",
    summary:
      "A dense line that refracts light close to water, making it hard for fish to see. Low stretch, great abrasion resistance, and it sinks — the go-to leader material.",
    body: {
      useCases: ["Leaders (the #1 use)", "Clear water", "Finesse bass main line", "Line-shy fish"],
      pros: ["Nearly invisible underwater", "Excellent abrasion resistance", "Low stretch = good sensitivity", "Sinks"],
      cons: ["Pricey", "Stiffer — more knot care needed", "Can be brittle if knots are cinched dry"],
      underwaterVisibility: "Very low — its biggest advantage",
      stretch: "Low–moderate",
      abrasion: "Excellent",
      casting: "Fair as main line (stiffer)",
      knotStrength: "Good — always wet knots before cinching",
      mistakes: ["Cinching knots dry and burning the line", "Using it as heavy main line and fighting coils"],
      bestSpeciesNote: "Leaders for redfish/snook/snapper; finesse bass",
    },
    relatedSpecies: ["redfish", "snook", "largemouth-bass"],
    waterTypes: ["freshwater", "saltwater"],
    difficulty: 2,
    sort: 11,
  },
  {
    slug: "braided-line",
    category: "line",
    subtype: "braid",
    name: "Braided Line",
    summary:
      "Woven fibers with almost zero stretch and a tiny diameter for its strength. Incredible sensitivity, casting distance, and cutting power — pair it with a leader.",
    body: {
      useCases: ["Main line for most modern setups", "Braid-to-fluoro leader systems", "Heavy cover", "Deep jigging"],
      pros: ["No stretch = maximum sensitivity and hooksets", "Thin diameter = long casts + huge capacity", "Very strong, no memory"],
      cons: ["Highly visible (needs a leader)", "Can dig into itself / wind knots", "Slippery — use braid-specific knots"],
      underwaterVisibility: "High — always add a mono/fluoro leader",
      stretch: "Almost none",
      abrasion: "Good but can be cut on sharp structure/oysters",
      casting: "Excellent",
      knotStrength: "Use Palomar/Uni or an FG to leader — avoid basic clinch",
      mistakes: ["Tying braid straight to the hook and spooking fish", "Using a knot that slips on braid"],
      bestSpeciesNote: "Almost everything as main line — redfish, snook, bass, snapper, tuna",
    },
    relatedSpecies: ["redfish", "snook", "largemouth-bass", "red-snapper"],
    waterTypes: ["freshwater", "saltwater"],
    difficulty: 2,
    sort: 12,
  },
  {
    slug: "copolymer",
    category: "line",
    subtype: "copolymer",
    name: "Copolymer",
    summary:
      "Mono's upgraded cousin — multiple nylon materials blended for less stretch and smaller diameter than standard mono, while keeping easy handling and knots.",
    body: {
      useCases: ["All-around main line", "Crankbaits and moving baits", "Anglers who want mono handling with more sensitivity"],
      pros: ["Less stretch than mono", "Thinner and often stronger than mono", "Still knots easily and casts smoothly"],
      cons: ["More expensive than basic mono", "Still more visible/stretchy than fluoro or braid"],
      underwaterVisibility: "Moderate",
      stretch: "Moderate (less than mono)",
      abrasion: "Good",
      casting: "Very good",
      knotStrength: "Excellent",
      mistakes: ["Assuming it's the same as cheap mono", "Ignoring it as a great value main line"],
      bestSpeciesNote: "Bass, walleye, all-around freshwater and light inshore",
    },
    waterTypes: ["freshwater", "saltwater"],
    difficulty: 1,
    sort: 13,
  },
  {
    slug: "wire-leader",
    category: "line",
    subtype: "wire",
    name: "Wire Leader",
    summary:
      "Not a main line — a short bite trace of single-strand or multi-strand wire that toothy fish can't cut through. Essential for mackerel, sharks, and barracuda.",
    body: {
      useCases: ["Toothy fish (kingfish, mackerel, barracuda, sharks)", "Trolling for cutters", "Anywhere teeth sever mono/fluoro"],
      pros: ["Bite-proof against teeth", "Thin single-strand is nearly invisible in the water"],
      cons: ["Kinks (single strand) and can spook wary fish", "Requires special connections (haywire twist / crimps)"],
      underwaterVisibility: "Low (dark coffee color) but stiffer than mono",
      stretch: "None",
      abrasion: "Bite-proof",
      casting: "N/A (short trace)",
      knotStrength: "Use a Haywire Twist (single strand) or crimps (cable)",
      mistakes: ["Using wire when fish aren't toothy (loses bites)", "Kinking single-strand wire (it fails at kinks)"],
      bestSpeciesNote: "King mackerel, Spanish mackerel, barracuda, sharks",
    },
    relatedSpecies: ["king-mackerel", "spanish-mackerel", "sharks-coastal"],
    waterTypes: ["saltwater"],
    difficulty: 3,
    sort: 14,
  },
  {
    slug: "lead-core",
    category: "line",
    subtype: "lead-core",
    name: "Lead Core Line",
    summary:
      "A trolling line with a lead center that sinks to run lures at depth without heavy weights. Color-coded every 10 yards to track how deep you're fishing.",
    body: {
      useCases: ["Trolling for walleye, trout, and salmon", "Getting lures deep without downriggers"],
      pros: ["Reaches trolling depth without heavy sinkers", "Color segments meter depth precisely"],
      cons: ["Bulky, low capacity", "Specialized — trolling only", "Needs a mono/fluoro leader"],
      stretch: "Low",
      casting: "N/A (trolling)",
      mistakes: ["Counting colors wrong and fishing the wrong depth", "Using it where it isn't needed"],
      bestSpeciesNote: "Walleye, lake trout, salmon (troll)",
    },
    relatedSpecies: ["walleye"],
    waterTypes: ["freshwater"],
    difficulty: 3,
    sort: 15,
  },
  {
    slug: "fly-backing",
    category: "line",
    subtype: "backing",
    name: "Fly Line Backing",
    summary:
      "Thin, strong line (usually Dacron or gel-spun) that fills the fly reel under the fly line and gives you extra yardage when a strong fish runs past your fly line.",
    body: {
      useCases: ["Under fly line on the reel", "Extra line for long-running saltwater fish"],
      pros: ["Adds capacity for big runs", "Builds up arbor for faster line pickup"],
      cons: ["Only relevant to fly setups", "Too little backing loses trophy fish"],
      knotStrength: "Arbor knot to spool, Albright/nail knot to fly line",
      mistakes: ["Skimping on backing for bonefish/tarpon (200+ yds recommended)"],
      bestSpeciesNote: "Saltwater fly targets — bonefish, tarpon, redfish",
    },
    relatedSpecies: ["bonefish", "tarpon"],
    waterTypes: ["freshwater", "saltwater"],
    difficulty: 2,
    sort: 16,
  },
];

/** Head-to-head comparison tables rendered on the Line page (presentational). */
export const lineComparisons: {
  title: string;
  columns: [string, string];
  rows: { attr: string; a: string; b: string }[];
  takeaway: string;
}[] = [
  {
    title: "Mono vs Braid",
    columns: ["Monofilament", "Braid"],
    rows: [
      { attr: "Stretch", a: "High (forgiving)", b: "Almost none (sensitive)" },
      { attr: "Visibility", a: "Moderate", b: "High — needs a leader" },
      { attr: "Diameter", a: "Thicker", b: "Very thin for its strength" },
      { attr: "Sensitivity", a: "Lower", b: "Highest" },
      { attr: "Cost", a: "Cheapest", b: "Higher" },
      { attr: "Best for", a: "Topwater, cranks, beginners", b: "Sensitivity, distance, cover, depth" },
    ],
    takeaway: "Braid as main line for feel and distance, mono when you want stretch (treble baits/topwater) or a budget spool.",
  },
  {
    title: "Braid vs Fluorocarbon",
    columns: ["Braid", "Fluorocarbon"],
    rows: [
      { attr: "Visibility", a: "High", b: "Very low" },
      { attr: "Stretch", a: "None", b: "Low–moderate" },
      { attr: "Abrasion", a: "Good (cuts on oysters)", b: "Excellent" },
      { attr: "Sinks?", a: "No", b: "Yes" },
      { attr: "Typical role", a: "Main line", b: "Leader (and finesse main line)" },
    ],
    takeaway: "The modern standard: braid main line + a fluorocarbon leader. Braid for casting and feel, fluoro for invisibility and abrasion at the business end.",
  },
  {
    title: "Fluorocarbon Leader vs Mono Leader",
    columns: ["Fluoro Leader", "Mono Leader"],
    rows: [
      { attr: "Visibility", a: "Very low", b: "Moderate" },
      { attr: "Abrasion", a: "Excellent", b: "Good" },
      { attr: "Stretch/shock", a: "Lower", b: "More shock absorption" },
      { attr: "Cost", a: "Higher", b: "Lower" },
      { attr: "Best for", a: "Clear water, wary fish, structure", b: "Topwater, sharp strikes, budget, surf shock" },
    ],
    takeaway: "Fluoro leader when fish are line-shy or near structure; mono leader for topwater, shock absorption, and value.",
  },
];

/** Quick picks on the Line page (presentational). */
export const lineGuideCards: { title: string; pick: string; why: string }[] = [
  { title: "Best line for beginners", pick: "10–12 lb monofilament", why: "Cheap, forgiving stretch, easy knots — mistakes cost you less while you learn." },
  { title: "Best line for saltwater", pick: "Braid main line + fluorocarbon leader", why: "Braid casts far and resists no memory in salt; fluoro leader adds invisibility and abrasion resistance." },
  { title: "Best line for bass", pick: "Braid for cover/topwater, fluoro for finesse, mono for cranks", why: "Match line to technique — no single bass line does everything well." },
  { title: "Best line for offshore fishing", pick: "50–80 lb braid with heavy mono/fluoro top shot", why: "Thin braid gives capacity and depth; the top shot adds stretch and abrasion for big fish." },
  { title: "Best line for toothy fish", pick: "Braid/mono main + a short wire bite leader", why: "Only wire reliably survives the teeth of mackerel, barracuda, and sharks." },
];
