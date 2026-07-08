/**
 * Forum topic sections. Questions are scoped to a US state board AND a topic,
 * so anglers can browse "Reel Recommendations in Florida", etc.
 */
export type ForumTopic = { slug: string; label: string; blurb: string };

export const FORUM_TOPICS: ForumTopic[] = [
  { slug: "reel-recommendations", label: "Reel Recommendations", blurb: "Which reel for the job — spinning, baitcaster, conventional." },
  { slug: "rod-recommendations", label: "Rod Recommendations", blurb: "Rod length, power, action, and combos for a technique." },
  { slug: "bait-lures", label: "Bait & Lures", blurb: "What's producing — live bait, soft plastics, hard baits." },
  { slug: "tackle-rigs", label: "Tackle & Rigs", blurb: "Line, leader, hooks, knots, and rig setups." },
  { slug: "boats-motors", label: "Boats & Motors", blurb: "Boat buying, rigging, motors, maintenance, trailers." },
  { slug: "kayaks", label: "Kayaks", blurb: "Kayak selection, rigging, safety, and paddle-fishing tips." },
  { slug: "electronics", label: "Electronics & Sonar", blurb: "Fish finders, GPS, transducers, and reading sonar." },
  { slug: "techniques", label: "Techniques & How-To", blurb: "Presentation, casting, fighting fish, and tactics." },
  { slug: "where-to-fish", label: "Where to Fish", blurb: "Access, spots (broad areas only), ramps, and piers." },
  { slug: "general", label: "General", blurb: "Everything else — reports, stories, and questions." },
];

export const FORUM_TOPIC_SLUGS = FORUM_TOPICS.map((t) => t.slug);
export const DEFAULT_FORUM_TOPIC = "general";

export function forumTopicLabel(slug?: string | null): string {
  return FORUM_TOPICS.find((t) => t.slug === slug)?.label ?? "General";
}

export function isForumTopic(slug?: string | null): boolean {
  return !!slug && FORUM_TOPIC_SLUGS.includes(slug);
}
