/**
 * Badge catalog. Images live in public/badges/<slug>.png (sliced from the
 * owner's badge sheet). Two kinds:
 * - "granted": awarded by hand (stored in user_badges)
 * - "derived": earned automatically from live activity stats, never stored
 * `blurb` is the hover tooltip: what the badge is and how you get it.
 */

export type BadgeKind = "granted" | "derived";

export type BadgeDef = {
  slug: string;
  name: string;
  blurb: string;
  kind: BadgeKind;
  /** display order — earlier = more prestigious, shown first */
  sort: number;
};

export const BADGES: BadgeDef[] = [
  {
    slug: "founding-member",
    name: "Founding Member",
    blurb: "One of the first anglers on ReelFishHelp. Here before it was cool.",
    kind: "granted",
    sort: 1,
  },
  {
    slug: "og",
    name: "OG — Original Fisherman",
    blurb: "An original. Part of the crew that got ReelFishHelp off the dock.",
    kind: "granted",
    sort: 2,
  },
  {
    slug: "partner",
    name: "Partner",
    blurb: "Official ReelFishHelp partner.",
    kind: "granted",
    sort: 3,
  },
  {
    slug: "verified",
    name: "Verified",
    blurb: "Identity verified by the ReelFishHelp team.",
    kind: "granted",
    sort: 4,
  },
  {
    slug: "crew-captain",
    name: "Crew Captain",
    blurb: "Runs a crew. Earned by starting your own crew and bringing anglers together.",
    kind: "derived",
    sort: 5,
  },
  {
    slug: "catch-master",
    name: "Catch Master",
    blurb: "Logged 20 or more catches. A true stick.",
    kind: "derived",
    sort: 6,
  },
  {
    slug: "community-star",
    name: "Community Star",
    blurb: "Earned 25+ likes from fellow anglers on shared catches.",
    kind: "derived",
    sort: 7,
  },
  {
    slug: "top-contributor",
    name: "Top Contributor",
    blurb: "Posted 15+ questions and answers in the forum. Keeps the community sharp.",
    kind: "derived",
    sort: 8,
  },
  {
    slug: "helpful-angler",
    name: "Helpful Angler",
    blurb: "Had 3+ forum answers accepted as the solution. Good intel, freely given.",
    kind: "derived",
    sort: 9,
  },
  {
    slug: "gear-guru",
    name: "Gear Guru",
    blurb: "Built out a gear locker with 8+ rods, reels, and tackle.",
    kind: "derived",
    sort: 10,
  },
  {
    slug: "tournament-ready",
    name: "Tournament Ready",
    blurb: "Planned and completed 3+ fishing trips. Shows up prepared.",
    kind: "derived",
    sort: 11,
  },
  {
    slug: "first-catch",
    name: "First Catch",
    blurb: "Logged a first catch on ReelFishHelp. Everyone starts somewhere.",
    kind: "derived",
    sort: 12,
  },
];

export const badgeBySlug = (slug: string): BadgeDef | undefined =>
  BADGES.find((b) => b.slug === slug);
