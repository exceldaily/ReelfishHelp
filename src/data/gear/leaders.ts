import type { NewGearArticle } from "@/db/schema";

/** Leader education: when to use one and the main leader materials/types. */
export const leaderArticles: NewGearArticle[] = [
  {
    slug: "why-use-a-leader",
    category: "concept",
    subtype: "leader",
    name: "When (and Why) to Use a Leader",
    summary:
      "A leader is a short length of different line between your main line and the hook/lure. It adds invisibility, abrasion resistance, shock absorption, or bite protection where the main line falls short.",
    body: {
      useCases: [
        "Braid main line → almost always needs a leader (braid is visible)",
        "Clear water or wary fish → fluorocarbon leader",
        "Structure/oysters/rocks → heavier abrasion-resistant leader",
        "Toothy fish → wire bite leader",
        "Surf/big casts → mono shock leader",
      ],
      pros: ["Hides the visible braid", "Protects against abrasion and teeth", "Absorbs shock on the strike/cast"],
      cons: ["Adds a connection knot to tie well", "Wrong leader loses bites (too heavy) or fish (too light)"],
      mistakes: ["Tying braid straight to the hook", "Leader far heavier than needed in clear water"],
      facts: [
        { label: "Typical length", value: "18\"–4 ft inshore; longer for spooky/clear water" },
        { label: "Rule of thumb", value: "Leader ≈ 1.5–2× your main line strength inshore" },
      ],
    },
    waterTypes: ["freshwater", "saltwater"],
    sort: 1,
  },
  {
    slug: "fluorocarbon-leader",
    category: "leader",
    subtype: "fluorocarbon",
    name: "Fluorocarbon Leader",
    summary:
      "The most popular leader material. Nearly invisible underwater with excellent abrasion resistance — the default for inshore and clear-water fishing.",
    body: {
      useCases: ["Redfish, snook, trout", "Clear water", "Around light structure", "Line-shy fish"],
      pros: ["Nearly invisible", "Great abrasion resistance", "Sinks (good for subsurface baits)"],
      cons: ["Costs more than mono", "Stiffer — wet knots carefully"],
      mistakes: ["Going too heavy in clear water and losing bites", "Dry-cinching knots"],
      bestSpeciesNote: "Redfish, snook, seatrout, snapper, bass finesse",
    },
    relatedSpecies: ["redfish", "snook", "speckled-trout", "mangrove-snapper"],
    waterTypes: ["freshwater", "saltwater"],
    difficulty: 2,
    sort: 10,
  },
  {
    slug: "monofilament-leader",
    category: "leader",
    subtype: "monofilament",
    name: "Monofilament Leader",
    summary:
      "A stretchy, buoyant leader that shines with topwater and treble baits and as a cheap shock leader. More visible than fluoro but more forgiving.",
    body: {
      useCases: ["Topwater plugs", "Treble-hook baits", "Surf shock leaders", "Budget setups"],
      pros: ["Cheaper than fluoro", "Stretch cushions violent strikes", "Floats — keeps topwater working"],
      cons: ["More visible than fluoro", "Less abrasion resistance"],
      mistakes: ["Using mono leader in gin-clear water on wary fish"],
      bestSpeciesNote: "Topwater redfish/snook/trout, surf fish, striped bass",
    },
    relatedSpecies: ["redfish", "snook", "striped-bass"],
    waterTypes: ["freshwater", "saltwater"],
    difficulty: 1,
    sort: 11,
  },
  {
    slug: "wire-leader-bite",
    category: "leader",
    subtype: "wire",
    name: "Wire (Bite) Leader",
    summary:
      "A short trace of single-strand or cable wire that toothy fish can't cut. Loses some bites from wary fish but saves you from being sheared off.",
    body: {
      useCases: ["King/Spanish mackerel", "Barracuda", "Sharks", "Toothy trolling"],
      pros: ["Bite-proof", "Thin single-strand is fairly stealthy"],
      cons: ["Kinks and spooks wary fish", "Needs haywire twist or crimps"],
      mistakes: ["Kinking single strand (fails at the kink)", "Using wire when it isn't needed"],
      bestSpeciesNote: "King mackerel, Spanish mackerel, barracuda, sharks",
    },
    relatedSpecies: ["king-mackerel", "spanish-mackerel", "sharks-coastal"],
    waterTypes: ["saltwater"],
    difficulty: 3,
    sort: 12,
  },
  {
    slug: "shock-leader",
    category: "leader",
    subtype: "shock",
    name: "Shock Leader",
    summary:
      "A heavier length (usually mono) that absorbs the violent load of a big cast or a hard strike, protecting lighter main line. Standard in surf casting.",
    body: {
      useCases: ["Surf casting heavy sinkers", "Hard-striking fish", "Protecting light braid on the cast"],
      pros: ["Prevents cast-offs with heavy weights", "Absorbs strike shock"],
      cons: ["Adds a connection knot at the rod tip that must pass the guides smoothly"],
      mistakes: ["Too short a shock leader for the cast weight", "A bulky knot that catches in the guides"],
      facts: [{ label: "Surf rule of thumb", value: "~10 lb of shock leader per oz of sinker" }],
      bestSpeciesNote: "Surf: pompano, redfish, striped bass, sharks",
    },
    relatedSpecies: ["pompano", "redfish", "striped-bass"],
    waterTypes: ["saltwater"],
    difficulty: 2,
    sort: 13,
  },
  {
    slug: "wind-on-leader",
    category: "leader",
    subtype: "wind-on",
    name: "Wind-On Leader",
    summary:
      "A long leader with a hollow-core loop that connects to your main line and can be reeled through the guides onto the reel — giving offshore anglers a long leader they can crank the fish close on.",
    body: {
      useCases: ["Offshore trolling and live-baiting", "When you want a long leader you can reel to the rod tip"],
      pros: ["Reels smoothly through the guides", "Long leader for big, leader-shy pelagics", "Quick loop-to-loop swaps"],
      cons: ["More advanced to rig", "Overkill inshore"],
      mistakes: ["Poorly seated loop splice", "Using it where a simple leader would do"],
      bestSpeciesNote: "Tuna, sailfish, marlin, wahoo",
    },
    relatedSpecies: ["yellowfin-tuna", "sailfish", "wahoo"],
    waterTypes: ["saltwater"],
    difficulty: 4,
    sort: 14,
  },
];

/** Species-specific leader setup examples (presentational, Leaders page). */
export const leaderSetups: { species: string; label: string; setup: string }[] = [
  { species: "redfish", label: "Redfish", setup: "20–30 lb fluorocarbon, 18–24\". Bump to 30–40 lb around oyster bars and dock pilings." },
  { species: "snook", label: "Snook", setup: "30–50 lb fluorocarbon, 2–3 ft. Go 50–60 lb around bridges and heavy structure — snook have abrasive gill plates." },
  { species: "tarpon", label: "Tarpon", setup: "50–80 lb fluorocarbon bite leader off a heavier class/shock section; big tarpon need serious abrasion resistance and shock." },
  { species: "mangrove-snapper", label: "Snapper (inshore)", setup: "20–30 lb fluorocarbon; drop to 15–20 lb in clear water — mangroves are leader-shy." },
  { species: "gag-grouper", label: "Grouper", setup: "60–100+ lb mono/fluoro, short. Structure is brutal — heavy and abrasion-proof beats stealth." },
  { species: "sharks-coastal", label: "Shark", setup: "Heavy mono/fluoro bite section to a wire or cable bite trace; length past the tail to survive the roll." },
  { species: "largemouth-bass", label: "Bass", setup: "Often no leader; add 12–20 lb fluoro leader to braid in clear water or a 15–20 lb fluoro top shot for finesse." },
  { species: "rainbow-trout", label: "Trout", setup: "4–8 lb fluorocarbon; long and light in clear streams where trout inspect everything." },
];
