/**
 * B-Roll shot-list library. Grouped stock-footage search terms the admin can
 * drop into Pexels / Pixabay / Storyblocks / their own footage folder. The
 * helper suggests terms from a set of tags (water type, environment, method,
 * species category) so any generated idea can carry a sensible shot list.
 */

export type BrollGroup = {
  key: string;
  label: string;
  terms: string[];
};

export const BROLL_LIBRARY: BrollGroup[] = [
  {
    key: "saltwater-inshore",
    label: "Saltwater inshore",
    terms: [
      "saltwater marsh fishing",
      "inshore flats fishing",
      "redfish tailing shallow",
      "mangrove shoreline",
      "oyster bar low tide",
      "wading angler marsh",
    ],
  },
  {
    key: "saltwater-offshore",
    label: "Saltwater offshore",
    terms: [
      "offshore fishing boat",
      "trolling spread wake",
      "bluewater open ocean",
      "deep sea rod bent",
      "mahi mahi color",
      "center console running",
    ],
  },
  {
    key: "surf-pier",
    label: "Surf & pier",
    terms: [
      "surf fishing beach",
      "pier fishing sunrise",
      "casting into surf",
      "sand spike rod holder",
      "waves breaking shoreline",
      "pier pilings water",
    ],
  },
  {
    key: "freshwater-lake",
    label: "Freshwater lake & pond",
    terms: [
      "bass fishing lake",
      "largemouth bass jumping",
      "lily pads pond",
      "boat dock structure",
      "calm lake morning fog",
      "kayak lake fishing",
    ],
  },
  {
    key: "freshwater-river",
    label: "River & stream",
    terms: [
      "river fishing current",
      "trout stream clear water",
      "wading rocky river",
      "catfish river bank",
      "moving water riffle",
    ],
  },
  {
    key: "kayak",
    label: "Kayak",
    terms: [
      "kayak fishing",
      "paddle fishing marsh",
      "kayak rod holder",
      "launching kayak shore",
    ],
  },
  {
    key: "gear-closeups",
    label: "Gear close-ups",
    terms: [
      "fishing rod closeup",
      "spinning reel macro",
      "fishing line spool",
      "tackle box open",
      "lures organized tray",
      "fishing hook macro",
      "leader line closeup",
    ],
  },
  {
    key: "knots-rigging",
    label: "Knots & rigging",
    terms: [
      "tying fishing knot",
      "hands tying line",
      "cinching knot closeup",
      "rigging soft plastic",
      "snelling hook",
    ],
  },
  {
    key: "catch-release",
    label: "Catch & release",
    terms: [
      "angler holding fish",
      "releasing fish water",
      "fish on measuring board",
      "landing net fish",
      "sunset catch photo",
      "release splash slow motion",
    ],
  },
  {
    key: "conditions",
    label: "Weather & water",
    terms: [
      "tide coming in",
      "full moon over ocean",
      "storm clouds water",
      "calm water sunrise",
      "wind ripple surface",
    ],
  },
  {
    key: "lifestyle",
    label: "Lifestyle & community",
    terms: [
      "friends fishing boat",
      "loading truck fishing gear",
      "boat launch morning",
      "coffee dock sunrise",
      "father son fishing",
    ],
  },
];

const ALL_TERMS = BROLL_LIBRARY.flatMap((g) => g.terms);

/** Map loose tags (water, environment, category words) to relevant b-roll groups. */
const TAG_TO_GROUPS: Record<string, string[]> = {
  saltwater: ["saltwater-inshore", "saltwater-offshore", "surf-pier"],
  freshwater: ["freshwater-lake", "freshwater-river"],
  both: ["saltwater-inshore", "freshwater-lake"],
  inshore: ["saltwater-inshore"],
  offshore: ["saltwater-offshore"],
  surf: ["surf-pier"],
  pier: ["surf-pier"],
  beach: ["surf-pier"],
  lake: ["freshwater-lake"],
  pond: ["freshwater-lake"],
  river: ["freshwater-river"],
  stream: ["freshwater-river"],
  kayak: ["kayak"],
  boat: ["saltwater-offshore", "lifestyle"],
  gear: ["gear-closeups"],
  tackle: ["gear-closeups"],
  knot: ["knots-rigging"],
  rig: ["knots-rigging"],
  catch: ["catch-release"],
  release: ["catch-release"],
  weather: ["conditions"],
  tide: ["conditions"],
  crew: ["lifestyle"],
  community: ["lifestyle"],
};

/**
 * Suggest ~6 b-roll search terms for a set of tags. Falls back to a general
 * mix when no tag matches, so a shot list is never empty.
 */
export function suggestBroll(tags: string[], limit = 6): string[] {
  const groups = new Set<string>();
  for (const raw of tags) {
    const tag = raw.toLowerCase();
    for (const [key, gs] of Object.entries(TAG_TO_GROUPS)) {
      if (tag.includes(key)) gs.forEach((g) => groups.add(g));
    }
  }
  let pool: string[];
  if (groups.size === 0) {
    pool = [
      "angler holding fish",
      "fishing rod closeup",
      "casting from shore",
      "sunset water fishing",
      "tackle box open",
      "boat launch morning",
    ];
  } else {
    pool = BROLL_LIBRARY.filter((g) => groups.has(g.key)).flatMap((g) => g.terms);
  }
  // de-dupe while preserving order, then cap
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of pool) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
    if (out.length >= limit) break;
  }
  return out;
}

export function allBrollTerms(): string[] {
  return ALL_TERMS;
}
