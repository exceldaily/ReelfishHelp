/**
 * Reusable short-form video templates. Each template is a repeatable structure
 * the admin can fill in for a specific species / setup / week. These are the
 * spine of the Content Studio: the Idea Generator can be pointed at a template,
 * and each template can also be turned into a draft content item directly.
 */

export type VideoTemplate = {
  slug: string;
  name: string;
  description: string;
  /** the ordered beats of the video */
  beats: string[];
  defaultHook: string;
  defaultCta: string;
  suggestedHashtags: string[];
  brollTerms: string[];
  /** roughly how long the finished clip runs */
  lengthHint: "15s" | "30s" | "15-30s" | "30-60s";
  /** which app data this template usually pulls from */
  grounding: "species" | "setup" | "knot" | "board" | "crew" | "catch" | "feature" | "general";
};

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    slug: "fish-guide-tip",
    name: "Fish Guide Tip",
    description: "One sharp, useful tip about catching a specific species. Pulls from a fish guide.",
    beats: [
      "Hook: the one thing most people get wrong about this fish",
      "The tip: bait / timing / location in one clear line",
      "Why it works, quick and plain",
      "CTA: full guide in the app",
    ],
    defaultHook: "If you're not catching {species}, it's probably this.",
    defaultCta: "Full {species} guide is free in ReelFishHelp.",
    suggestedHashtags: ["#fishing", "#fishingtips", "#fishguide"],
    brollTerms: ["species held closeup", "fish underwater", "angler casting", "water structure"],
    lengthHint: "15-30s",
    grounding: "species",
  },
  {
    slug: "gear-setup-breakdown",
    name: "Gear Setup Breakdown",
    description: "Walk through a complete rig for a situation, top to bottom.",
    beats: [
      "Hook: the exact setup for {situation}",
      "Rod and reel",
      "Main line and leader",
      "Hook / rig / bait",
      "CTA: build yours in the Setup Builder",
    ],
    defaultHook: "Here's the exact setup I'd run for {situation}.",
    defaultCta: "Score your own rig in ReelFishHelp's Setup Builder.",
    suggestedHashtags: ["#fishing", "#tackle", "#fishinggear"],
    brollTerms: ["rod and reel flatlay", "tying leader", "tackle tray", "casting from shore"],
    lengthHint: "30s",
    grounding: "setup",
  },
  {
    slug: "knot-tip",
    name: "Knot Tip",
    description: "Show one knot fast, plus the mistake that makes it fail.",
    beats: [
      "Hook: the knot you should actually know",
      "Tie it in a few quick steps",
      "The one mistake that costs you fish",
      "CTA: step by step in the app",
    ],
    defaultHook: "Still tying a {knot} wrong? Watch this.",
    defaultCta: "Step-by-step {knot} is in ReelFishHelp.",
    suggestedHashtags: ["#fishingknots", "#fishing", "#knottying"],
    brollTerms: ["tying knot closeup", "hands with line", "hook macro", "cinching knot"],
    lengthHint: "15-30s",
    grounding: "knot",
  },
  {
    slug: "whats-biting",
    name: "What's Biting This Week",
    description: "Quick regional roundup of what's active. Pulls from bite boards / season.",
    beats: [
      "Hook: what's biting in {region} right now",
      "2-3 species that are active",
      "Bait or method that's working",
      "CTA: check the bite board",
    ],
    defaultHook: "Here's what's biting in {region} this week.",
    defaultCta: "See live reports on the {region} bite board in ReelFishHelp.",
    suggestedHashtags: ["#fishingreport", "#whatsbiting", "#fishing"],
    brollTerms: ["marsh sunrise", "fish finder", "coastline aerial", "angler landing fish"],
    lengthHint: "30s",
    grounding: "board",
  },
  {
    slug: "crew-feature",
    name: "Crew Feature",
    description: "Spotlight a crew and invite people to join or start one.",
    beats: [
      "Hook: fishing's better with a crew",
      "Show a crew feed / leaderboard",
      "What a crew gets you",
      "CTA: start or join a crew",
    ],
    defaultHook: "Fishing alone? Your crew is one tap away.",
    defaultCta: "Start a crew free in ReelFishHelp.",
    suggestedHashtags: ["#fishingcrew", "#fishing", "#fishingcommunity"],
    brollTerms: ["friends fishing boat", "group pier", "boat launch", "high five fishing"],
    lengthHint: "15-30s",
    grounding: "crew",
  },
  {
    slug: "catch-of-the-day",
    name: "Catch of the Day",
    description: "Feature a standout community catch (opted-in only).",
    beats: [
      "Hook: catch of the day",
      "Show the fish and the stats",
      "One detail about how it was caught",
      "CTA: log yours / join",
    ],
    defaultHook: "Catch of the day on ReelFishHelp.",
    defaultCta: "Log your catch and you could be next.",
    suggestedHashtags: ["#catchoftheday", "#fishing", "#anglerlife"],
    brollTerms: ["angler holding big fish", "sunset catch", "fish on deck", "release splash"],
    lengthHint: "15s",
    grounding: "catch",
  },
  {
    slug: "app-feature-demo",
    name: "App Feature Demo",
    description: "Screen-record one feature and show why it's useful.",
    beats: [
      "Hook: the problem the feature solves",
      "Screen record the feature in use",
      "The payoff",
      "CTA: try it free",
    ],
    defaultHook: "This ReelFishHelp feature does the guesswork for you.",
    defaultCta: "It's free in ReelFishHelp.",
    suggestedHashtags: ["#fishing", "#fishingapp", "#fishingtips"],
    brollTerms: ["phone on boat", "screen recording overlay", "angler checking phone", "tackle flatlay"],
    lengthHint: "30s",
    grounding: "feature",
  },
  {
    slug: "beginner-help",
    name: "Beginner Fishing Help",
    description: "Answer a common beginner question simply and kindly.",
    beats: [
      "Hook: the beginner question",
      "The simple answer",
      "One thing to avoid",
      "CTA: more beginner help in the app",
    ],
    defaultHook: "New to fishing? Start here.",
    defaultCta: "Free beginner guides in ReelFishHelp.",
    suggestedHashtags: ["#learntofish", "#fishing", "#beginnerfishing"],
    brollTerms: ["kid fishing pier", "first fish caught", "simple spinning combo", "casting practice"],
    lengthHint: "15-30s",
    grounding: "general",
  },
  {
    slug: "spot-privacy-tip",
    name: "Spot Privacy Tip",
    description: "Explain how to share reports without giving up your spot.",
    beats: [
      "Hook: never post your exact spot",
      "How to share the bite, not the pin",
      "How ReelFishHelp rounds locations",
      "CTA: try the private-by-default logbook",
    ],
    defaultHook: "Stop giving away your fishing spots online.",
    defaultCta: "ReelFishHelp keeps your spots private by default.",
    suggestedHashtags: ["#fishing", "#fishingspots", "#fishingtips"],
    brollTerms: ["secluded cove", "map pin", "kayak backwater", "marsh sunrise"],
    lengthHint: "30s",
    grounding: "feature",
  },
  {
    slug: "setup-builder-demo",
    name: "Setup Builder Demo",
    description: "Show the Setup Builder scoring a rig against a target fish.",
    beats: [
      "Hook: is your rig strong enough for this fish?",
      "Build the setup on screen",
      "Show the match verdict",
      "CTA: score yours",
    ],
    defaultHook: "Will this setup land a {species}? Let's find out.",
    defaultCta: "Score your setup free in ReelFishHelp.",
    suggestedHashtags: ["#fishing", "#tackle", "#fishinggear"],
    brollTerms: ["rod bending fight", "spinning reel closeup", "leader knot", "phone setup builder"],
    lengthHint: "30s",
    grounding: "setup",
  },
];

export function templateBySlug(slug: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find((t) => t.slug === slug);
}
