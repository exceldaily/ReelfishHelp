import type { NewAnglerTip } from "@/db/schema";

/**
 * Starter Daily Angler Tips. Seeded additively (fixed slug = stable identity)
 * so admin edits are never clobbered; admins manage the live set at /admin/tips.
 * `icon` keys into the card's icon map (lightbulb fallback).
 */
export const starterTips: (NewAnglerTip & { slug: string })[] = [
  {
    slug: "rain-runoff-creek-mouths",
    title: "Fish the runoff after heavy rain",
    tipText:
      "Fishing after heavy rain? Focus on creek mouths and runoff areas where moving water carries food into the main body. Predators stage on the edge of the stained water and ambush whatever washes past.",
    category: "Bass",
    icon: "waves",
    displayOrder: 1,
  },
  {
    slug: "match-the-hatch-size-first",
    title: "Match size before color",
    tipText:
      "When fish are keyed on bait, matching the SIZE of what they're eating matters more than nailing the color. If they're on 3-inch glass minnows, a 6-inch lure gets ignored no matter how pretty it is.",
    category: "Lures",
    icon: "fish",
    displayOrder: 2,
  },
  {
    slug: "wet-hands-before-release",
    title: "Wet your hands before touching a fish",
    tipText:
      "Dry hands strip the protective slime coat that keeps fish healthy. Wet your hands before handling any fish you plan to release, keep it horizontal, and get it back in the water fast.",
    category: "Catch Handling",
    icon: "lifebuoy",
    displayOrder: 3,
  },
  {
    slug: "retie-after-every-big-fish",
    title: "Retie after every good fish",
    tipText:
      "The last foot of line takes the abuse: teeth, rocks, shells, and the fight itself. After landing a good fish, run your fingers down the leader and retie if you feel any roughness. Knots are cheap, trophies are not.",
    category: "Knots",
    icon: "anchor",
    displayOrder: 4,
  },
  {
    slug: "falling-tide-drains",
    title: "Falling tide? Watch the drains",
    tipText:
      "On a falling tide, bait gets flushed out of marshes and creeks through narrow drains. Redfish, trout, and snook line up at those exits like it's a buffet. Find the drain, cast up-current, and let the tide do the work.",
    category: "Inshore",
    icon: "waves",
    displayOrder: 5,
  },
  {
    slug: "sun-in-your-face",
    title: "Keep the sun in your face when sight fishing",
    tipText:
      "Approach flats and shorelines with the sun in your face when possible. Your shadow and glare-line stay behind you, letting you see fish before they see you. Polarized glasses do the rest.",
    category: "Saltwater",
    icon: "compass",
    displayOrder: 6,
  },
  {
    slug: "storm-front-bite-window",
    title: "The pre-front bite is real",
    tipText:
      "Falling barometric pressure right before a storm front often triggers a feeding window. If it's safe to be out, the last few hours before a front arrives can be the best bite of the week. After it passes, expect a slowdown for a day or two.",
    category: "Weather",
    icon: "wind",
    displayOrder: 7,
  },
  {
    slug: "kayak-drift-sock",
    title: "A drift sock makes windy kayak days fishable",
    tipText:
      "Wind pushing your kayak too fast to fish? A small drift sock (or even a five-gallon bucket on a rope) slows your drift to a crawl, letting you work an area thoroughly instead of blowing across it.",
    category: "Kayak Fishing",
    icon: "ship",
    displayOrder: 8,
  },
  {
    slug: "circle-hooks-set-themselves",
    title: "Don't set the hook on circle hooks",
    tipText:
      "Circle hooks are designed to slide to the corner of the mouth as the fish swims away. Yanking rips the hook free. When you get a bite, just reel tight and lift, the hook sets itself, and the fish is almost always lip-hooked for an easy release.",
    category: "Bait",
    icon: "anchor",
    displayOrder: 9,
  },
  {
    slug: "first-cast-counts",
    title: "Make the first cast count",
    tipText:
      "The biggest fish on a spot usually eats on the first good presentation, before anything has been spooked. Take a breath, check your lure, and place the first cast where you'd bet money, not just to warm up.",
    category: "Beginner",
    icon: "lightbulb",
    displayOrder: 10,
  },
  {
    slug: "drag-check-before-trip",
    title: "Check your drag before you leave the ramp",
    tipText:
      "Pull line off every reel by hand before the first cast of the day. A drag that's too tight breaks off the fish of the trip; too loose and you can't turn it. Set it around a third of your line's breaking strength and you're in the zone.",
    category: "Gear",
    icon: "lightbulb",
    displayOrder: 11,
  },
  {
    slug: "birds-mean-bait",
    title: "Follow the birds to the bait",
    tipText:
      "Diving pelicans and hovering terns mean bait near the surface, and bait means predators. Never drive past working birds without a cast. On slow days, glassing the horizon for bird activity beats blind casting all day.",
    category: "Offshore",
    icon: "compass",
    displayOrder: 12,
  },
  {
    slug: "shore-anglers-fish-close-first",
    title: "Fish close before you cast far",
    tipText:
      "Bank anglers wade in and bomb casts to the horizon, spooking every fish at their feet. The drop-off, laydown, or rocks within twenty feet of shore often hold the best fish. Work close water first, then extend.",
    category: "Shore Fishing",
    icon: "fish",
    displayOrder: 13,
  },
  {
    slug: "leader-in-clear-water",
    title: "Clear water calls for longer, lighter leaders",
    tipText:
      "When the water goes gin-clear, downsize your leader and add length. Dropping from 20 lb to 15 lb fluoro and adding a foot often doubles your bites on pressured fish. Check it for nicks more often, though.",
    category: "Freshwater",
    icon: "waves",
    displayOrder: 14,
  },
  {
    slug: "file-a-float-plan",
    title: "Tell someone where you're launching",
    tipText:
      "Before any solo trip, text someone your launch spot and expected return time. Phones die, motors quit, and tides strand people every week. Thirty seconds of caution turns a bad day into a story instead of a search.",
    category: "Safety",
    icon: "lifebuoy",
    displayOrder: 15,
  },
  {
    slug: "revive-fish-facing-current",
    title: "Revive tired fish facing into the current",
    tipText:
      "A fish exhausted from a long fight needs water over its gills. Hold it upright facing INTO the current (or move it gently forward in still water) until it kicks away on its own. If it can't stay upright, it's not ready.",
    category: "Conservation",
    icon: "lifebuoy",
    displayOrder: 16,
  },
  {
    slug: "fly-line-management",
    title: "Strip line onto something clean",
    tipText:
      "Half of fly fishing's 'bad casts' are actually line tangled on rocks, grass, or your own feet. Clear a stripping area, use a basket in the surf, and your next cast is always ready to go.",
    category: "Fly Fishing",
    icon: "wind",
    displayOrder: 17,
  },
  {
    slug: "idle-speed-over-structure",
    title: "Idle over structure before you fish it",
    tipText:
      "Before anchoring on a reef, wreck, or brush pile, make one slow pass with your electronics to see which side holds bait and fish. Thirty seconds of scouting beats an hour anchored on the dead corner.",
    category: "Boat Fishing",
    icon: "ship",
    displayOrder: 18,
  },
];
