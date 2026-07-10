/**
 * Curated, version-controlled data for the App Demo Video Planner and the
 * Screen Recording Checklist. Every feature maps to a real ReelFishHelp route
 * so the shot list matches what the admin will actually record on screen.
 *
 * These are deterministic (no AI needed) so the planner works even before an
 * ANTHROPIC_API_KEY is added.
 */

export type AppFeature = {
  key: string;
  name: string;
  path: string;
  blurb: string;
  /** why an angler cares — used as talking points / voiceover beats */
  talkingPoints: string[];
  /** literal on-screen actions to record, in order */
  screenSteps: string[];
  /** stock-footage search terms that pair well with this feature */
  brollTerms: string[];
  suggestedHashtags: string[];
};

export const APP_FEATURES: AppFeature[] = [
  {
    key: "setup-builder",
    name: "Setup Builder",
    path: "/gear/builder",
    blurb: "Match your rod, reel, line, and leader to the fish you're chasing and get an instant verdict.",
    talkingPoints: [
      "Stop guessing whether your rig can handle the fish",
      "Pick your rod, reel, line, and leader and it scores the match",
      "Tells you which species you're set up for and which will break you off",
      "Great for new anglers who don't know where to start",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Gear, then Setup Builder",
      "Choose Build From Scratch (or Help Me Build)",
      "Select a rod power and action",
      "Select reel size and line",
      "Add a leader",
      "Show the fish match results scrolling through best / okay / too light",
      "Tap Save to My Gear",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["spinning reel closeup", "fishing rod bending fight", "tackle setup flatlay", "tying leader knot"],
    suggestedHashtags: ["#fishing", "#fishingtips", "#tackle", "#fishinggear", "#anglerlife"],
  },
  {
    key: "gear",
    name: "Gear Education",
    path: "/gear",
    blurb: "Plain-English guides to rods, reels, line, leaders, terminal tackle, and setups.",
    talkingPoints: [
      "Everything about rods, reels, line, and leaders in one place",
      "No jargon, just what to use and when",
      "Compare line types side by side",
      "Built for anglers who want to actually understand their gear",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Gear",
      "Scroll the education areas (Rods, Reels, Line, Leaders, Terminal, Setups)",
      "Open Fishing Line and show the comparison table",
      "Open a rod type article",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["fishing rods rack store", "fishing line spool closeup", "reel gears macro", "tackle shop shelves"],
    suggestedHashtags: ["#fishing", "#fishinggear", "#fishingtips", "#learntofish"],
  },
  {
    key: "knots",
    name: "Knot Tying",
    path: "/gear/knots",
    blurb: "Step-by-step knots grouped by what you're tying, with video links.",
    talkingPoints: [
      "The knots that actually matter, grouped by the job",
      "Line to hook, braid to leader, loop knots, all here",
      "Step by step so you can follow along on the water",
      "Stop losing fish to a bad knot",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Gear, then Knots",
      "Pick a situation (line to hook / braid to leader)",
      "Open a knot and scroll the numbered steps",
      "Show the common mistakes section",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["tying fishing knot closeup", "hands tying line", "fishing hook macro", "braided line closeup"],
    suggestedHashtags: ["#fishingknots", "#fishing", "#fishingtips", "#knottying"],
  },
  {
    key: "fish-guides",
    name: "Fish Guides",
    path: "/fish",
    blurb: "Deep species guides: where they live, what they eat, how to catch and handle them.",
    talkingPoints: [
      "Detailed guide for every species you're targeting",
      "Best baits, timing, habitat, and handling",
      "Know the fish before you go",
      "Regulations and safe-handling notes built in",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Find Fish",
      "Filter by your water and state",
      "Open a species guide",
      "Scroll the quick plan, gear, and timing sections",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["redfish caught inshore", "largemouth bass held", "fish underwater", "angler releasing fish"],
    suggestedHashtags: ["#fishing", "#fishguide", "#saltwaterfishing", "#freshwaterfishing"],
  },
  {
    key: "crews",
    name: "Crews",
    path: "/crews",
    blurb: "Open or private angler groups with a shared feed and leaderboards.",
    talkingPoints: [
      "Start a crew with your fishing buddies",
      "Share catches in a private feed",
      "Open crews to meet anglers near you",
      "Leaderboards for most fish and biggest catch",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Crews",
      "Browse open crews or create one",
      "Open a crew and show the feed",
      "Post a catch to the crew",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["group of anglers boat", "friends fishing pier", "fist bump fishing", "boat launch morning"],
    suggestedHashtags: ["#fishing", "#fishingcrew", "#anglerlife", "#fishingcommunity"],
  },
  {
    key: "boards",
    name: "Bite Boards",
    path: "/boards",
    blurb: "Regional boards where anglers post what's biting, without giving up their spots.",
    talkingPoints: [
      "See what's biting in your area right now",
      "Reports are tied to broad areas, never exact spots",
      "Post your own bite report in seconds",
      "Dial in the bite before you drive out",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Bite Boards",
      "Open your state or regional board",
      "Scroll recent bite reports",
      "Tap New Report and fill species / bait / outcome",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["map coastline", "fish finder screen", "marsh sunrise fishing", "phone weather on boat"],
    suggestedHashtags: ["#fishingreport", "#fishing", "#whatsbiting", "#fishingtips"],
  },
  {
    key: "catch-log",
    name: "Catch Logging",
    path: "/catches",
    blurb: "Log every catch with photo, species, size, bait, and conditions.",
    talkingPoints: [
      "Build a real logbook of every fish you catch",
      "Photo, species, size, bait, and conditions in one tap",
      "Spot your patterns over time",
      "Your locations stay private by default",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap My Catches, then Log a Catch",
      "Add a photo",
      "Pick the species and enter size",
      "Add bait and conditions",
      "Set visibility and save",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["angler photographing fish", "fish on measuring board", "phone logging on dock", "sunset catch photo"],
    suggestedHashtags: ["#fishing", "#catchlog", "#fishingjournal", "#anglerlife"],
  },
  {
    key: "conditions",
    name: "Weather & Conditions",
    path: "/conditions",
    blurb: "Weather, tides, moon, and a fishing-score for your area.",
    talkingPoints: [
      "Weather, tide, and moon in one screen",
      "A simple bite score for your area",
      "Know if today is worth the trip",
      "Plan around the best windows",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Conditions",
      "Show today's weather and fishing score",
      "Scroll the tide chart",
      "Show the moon phase and best windows",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["tide coming in", "storm clouds over water", "full moon over ocean", "calm water sunrise"],
    suggestedHashtags: ["#fishing", "#tides", "#fishingweather", "#fishingtips"],
  },
  {
    key: "spot-privacy",
    name: "Spot Privacy",
    path: "/spots",
    blurb: "Save spots with real coordinates that never leave your account.",
    talkingPoints: [
      "Your honey holes stay yours",
      "Save exact coordinates that never get shared",
      "Locations are rounded before they ever touch a public feed",
      "Share a broad area only if you choose to",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Saved Spots",
      "Add a spot and show the privacy selector",
      "Show private-exact vs shared-broad-area options",
      "Open a saved spot's notes",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["secluded fishing cove", "kayak hidden creek", "map pin drop", "marsh backwater"],
    suggestedHashtags: ["#fishing", "#fishingspots", "#privacy", "#fishingtips"],
  },
  {
    key: "fish-id",
    name: "Fish Identification",
    path: "/identify",
    blurb: "Snap a photo and get an instant species ID with handling notes.",
    talkingPoints: [
      "Not sure what you caught? Snap a photo",
      "Instant species ID with confidence and look-alikes",
      "Handling and regulation notes right away",
      "Great for kids and new anglers",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Identify",
      "Take or upload a fish photo",
      "Show the identification result and confidence",
      "Show the look-alikes and handling note",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["holding up fish to camera", "unknown fish closeup", "phone photographing catch", "fish on deck"],
    suggestedHashtags: ["#fishing", "#fishid", "#whatfishisthis", "#fishingtips"],
  },
  {
    key: "my-gear",
    name: "My Gear Locker",
    path: "/my-gear",
    blurb: "Track your rods, reels, and tackle, plus a wishlist.",
    talkingPoints: [
      "Keep your whole tackle collection organized",
      "Track rods, reels, line, and lures",
      "Mark favorites and build a wishlist",
      "Know exactly what's in the truck",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap My Gear",
      "Add a rod with brand and model",
      "Mark it a favorite",
      "Add a wishlist item",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["rod rack garage", "tackle box open", "reels on shelf", "lures organized tray"],
    suggestedHashtags: ["#fishing", "#tackle", "#fishinggear", "#gearlocker"],
  },
  {
    key: "trip-planner",
    name: "Trip Planner",
    path: "/trips",
    blurb: "Plan a trip with target species, gear checklist, and the forecast.",
    talkingPoints: [
      "Plan the whole trip in one place",
      "Set target species and a gear checklist",
      "Pull the forecast for your date",
      "Show up ready instead of scrambling",
    ],
    screenSteps: [
      "Open ReelFishHelp",
      "Tap Trips, then New Trip",
      "Set a date and location",
      "Add target species",
      "Check off the gear and bait checklist",
      "Show the trip forecast",
      "End on the ReelFishHelp logo",
    ],
    brollTerms: ["loading truck fishing gear", "boat trailer morning", "checklist notepad", "sunrise drive to water"],
    suggestedHashtags: ["#fishing", "#fishingtrip", "#tripplanning", "#anglerlife"],
  },
];

export function featureByKey(key: string): AppFeature | undefined {
  return APP_FEATURES.find((f) => f.key === key);
}
