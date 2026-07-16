import type { SpeciesSeed } from "./index";

/**
 * July 2026 additions: Greater Amberjack, Black Sea Bass, Bowfin.
 * First fills from the "missing popular species" review — the reef donkey,
 * the Northeast party-boat staple, and the backwater living fossil.
 */
export const speciesAdditions1: SpeciesSeed[] = [
  {
    id: "greater-amberjack",
    slug: "greater-amberjack",
    commonName: "Greater Amberjack",
    scientificName: "Seriola dumerili",
    water: "saltwater",
    category: "Jack",
    difficulty: 4,
    beginnerFriendly: false,
    wikiTitle: "Greater amberjack",
    description:
      "The reef donkey. Amberjack are brutally strong wreck and reef fish that hit a live bait like a truck and immediately try to drag you back into the structure. Landing a big one is a tug-of-war you win in the first twenty seconds or not at all.",
    avgSize: "15–40 lb",
    trophySize: "60+ lb, with 100 lb class fish on deep wrecks",
    regions: ["Gulf Coast", "Florida", "Southeast", "Atlantic Coast"],
    states: ["TX", "LA", "MS", "AL", "FL", "GA", "SC", "NC"],
    environments: ["reef", "wreck", "offshore", "nearshore"],
    styles: ["boat"],
    seasons: ["spring", "summer", "fall"],
    baitTypes: ["live baitfish", "vertical jigs", "cut bait"],
    lookalikes: [
      { name: "Lesser amberjack", howToTell: "Much smaller adult size and a proportionally larger eye; the dark band through the eye is steeper." },
      { name: "Almaco jack", howToTell: "Deeper body with a taller, sickle-shaped front dorsal fin." },
      { name: "Banded rudderfish", howToTell: "Juveniles show bold vertical bands; adults are smaller and slimmer than greater amberjack." },
    ],
    guide: {
      summary:
        "Greater amberjack stack up on deep wrecks, reefs, and oil rigs from 60 to 300 feet. They eat live baits and big vertical jigs with zero subtlety, then punish anything undersized. This is heavy-tackle, high-drag fishing where the fight is decided at the boat side of the first run. Seasons are short and tightly managed, so check the current federal dates before you burn fuel.",
      identification: {
        characteristics: [
          "Long, powerful torpedo body in bronze to bluish gray with a lighter belly",
          "Dark 'war paint' band running diagonally from the nose up through the eye",
          "Amber-gold stripe along the flank, brightest when the fish is lit up",
          "Deeply forked tail built for sustained pulling power",
        ],
      },
      quickPlan: {
        bestBaitNow: "Frisky live blue runner or hardtail bridled on a circle hook",
        lureType: "Vertical speed jig, 200–400 g",
        setup: "Heavy jigging or live-bait conventional outfit, 80 lb braid, 100 lb fluoro leader, locked-down drag",
        locationType: "Deep wreck, reef ledge, or oil rig in 60–300 ft",
        bestTime: "Mid-morning through afternoon once the sun gets the bait schools tight to structure",
        seasonalNote: "Federal Gulf and South Atlantic seasons open and close abruptly; verify dates before every trip.",
      },
      gear: {
        rod: "5'6\"–6'6\" heavy jigging or live-bait rod with serious lifting power",
        reel: "High-capacity conventional or 8000–14000 spinning, 30+ lb of smooth drag",
        mainLine: "65–100 lb braid",
        leader: "80–100 lb fluorocarbon, 4–6 ft",
        hooks: "7/0–9/0 heavy-wire circle hooks for live bait",
        terminal: "Wind-on or heavy swivel connections; three-way or knocker rig for deep live-baiting",
        lureSizes: "200–400 g speed jigs and knife jigs, heavier as depth and current increase",
        lureColors: "Silver, blue-silver, pink, and glow for deep water",
        baits: ["Blue runner (hardtail)", "Pinfish", "Cigar minnow", "Threadfin herring", "Large live shrimp for smaller AJs"],
        setups: {
          beginner:
            "Book a bottom-fishing charter and ask to drop a live hardtail on a wreck. Their tackle is already right, and you'll learn what 'reef donkey' means safely.",
          budget:
            "One heavy conventional combo, 80 lb braid, a spool of 100 lb fluoro, a pack of 8/0 circles, and a couple of 300 g jigs cover the whole program.",
          serious:
            "Dedicated jigging outfit plus a live-bait outfit, sonar time to find low-pressure wrecks, a tuned drag you trust at 25+ lb, and a descending device rigged before the first drop.",
        },
      },
      techniques: {
        presentation:
          "Drop a bridled live bait to just above the structure and wind up five to ten cranks. For jigs, freefall to the bottom third of the water column and speed-jig up with long rips.",
        retrieve:
          "Jigging is violent and rhythmic: rip, wind, rip, wind. Strikes come mid-rip. With live bait, the rod loading up IS the hookset with circles; just wind tight and hold on.",
        positioning:
          "Position up-current of the wreck so the fight starts with the fish pulled away from the snags. Many crews motor slowly off structure the moment one hooks up.",
        depth: "60–300 ft, tightest to structure in the bottom third",
        structure: "Wrecks, large reef ledges, oil rigs, and towers; the biggest fish own the tallest structure",
        current: "A moving current tide positions the school on the up-current side of structure; slack current scatters them.",
        byStyle: {
          boat: "This is boat fishing, period. Anchor or spot-lock up-current of the wreck, send baits down staggered depths, and clear other lines the second one connects.",
        },
      },
      timing: {
        seasons:
          "Open federal seasons cluster in late spring through fall depending on region and quota; fish are on the wrecks year-round.",
        timeOfDay: "Daytime fishery; late morning through afternoon is prime once bait schools consolidate.",
        weather: "Stable weather with workable seas — this is a run-offshore trip, so weather windows rule.",
        wind: "Under 15 kt makes deep vertical presentations manageable; more than that and staying on the spot gets ugly.",
        waterTemp: "68–82°F prime; they slide deeper when surface temps spike.",
        movement: "Bigger fish move deeper with age; expect quality to improve past 150 ft.",
      },
      habitat: {
        overview:
          "Structure-obsessed. If a wreck, spring, ledge, or rig rises off the bottom anywhere from 60 to 300 feet, amberjack are the bullies living on top of it.",
        depthRange: "60–300 ft",
        structures: ["Wrecks", "Reef ledges", "Oil rigs and towers", "Artificial reefs", "Deep springs"],
        lookFor: "Big arches suspended over the highest part of structure on sonar; bait balls dimpling above a wreck.",
        migration: "Largely resident on structure; some seasonal inshore-offshore depth shifts with water temperature.",
      },
      mistakes: [
        "Fishing drag too loose — an AJ reaches the wreck in seconds and the fight is over",
        "Dropping baits straight over the structure instead of starting up-current",
        "Bringing bass-strength tackle to a 60 lb tug-of-war",
        "Ignoring the short federal seasons and size limits",
        "No descending device — deep-caught fish need help getting back down",
      ],
      handling: {
        landing: "Gaff only legal keepers you intend to harvest; otherwise leader the fish boat-side and use a heavy lip grip with the fish supported horizontally.",
        handling: "Support the body with both hands or keep the fish in the water; a 40 lb fish thrashing on deck hurts everyone involved.",
        release: "Use a descending device or venting tool for fish from deep water — barotrauma is the norm past 100 ft.",
        regulations: "Tightly managed with short federal seasons, size limits, and bag limits that differ between Gulf and Atlantic. Check current NOAA and state rules before every trip.",
      },
    },
  },
  {
    id: "black-sea-bass",
    slug: "black-sea-bass",
    commonName: "Black Sea Bass",
    scientificName: "Centropristis striata",
    water: "saltwater",
    category: "Sea Bass",
    difficulty: 1,
    beginnerFriendly: true,
    wikiTitle: "Black sea bass",
    description:
      "The Northeast and Mid-Atlantic party-boat favorite. Black sea bass are aggressive, abundant around structure, gorgeous up close, and one of the best-eating fish in the ocean. A kid with a squid strip can catch them, and a big 'knothead' male still gets a serious angler's heart going.",
    avgSize: "1–3 lb",
    trophySize: "5–8 lb knothead males",
    regions: ["Northeast", "Atlantic Coast", "Southeast"],
    states: ["ME", "NH", "MA", "RI", "CT", "NY", "NJ", "DE", "MD", "VA", "NC", "SC", "GA", "FL"],
    environments: ["reef", "wreck", "nearshore", "jetty", "pier", "offshore"],
    styles: ["boat", "pier"],
    seasons: ["spring", "summer", "fall"],
    baitTypes: ["squid", "clams", "cut bait", "jigs"],
    lookalikes: [
      { name: "Tautog (blackfish)", howToTell: "Tautog have a blunter head, rubbery lips, and lack the sea bass's long dorsal filaments and blue highlights." },
      { name: "Juvenile gag grouper", howToTell: "Gags show a boxier grouper profile and marbled sides; sea bass look scaled in black-and-silver mesh." },
    ],
    guide: {
      summary:
        "Find hard structure in 30 to 120 feet — wrecks, rockpiles, reefs, even mussel beds — and black sea bass are almost guaranteed. A two-hook rig with squid gets constant action, while dropping bucktails or small jigs upgrades your average size. Seasons and size limits change by state and year, so a quick regs check is part of the trip.",
      identification: {
        characteristics: [
          "Smoky black to slate body with a silvery mesh pattern from light scale centers",
          "Electric blue highlights on the head and fins, strongest on big males",
          "Long filament trailing off the tail and dorsal on adults",
          "Large males grow a blue-tinted hump on the nape (the 'knothead')",
        ],
      },
      quickPlan: {
        bestBaitNow: "Fresh squid strip on a hi-lo rig",
        lureType: "Bucktail or diamond jig, 1–4 oz, tipped with squid",
        setup: "Medium 3000–4000 spinning or light conventional, 20 lb braid, 25 lb leader, hi-lo rig with a bank sinker",
        locationType: "Wreck, reef, rockpile, or any hard bottom in 30–120 ft",
        bestTime: "Whenever the current is moving enough to hold your rig near structure",
        seasonalNote: "They slide inshore and shallow in late spring, hold all summer, and move deep offshore for winter.",
      },
      gear: {
        rod: "6'–7' medium spinning or conventional boat rod with a sensitive tip",
        reel: "3000–4000 spinning or a small conventional",
        mainLine: "15–20 lb braid for feel in deep water",
        leader: "20–30 lb mono or fluorocarbon",
        hooks: "2/0–3/0 baitholder or octopus on a hi-lo rig",
        terminal: "Hi-lo (double-dropper) rig with a 3–8 oz bank sinker to match current",
        lureSizes: "1–4 oz bucktails and diamond jigs; small slow-pitch jigs shine",
        lureColors: "White, chartreuse, pink, and glow all produce",
        baits: ["Squid strips", "Fresh clams", "Cut fish", "Gulp swimming mullet on a jig"],
        setups: {
          beginner:
            "Hop on a party boat with a hi-lo rig and a box of squid. Drop to bottom, crank up two turns, and you will catch sea bass.",
          budget:
            "One medium spinning combo, a pack of pre-tied hi-lo rigs, bank sinkers in three sizes, and a bag of squid covers a whole season.",
          serious:
            "Jig with slow-pitch or bucktail outfits to cull bigger fish, run your own numbers on low-pressure hard bottom, and time trips to the first weeks of an opener.",
        },
      },
      techniques: {
        presentation:
          "Straight vertical: drop to the bottom, reel up one or two cranks, and hold near-vertical as the boat drifts. Bites are immediate where they live.",
        retrieve:
          "Bait fishing needs no retrieve — lift-and-hold. With jigs, use short hops and lifts just off bottom; bigger fish usually eat on the drop.",
        positioning:
          "Stay on top of structure. A GPS spot-lock or a well-set anchor keeps rigs in the zone; drifting works when fish are spread across a reef field.",
        depth: "30–120 ft most of the season; deeper in winter",
        structure: "Wrecks, rockpiles, reefs, mussel beds, bridge rubble — any hard bottom",
        current: "Moderate current concentrates fish on the up-current edge of structure; dead-slack often slows the bite.",
        byStyle: {
          boat: "Anchor or spot-lock over structure and fish vertically; move if you're not bit in ten minutes.",
          pier: "Deeper piers and jetties near inlets hold sea bass around the pilings and rocks; fish tight to structure.",
        },
      },
      timing: {
        seasons: "Late spring through fall inshore; the winter fishery is a deep offshore wreck game.",
        timeOfDay: "All day — current phase matters more than the clock.",
        weather: "Any fishable day; light chop beats flat calm.",
        wind: "Whatever lets you hold the spot; heavy wind ruins vertical presentations.",
        waterTemp: "55–72°F prime inshore window.",
        movement: "Inshore-offshore seasonal movement driven by temperature; big males claim the best structure first.",
      },
      habitat: {
        overview:
          "Hard structure is everything. Sand flats hold nothing; the moment bottom turns to rock, rubble, or wreck, sea bass appear.",
        depthRange: "20–120 ft in season; to 400 ft in winter offshore",
        structures: ["Wrecks", "Rockpiles", "Natural reef", "Mussel beds", "Jetty rock", "Artificial reefs"],
        lookFor: "Hard-bottom marks with bait; clusters of small arches tight to the structure on sonar.",
        migration: "Clear seasonal inshore (spring) and offshore (late fall) migrations along the Mid-Atlantic and Northeast coast.",
      },
      mistakes: [
        "Fishing sand instead of structure — fifty feet off the rockpile might as well be a desert",
        "Oversized hooks that small baits can't present naturally",
        "Ignoring current and using a sinker too light to stay vertical",
        "Skipping the regs check — size and bag limits change by state and year",
        "Grabbing the fish carelessly: those dorsal spines are sharp",
      ],
      handling: {
        landing: "Swing smaller fish or use a net for knotheads; they come up docile compared to what they'll do to your thumb via dorsal spines.",
        handling: "Lip-grip or hold flat-handed while avoiding the dorsal spines and gill spurs.",
        release: "Fish from deeper water may need a descending device; in under 60 ft they release well.",
        regulations: "Federal and state seasons, size limits (commonly 12.5–16.5\" depending on state), and bag limits are strict and change annually. Check your state's current rules.",
      },
    },
  },
  {
    id: "bowfin",
    slug: "bowfin",
    commonName: "Bowfin",
    scientificName: "Amia calva",
    water: "freshwater",
    category: "Bowfin",
    difficulty: 2,
    beginnerFriendly: true,
    wikiTitle: "Bowfin",
    description:
      "A living fossil with an attitude problem. Bowfin have been ambushing prey in North American backwaters for 150 million years, breathe air when the water goes stale, and fight like they resent you personally. Long dismissed as a 'trash fish,' they've earned a serious cult following among anglers who like violence on the end of the line.",
    avgSize: "2–5 lb",
    trophySize: "8+ lb; double digits are giants",
    regions: ["Southeast", "Florida", "Midwest", "Northeast", "South Central"],
    states: [],
    environments: ["lake", "pond", "river", "creek", "canal", "marsh"],
    styles: ["shore", "kayak", "boat"],
    seasons: ["spring", "summer", "fall"],
    baitTypes: ["cut bait", "live minnows", "nightcrawlers", "soft plastics"],
    lookalikes: [
      { name: "Northern snakehead", howToTell: "The give-away is the anal fin: long on a snakehead, short on a bowfin. Bowfin also have a bony gular plate under the jaw, and males wear an orange-ringed eyespot at the tail." },
      { name: "Burbot", howToTell: "Burbot have a single chin barbel and two dorsal fins; bowfin have one long continuous dorsal and no barbel." },
    ],
    guide: {
      summary:
        "Bowfin own the water everyone else skips: warm, weedy, half-stagnant backwaters, oxbows, and canals. They ambush anything that moves, hit like a snake strike, and go absolutely feral at the boat. Heavy leader, strong hooks, and long pliers are not optional. Native fish, by the way — not an invasive — and an increasingly respected sportfish.",
      identification: {
        characteristics: [
          "Long, cylindrical olive-bronze body with soft camo mottling",
          "Single dorsal fin running more than half the body length",
          "Bony armored head with a mouth full of small sharp teeth",
          "Males show a black eyespot ringed in orange at the tail base",
        ],
      },
      quickPlan: {
        bestBaitNow: "Fresh cut bait or a lively minnow under a float near weed edges",
        lureType: "Dark creature bait, swimbait, or chatterbait worked slow",
        setup: "Medium-heavy 3000–4000 spinning, 30–50 lb braid, 40–50 lb mono leader",
        locationType: "Weedy backwater, oxbow, canal, or marsh edge with soft bottom",
        bestTime: "Warm afternoons; watch for fish rolling and gulping air",
        seasonalNote: "Late spring and summer in the shallows is prime; males guard fry in spring and defend against anything nearby.",
      },
      gear: {
        rod: "7' medium-heavy fast-action spinning or casting rod",
        reel: "3000–4000 spinning or a sturdy baitcaster",
        mainLine: "30–50 lb braid",
        leader: "40–50 lb mono or fluorocarbon — teeth plus a death-roll shred light leaders",
        hooks: "2/0–4/0 strong-wire; they crush hooks that big bass gear tolerates",
        terminal: "Simple float rig or bottom rig for bait; single strong hooks beat trebles for release",
        lureSizes: "3–5\" soft plastics and bladed jigs",
        lureColors: "Black, junebug, dark green pumpkin — dark profiles in stained water",
        baits: ["Fresh cut shad or sucker", "Live minnows", "Nightcrawler gobs", "Crawfish"],
        setups: {
          beginner:
            "A catfish-style rig works perfectly: medium-heavy rod, 40 lb leader, a strong 3/0 hook, and fresh cut bait near a weed edge. Then hold on.",
          budget:
            "Your bass combo already works if you add a spool of 40 lb mono for leaders and a pack of strong hooks. Long pliers are the only mandatory purchase.",
          serious:
            "Sight-fish them: polarized glasses, a kayak pushed into the backwaters nobody fishes, dark creature baits pitched at rolling fish, and a lip grip you trust.",
        },
      },
      techniques: {
        presentation:
          "Slow everything down. Drag or hop dark plastics along the bottom near cover, or soak cut bait where you've seen fish roll. Strikes are sudden and vicious.",
        retrieve:
          "Painfully slow with pauses for lures. When a fish eats bait, give it a beat to get the hook in its mouth, then set hard — their mouths are bone.",
        positioning:
          "Work the edges: weedline seams, laydowns, canal intersections, and the backs of sloughs. Casting to rolling fish is the closest freshwater gets to sight-casting redfish.",
        depth: "1–8 ft; they live shallow",
        structure: "Vegetation edges, laydowns, undercut banks, canal culverts, backwater sloughs",
        byStyle: {
          shore: "Canal banks and marsh edges are perfect bowfin water — fish cut bait tight to cover and keep your drag set.",
          kayak: "The kayak advantage is real: slide into stagnant backwaters big boats can't reach and sight-fish rollers.",
          boat: "Idle the backwaters and oxbows off the main river; fish the thickest cover the trolling motor tolerates.",
        },
      },
      timing: {
        seasons: "Late spring through early fall; peak aggression in the heat of summer when other fish sulk.",
        timeOfDay: "Midday warmth is genuinely good — the opposite of most freshwater fishing.",
        weather: "Warm and stable; post-rain stained water doesn't bother them at all.",
        wind: "Calm days make spotting rolling fish far easier.",
        waterTemp: "70–88°F prime; they thrive in warm low-oxygen water that pushes other predators out.",
        movement: "Resident in their backwaters year-round; deeper holes in winter, shallow cover the rest of the year.",
      },
      habitat: {
        overview:
          "Swamps, oxbows, sloughs, canals, and weedy lake margins — warm, slow, dark water with heavy cover. Their air-breathing swim bladder lets them own water too stagnant for the competition.",
        depthRange: "1–8 ft typical",
        structures: ["Weed beds", "Laydowns and timber", "Undercut banks", "Canal systems", "Marsh drains"],
        lookFor: "Fish rolling or gulping air on warm afternoons; V-wakes pushing through shallow cover.",
        migration: "None to speak of — find good backwater and the fish live there.",
      },
      mistakes: [
        "Light bass leaders — teeth plus the death-roll equal instant break-offs",
        "Soft hooksets: their mouths are armor, so set like you mean it",
        "Grabbing one like a bass — use a lip grip and long pliers",
        "Writing them off as a trash fish; they're a native predator and a blast on proper tackle",
        "Fishing fast; bowfin water rewards slow, deliberate presentations",
      ],
      handling: {
        landing: "Net or firm lip grip. Expect thrashing and a signature alligator death-roll at the bank.",
        handling: "They're slimy, muscular, and toothy — lip grip, long pliers for hook removal, and keep fingers clear of the mouth.",
        release: "Extremely hardy thanks to air breathing, but still support the fish and release promptly. Never kill them as 'trash' — they're native and ecologically important.",
        regulations: "Lightly regulated in most states, but a few have limits. Don't confuse them with invasive snakeheads: bowfin are protected natives in some waters.",
      },
    },
  },
];
