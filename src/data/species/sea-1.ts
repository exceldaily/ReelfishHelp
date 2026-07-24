import type { SpeciesSeed } from "./index";

/**
 * Phase 1 Southeast Asia catalog. Every entry is region "sea" so it only shows
 * for users on the SEA version of the app. US sub-region fields (regions/states)
 * stay empty — they're a US concept. Guides are metric-minded in spirit; the app
 * formats stored imperial values into cm/kg for SEA viewers.
 *
 * Images resolve at runtime from wikiTitle (Wikipedia lead image) until curated
 * license-safe photos are added, same as the earliest US species did.
 */
export const seaSpecies1: SpeciesSeed[] = [
  {
    id: "barramundi",
    slug: "barramundi",
    commonName: "Barramundi",
    scientificName: "Lates calcarifer",
    water: "both",
    category: "Barramundi",
    difficulty: 3,
    beginnerFriendly: true,
    region: "sea",
    wikiTitle: "Barramundi",
    description:
      "The icon of Southeast Asian sport fishing. Barramundi (siakap, ikan kakap putih) move between rivers, estuaries, and the coast, ambush prey around structure, and fight with gill-rattling jumps. They eat lures and live bait readily, which makes them a perfect target for anglers stepping up from panfish.",
    avgSize: "45–70 cm",
    trophySize: "100 cm+ and over 15 kg in prime estuaries and impoundments",
    regions: [],
    states: [],
    environments: ["river", "canal", "inshore", "flats", "bridge", "dock"],
    styles: ["shore", "boat", "kayak"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["live prawns", "live baitfish", "soft plastics", "hard-body lures"],
    lookalikes: [
      { name: "Mangrove jack", howToTell: "Reddish body and a blunter head; barramundi are silver with a distinct sloped forehead and pearly eye." },
      { name: "Giant trevally", howToTell: "Deep, blunt-headed body built for open water; barramundi are more elongate with a concave head profile." },
    ],
    guide: {
      summary:
        "Barramundi hold on current edges, snags, drains, and lights, waiting to ambush prawns and baitfish. Work soft plastics and shallow hard-bodies past structure, time your sessions around moving tide in estuaries, and expect explosive surface strikes and airborne fights. They tolerate fresh, brackish, and salt water, so the same fish shows up in rivers, canals, and around coastal structure.",
      identification: {
        characteristics: [
          "Silver body with a sloped, concave head profile and large pearly eye that glows in torchlight",
          "Deep body with a continuous lateral line and spiny first dorsal",
          "Big protrusible mouth for inhaling prawns and baitfish whole",
          "Juveniles often show a lighter mottled pattern in tannic water",
        ],
      },
      quickPlan: {
        bestBaitNow: "Live prawn drifted along a current edge, or a 4–5 inch paddle-tail soft plastic",
        lureType: "Soft plastic on a jighead, or a shallow-diving hard-body",
        setup: "Medium 6–7 ft baitcaster or spinning outfit, 20–30 lb braid, 20–40 lb leader",
        locationType: "Snags, drains, bridge pylons, and current seams in an estuary or river mouth",
        bestTime: "First and last light on a moving tide, plus night around lit structure",
        seasonalNote: "Bite peaks in the warmer, wetter months when prawns run; fish hold deeper in cool snaps.",
      },
      gear: {
        rod: "6'6\"–7' medium baitcaster or spinning rod with a fast tip",
        reel: "3000–4000 spinning or a low-profile baitcaster with smooth drag",
        mainLine: "20–30 lb braid",
        leader: "20–40 lb fluorocarbon or mono, heavier around oysters and rock",
        hooks: "2/0–5/0 for live bait; strong single or upgraded trebles on lures",
        jigheads: "1/8–1/2 oz depending on current and depth",
        terminal: "Simple running-sinker rig for bait; loop knot to lures for action",
        lureSizes: "3–5 inch soft plastics, 60–120 mm hard-bodies",
        lureColors: "Natural prawn and mullet tones in clear water, gold and dark in tannic or night sessions",
        baits: ["Live prawns", "Live mullet or herring", "Soft plastic paddle-tails", "Shallow hard-body minnows", "Vibes"],
        setups: {
          beginner: "One 7 ft spinning outfit with 20 lb braid, a pack of paddle-tail plastics, and live prawns covers most estuary situations.",
          budget: "Add a shallow hard-body and a couple of vibes for cooler water; a landing net saves fish at the bank.",
          serious: "Baitcaster for accurate casts into snags, a lure spread from surface to deep-diving, and tide charts to plan the session around the run.",
        },
      },
      techniques: {
        presentation:
          "Cast up-current and let the lure or bait swing naturally past the structure so it arrives in the strike zone like fleeing prey. Barramundi rarely chase far — the presentation has to come to them.",
        retrieve:
          "Slow-roll paddle-tails with the current, add the odd twitch and pause; for hard-bodies use a stop-start crank that bumps structure. Strikes often come on the pause.",
        positioning:
          "Sit up-current of a snag or drain and work the down-current edge. Around bridges, target the shadow line at night where fish sit facing the flow.",
        depth: "Surface to 4 m, tight to structure and current seams",
        structure: "Snags, mangrove roots, rock bars, bridge pylons, drains, and pontoons",
        current: "A moving tide is essential — barramundi feed on the run and switch off on slack water.",
        byStyle: {
          shore: "Land-based anglers clean up around bridge lights, jetties, and drain mouths on the run-out tide.",
          boat: "Electric-motor along snag lines casting tight to cover; back off and let fights come to open water.",
          kayak: "Quiet approach lets you drop lures into tight mangrove pockets bigger boats spook.",
        },
      },
      timing: {
        seasons:
          "Catchable year-round in the tropics; the strongest run follows warm, wet months when prawns and baitfish flood the estuaries.",
        timeOfDay: "Dawn, dusk, and night are prime; midday fish go deep and tight to shade.",
        weather: "Warm, stable, and slightly overcast is ideal; heavy fresh after storms can push fish to the salt.",
        wind: "Light wind that ripples the surface helps; a stiff onshore breeze stacks bait into estuary mouths.",
        waterTemp: "Best above 26°C; feeding slows sharply in cool-season dips.",
        tide: "Last of the run-out and first of the run-in around structure is classic barramundi timing.",
        moon: "Bigger tides around new and full moon concentrate bait and fire up the bite.",
        movement: "Fish shift between fresh, brackish, and salt with rainfall and season.",
      },
      habitat: {
        overview:
          "A true estuarine wanderer. Barramundi use rivers, canals, mangrove creeks, coastal flats, and impoundments, always relating to structure and current where prey funnels past.",
        depthRange: "0.5–5 m",
        structures: ["Snags and fallen timber", "Mangrove roots", "Bridge and jetty pylons", "Rock bars", "Drains and creek mouths"],
        lookFor: "Bait flicking on a current edge, a drain dumping into the main flow, or a snag on the down-current bank.",
        migration: "Adults move downstream to spawn near river mouths in the wet season; juveniles use upstream fresh and brackish nurseries.",
      },
      mistakes: [
        "Fishing slack water instead of a moving tide",
        "Leader too light around oysters and timber — barra bury you in structure",
        "Striking too early on the surface boof instead of loading the rod",
        "Casting past the snag instead of swinging the lure tight to its down-current edge",
      ],
      handling: {
        landing: "Use a knotless net or a firm lip grip with the fish supported horizontally; big barra are heavy and thrash hard.",
        handling: "Wet hands, support the belly, and mind the sharp gill plates and spiny dorsal.",
        release: "They release well — hold upright in the current until the fish kicks off strongly.",
        regulations: "Slot and bag limits apply in many areas and impoundments may be permit-based. Check the local fisheries department before keeping fish.",
      },
    },
  },
  {
    id: "giant-snakehead",
    slug: "giant-snakehead",
    commonName: "Giant Snakehead",
    scientificName: "Channa micropeltes",
    water: "freshwater",
    category: "Snakehead",
    difficulty: 4,
    beginnerFriendly: false,
    region: "sea",
    wikiTitle: "Giant snakehead",
    description:
      "The toman — apex predator of Southeast Asian lakes and rivers. Giant snakehead guard their fry in glowing red schools, smash surface lures with terrifying aggression, and pull like a freight train. Sight-casting to a guarding pair is one of the most exciting freshwater experiences in the region.",
    avgSize: "40–70 cm",
    trophySize: "100 cm+ and over 10 kg in remote reservoirs",
    regions: [],
    states: [],
    environments: ["lake", "river", "canal", "pond"],
    styles: ["shore", "boat", "kayak"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["frogs", "topwater lures", "live baitfish", "soft plastics"],
    lookalikes: [
      { name: "Common snakehead (haruan)", howToTell: "Much smaller and darker; giant snakehead grow far larger and juveniles show bright orange and black stripes." },
      { name: "Emperor snakehead", howToTell: "Different range and markings; giant snakehead have a broad head and blue-grey flanks as adults." },
    ],
    guide: {
      summary:
        "Hunt giant snakehead by spotting the red 'fireball' schools of fry that guarding adults hover beneath. Fire a frog or topwater to the edge of the fry ball and hang on — the strike is explosive and the fight brutal around cover. Braid and heavy leader are non-negotiable because these fish live in timber and lily fields.",
      identification: {
        characteristics: [
          "Long cylindrical body with a broad, flattened head and large mouth",
          "Blue-grey to olive flanks with dark blotches; juveniles are striped orange and black",
          "Can breathe air, so they thrive in warm, low-oxygen water",
          "Guarding adults sit under a dense ball of bright red-orange fry",
        ],
      },
      quickPlan: {
        bestBaitNow: "Weedless frog or a loud topwater walked past a fry ball",
        lureType: "Hollow-body frog, popper, or paddle-tail on a weedless hook",
        setup: "Heavy baitcaster, 40–65 lb braid, 40–60 lb leader",
        locationType: "Timbered margins, lily fields, and flooded bushes of a reservoir or river",
        bestTime: "Mid-morning when fry balls surface in the warming sun",
        seasonalNote: "Fry-guarding season is prime; outside it, fish blind-cast structure and channels.",
      },
      gear: {
        rod: "6'6\"–7'6\" heavy baitcaster with backbone to pull fish from cover",
        reel: "Strong baitcaster with high line capacity and a locked drag",
        mainLine: "40–65 lb braid",
        leader: "40–60 lb fluorocarbon or mono, abrasion-resistant",
        hooks: "4/0–6/0 heavy weedless worm hooks; upgraded trebles on hard baits",
        terminal: "Direct braid-to-leader; snap only if changing lures fast",
        lureSizes: "60–120 mm frogs and topwaters, 4–6 inch plastics",
        lureColors: "Black and dark natural for silhouette, chartreuse and orange in stained water",
        baits: ["Hollow-body frogs", "Poppers and walkers", "Soft plastic paddle-tails", "Live baitfish (where legal)"],
        setups: {
          beginner: "A heavy spinning or baitcast combo with 50 lb braid and a few frogs is enough to tangle with fry-guarders near the bank.",
          budget: "Add a popper and a paddle-tail plus a long-nose plier for the hook removal these toothy fish demand.",
          serious: "Dedicated frog rod, a boat or kayak to reach remote timber, polarised glasses to spot fry balls, and a landing net rated for double-digit fish.",
        },
      },
      techniques: {
        presentation:
          "When you find a fry ball, cast just past it and bring the lure to the near edge — the adults sit below and charge anything threatening the school. Blind-casting, work frogs across lily fields and along timber.",
        retrieve:
          "Walk or pop topwaters with sharp cadence and long pauses; a paused lure over the fry ball often triggers the hit. Set hard once the fish loads the rod.",
        positioning:
          "Stay back and cast at distance — these fish spook, and a boat over the fry ball ends the shot. Approach quietly and keep a low profile.",
        depth: "Surface to 2 m, always relating to cover",
        structure: "Flooded timber, lily and hydrilla fields, submerged bushes, and channel edges",
        current: "Lakes are still; in rivers, target eddies and slack pockets off the main flow.",
        byStyle: {
          shore: "Walk timbered banks and lily edges casting frogs; keep drag tight to stop the first surge.",
          boat: "Electric-motor the margins glassing for red fry balls, then present from a respectful distance.",
          kayak: "Ideal for sneaking into flooded timber where the biggest guarders hold.",
        },
      },
      timing: {
        seasons:
          "Fishable year-round; the fry-guarding period (warm months) is the standout for sight-casting to aggressive adults.",
        timeOfDay: "Mid-morning to afternoon when fry balls rise into warm surface water; also low light.",
        weather: "Warm, calm, sunny days make fry balls easiest to spot.",
        wind: "Calm water helps spotting and topwater presentation; wind chop hides fry balls.",
        waterTemp: "Thrive in warm water above 26°C thanks to air-breathing.",
        movement: "Adults roam with the fry school; outside guarding they hold tight to cover.",
      },
      habitat: {
        overview:
          "Warm freshwater predators of reservoirs, lakes, rivers, and canals, tied to heavy cover where they ambush prey and shepherd their fry.",
        depthRange: "0.5–3 m near cover",
        structures: ["Flooded timber", "Lily and weed fields", "Submerged bushes", "Channel edges", "Undercut banks"],
        lookFor: "Bright red-orange balls of fry dimpling the surface — the surest sign of a guarding pair.",
        migration: "Largely resident; they move locally with water level and spawning.",
      },
      mistakes: [
        "Approaching the fry ball too closely and spooking the guarders",
        "Under-gunned tackle that can't turn a fish out of timber",
        "Slow, weak hooksets on a fish with a hard, bony mouth",
        "Bare hands near the teeth — use pliers and a grip",
      ],
      handling: {
        landing: "Net or firm body grip; mind the teeth and the powerful thrash of a big toman.",
        handling: "Support horizontally with wet hands; never hang a heavy snakehead vertically by the jaw.",
        release: "They are extremely hardy and release well when handled quickly.",
        regulations: "Rules vary by country and many reservoirs are permit-controlled. Some areas manage snakehead as a native fishery, others as invasive — check locally.",
      },
    },
  },
  {
    id: "giant-trevally",
    slug: "giant-trevally",
    commonName: "Giant Trevally",
    scientificName: "Caranx ignobilis",
    water: "saltwater",
    category: "Trevally",
    difficulty: 5,
    beginnerFriendly: false,
    region: "sea",
    wikiTitle: "Giant trevally",
    description:
      "The GT — the bruiser of the flats and reefs. Giant trevally hunt in packs, crash poppers with heart-stopping violence, and try to break you off on coral within seconds. Landing one on a stickbait is a bucket-list moment that demands top-end tackle and a strong back.",
    avgSize: "60–90 cm",
    trophySize: "120 cm+ and over 30 kg around remote reefs and atolls",
    regions: [],
    states: [],
    environments: ["reef", "flats", "nearshore", "offshore", "surf"],
    styles: ["boat", "shore"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["poppers", "stickbaits", "live baitfish", "vertical jigs"],
    lookalikes: [
      { name: "Bluefin trevally", howToTell: "Smaller with blue fins and blue spotting; GT are heavy-bodied silver-grey with a steep head." },
      { name: "Bigeye trevally", howToTell: "Slimmer, schooling, with a larger eye; GT have a much deeper, blunter body." },
    ],
    guide: {
      summary:
        "Giant trevally patrol reef edges, flats, current lines, and headlands, hunting in packs. Cast big poppers and stickbaits and retrieve hard to trigger explosive surface strikes, then lock up and muscle the fish away from coral immediately. This is heavy popping tackle, sharpened trebles, and no give in the first ten seconds.",
      identification: {
        characteristics: [
          "Deep, powerful silver-grey body with a steep forehead",
          "Broad tail and thick wrist built for raw speed and power",
          "Large mouth for engulfing baitfish and squid whole",
          "Big males darken almost black on remote reefs",
        ],
      },
      quickPlan: {
        bestBaitNow: "Large surface popper worked with hard, splashy sweeps",
        lureType: "150–200 mm popper or floating stickbait",
        setup: "Heavy popping rod, 14000–20000 spinning reel, 80–130 lb braid, 130–200 lb leader",
        locationType: "Reef edge, current line, flat, or headland with bait and flow",
        bestTime: "Dawn, dusk, and the strong push of a spring tide",
        seasonalNote: "Available year-round on tropical reefs; the best sessions follow bait and big tides.",
      },
      gear: {
        rod: "7'6\"–8' heavy popping/stickbait rod rated PE6–PE10",
        reel: "14000–20000 spinning reel with 15+ kg of sealed drag",
        mainLine: "80–130 lb braid",
        leader: "130–200 lb fluorocarbon or mono, wind-on for the biggest fish",
        hooks: "Heavy inline single or 4X trebles, always chemically sharp",
        terminal: "Strong solid ring and split ring; wind-on leader for reef battles",
        lureSizes: "120–200 mm poppers and stickbaits, 100–250 g jigs",
        lureColors: "Natural mullet and garfish tones, plus loud pink and chartreuse in murk",
        baits: ["Large poppers", "Floating and sinking stickbaits", "Live baitfish", "Vertical jigs for deep fish"],
        setups: {
          beginner: "Realistically a guided or charter trip — the tackle is specialised and the strikes are brutal. Learn the cast-and-retrieve rhythm with someone experienced.",
          budget: "A single heavy popping outfit, a handful of quality poppers and stickbaits, and upgraded hardware will get you started.",
          serious: "A full PE8+ popping setup, a jigging outfit for deep fish, a spread of poppers and stickbaits, and boat access to remote reef edges.",
        },
      },
      techniques: {
        presentation:
          "Cast to reef edges, current seams, and bait schools, then retrieve so the popper spits water aggressively the whole way back. GT track lures a long way and eat them boat-side, so keep working to the rod tip.",
        retrieve:
          "Poppers: sharp, rhythmic sweeps that throw water. Stickbaits: long sweeping pulls to swim the lure subsurface. When a fish hits, keep winding and let the weight load the hooks before you lock up.",
        positioning:
          "Work up-current of structure so the fight starts away from coral. The moment you hook up, apply maximum pressure to turn the fish's head.",
        depth: "Surface to 15 m over reef; deeper on jigs",
        structure: "Reef edges, drop-offs, current lines, flats, headlands, and passes",
        current: "Strong current concentrates bait and fires GT up; slack water scatters them.",
        byStyle: {
          boat: "Drift or hold up-current of a reef edge, casting into the wash and bait; clear the deck for the fight.",
          shore: "Rock headlands and reef flats produce land-based GT for anglers who can cast heavy gear and stop a fish on coral.",
        },
      },
      timing: {
        seasons: "Year-round on tropical reefs; consistency tracks bait availability and big-tide periods.",
        timeOfDay: "Dawn and dusk are prime; overcast days extend the surface bite.",
        weather: "Some cloud and surface chop helps; flat calm bluebird days can be tougher.",
        wind: "Moderate wind that ruffles the surface aids the popper bite; heavy wind makes casting big lures hard.",
        waterTemp: "Warm tropical water, generally 24–30°C.",
        tide: "The run of a spring tide against reef structure is peak feeding time.",
        moon: "Big tides around new and full moon typically fish best.",
        movement: "Roaming pack hunters that follow bait along reef systems.",
      },
      habitat: {
        overview:
          "Powerful reef and flat predators found from shallow coral to blue-water edges, always relating to current and bait.",
        depthRange: "0–20 m over structure",
        structures: ["Reef edges and drop-offs", "Current lines and passes", "Sand and coral flats", "Rocky headlands", "Bommies and pinnacles"],
        lookFor: "Bait showering the surface, birds working, or a wake pushing across a flat.",
        migration: "Move along reef systems with bait; adults range widely between structures.",
      },
      mistakes: [
        "Light drag or worn hooks — a GT reaches coral in seconds",
        "Stopping the retrieve when a fish is tracking the lure",
        "Standard split rings and trebles that straighten on the strike",
        "Fighting the fish softly instead of turning its head immediately",
      ],
      handling: {
        landing: "Big GT are best kept in the water beside the boat; support with a lip grip and a hand under the belly for a quick photo.",
        handling: "Never hang a large GT vertically — it damages them. Keep them horizontal and minimise air time.",
        release: "Revive fully in the current; the majority of GT are released as a prized catch-and-release sport fish.",
        regulations: "Many reef fisheries are protected or permit-based, and GT are widely released. Check local marine park and fisheries rules.",
      },
    },
  },
  {
    id: "mahseer",
    slug: "mahseer",
    commonName: "Mahseer",
    scientificName: "Tor tambroides",
    water: "freshwater",
    category: "Mahseer",
    difficulty: 4,
    beginnerFriendly: false,
    region: "sea",
    wikiTitle: "Tor tambroides",
    description:
      "The kelah — a golden-scaled river carp revered across the region as one of the ultimate freshwater prizes. Mahseer live in clean, fast upland rivers, feed on fruit, insects, and small prey, and fight with dogged runs in heavy current. Reaching them often means a jungle trek to pristine water.",
    avgSize: "1–3 kg",
    trophySize: "10 kg+ in protected headwaters",
    regions: [],
    states: [],
    environments: ["river", "creek"],
    styles: ["shore", "boat"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["fruit baits", "insects", "small lures", "dough baits"],
    lookalikes: [
      { name: "Hampala barb (sebarau)", howToTell: "Slimmer with a bold vertical bar and a more predatory habit; mahseer are deeper-bodied with large golden scales." },
      { name: "Other Tor mahseer species", howToTell: "Very similar; local range and lip structure separate the species — treat all as prized kelah." },
    ],
    guide: {
      summary:
        "Mahseer hold in oxygenated runs, pools below rapids, and current seams of clean upland rivers. Drift natural baits like fruit and insects, or work small lures through the fast water, and be ready for a hard, bulldogging fight. This is wild-river fishing that rewards careful wading, light-but-strong tackle, and respect for a slow-growing fish.",
      identification: {
        characteristics: [
          "Deep, muscular body with large, bright golden-bronze scales",
          "Thick rubbery lips adapted for grazing the riverbed",
          "Powerful forked tail for holding in heavy current",
          "Barbels at the mouth for finding food in flowing water",
        ],
      },
      quickPlan: {
        bestBaitNow: "Fruit bait (such as sawi or wild fig) or a live insect drifted through a run",
        lureType: "Small spinner, spoon, or shallow minnow",
        setup: "Medium spinning outfit, 15–30 lb braid, 20–30 lb leader",
        locationType: "Pool below a rapid or a current seam in a clean upland river",
        bestTime: "Early morning and late afternoon; after rain when food washes in",
        seasonalNote: "Fruiting seasons along the riverbank concentrate feeding fish; high floods scatter them.",
      },
      gear: {
        rod: "6'6\"–7' medium spinning rod with a forgiving tip and solid backbone",
        reel: "2500–4000 spinning reel with a smooth drag for current runs",
        mainLine: "15–30 lb braid",
        leader: "20–30 lb fluorocarbon, abrasion-resistant around rock",
        hooks: "1/0–3/0 for bait; single hooks preferred on lures for easy release",
        terminal: "Light running sinker or free-lined bait; loop knot to lures",
        lureSizes: "Small 40–70 mm minnows, compact spinners and spoons",
        lureColors: "Natural silver and gold, brown and green in clear jungle water",
        baits: ["Fruit baits (fig, sawi)", "Live insects and grubs", "Dough baits", "Small hard-body lures"],
        setups: {
          beginner: "A medium spinning combo with 20 lb braid and natural fruit bait, fished in a pool below a rapid, is the classic entry to kelah.",
          budget: "Carry a few small spinners and minnows for when fish want a moving target, plus a rubberised net.",
          serious: "Travel-friendly rods for jungle treks, guided access to protected beats, and a mix of natural baits and finesse lures for pressured fish.",
        },
      },
      techniques: {
        presentation:
          "Drift natural baits naturally through the current so they tumble along the bottom like dislodged food. With lures, cast up and across and swing them through the seam at current speed.",
        retrieve:
          "Keep bait presentations drag-free through the run. Lures: a steady swing with occasional twitches; hold on when a fish loads up in the flow.",
        positioning:
          "Wade or position at the head of a pool and present into the faster water above, letting the offering swing into the holding zone. Stay low and quiet in clear water.",
        depth: "Bottom of runs and pools, 1–4 m",
        structure: "Pools below rapids, boulder gardens, current seams, and undercut banks",
        current: "Oxygen-rich flowing water is essential; the best fish sit in strong seams near cover.",
        byStyle: {
          shore: "Wade and rock-hop clean rivers, presenting to pockets and pool heads; light footwork keeps fish from spooking.",
          boat: "In larger rivers, drift baits along current seams and deep pool tails from a small craft.",
        },
      },
      timing: {
        seasons:
          "Year-round in the tropics; fishing peaks when bankside trees fruit and after rain washes food into the river.",
        timeOfDay: "Low light morning and evening; overcast days extend the window.",
        weather: "Stable flows after rain are ideal; raging floods make rivers unfishable.",
        wind: "Wind matters little in tight jungle rivers; focus on flow and clarity.",
        waterTemp: "Cool, clean upland water; mahseer avoid warm, silty stretches.",
        movement: "Move to feeding lanes with rising food and retreat to deep pools when disturbed.",
      },
      habitat: {
        overview:
          "Fish of clean, fast, oxygen-rich rivers, from jungle headwaters to larger upland flows, holding in pools and seams near cover.",
        depthRange: "1–5 m in runs and pools",
        structures: ["Pools below rapids", "Boulder gardens", "Current seams", "Undercut banks", "Deep pool tails"],
        lookFor: "A deep green pool below white water, or fish rising to fruit dropping from bankside trees.",
        migration: "Move upstream to spawn and follow seasonal food; many populations are localised and slow-growing.",
      },
      mistakes: [
        "Dragging bait unnaturally instead of a drag-free drift",
        "Heavy footfalls and shadows spooking fish in clear water",
        "Leader too light for rocky, snag-filled runs",
        "Keeping slow-growing kelah instead of releasing them",
      ],
      handling: {
        landing: "Use a soft knotless net; keep the fish in the current and handle minimally.",
        handling: "Wet hands, support horizontally, and protect the large scales and slime coat.",
        release: "Mahseer are slow-growing and prized — revive fully and release. Many rivers are catch-and-release only.",
        regulations: "Often protected, with closed seasons or catch-and-release beats. Always check local and community fishery rules before fishing.",
      },
    },
  },
  {
    // "peacock-bass" is taken by the US (Florida) entry; the SEA version gets
    // its own slug so each region keeps a region-appropriate guide.
    id: "peacock-bass-sea",
    slug: "peacock-bass-sea",
    commonName: "Peacock Bass",
    scientificName: "Cichla ocellaris",
    water: "freshwater",
    category: "Cichlid",
    difficulty: 2,
    beginnerFriendly: true,
    region: "sea",
    wikiTitle: "Cichla ocellaris",
    description:
      "An introduced cichlid that has become a beloved urban sport fish across the region, especially in city ponds, canals, and ex-mining lakes. Peacock bass are aggressive, gorgeous, and attack lures with abandon, making them a perfect target for anglers fishing close to home.",
    avgSize: "25–40 cm",
    trophySize: "50 cm+ and over 3 kg in mature waters",
    regions: [],
    states: [],
    environments: ["pond", "lake", "canal"],
    styles: ["shore", "kayak", "boat"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["soft plastics", "crankbaits", "topwater lures", "live baitfish"],
    lookalikes: [
      { name: "Native cichlids and tilapia", howToTell: "Peacock bass have the distinctive eye-spot on the tail and bold vertical bars; tilapia are rounder and duller." },
      { name: "Juvenile snakehead", howToTell: "Snakehead have a cylindrical body and flat head; peacock bass are deeper-bodied and brightly barred." },
    ],
    guide: {
      summary:
        "Peacock bass hold around structure in warm urban and rural still waters — fallen trees, drains, weed edges, and shade lines. Cast crankbaits, soft plastics, and topwaters, retrieve with pace, and expect savage strikes. Their accessibility in city ponds makes them the ideal after-work sport fish across Southeast Asia.",
      identification: {
        characteristics: [
          "Deep body in gold-green with three dark vertical bars",
          "Bright eye-spot (ocellus) ringed in gold on the tail base",
          "Aggressive predatory mouth; males develop a nuchal hump when spawning",
          "Colours intensify to vivid gold and red when the fish is fired up",
        ],
      },
      quickPlan: {
        bestBaitNow: "Shallow crankbait or a paddle-tail soft plastic worked past structure",
        lureType: "Crankbait, soft plastic, or small topwater",
        setup: "Light-medium spinning outfit, 10–20 lb braid, 12–20 lb leader",
        locationType: "Structure edge in a warm pond, canal, or ex-mining lake",
        bestTime: "Early morning, late afternoon, and around midday shade lines",
        seasonalNote: "Active year-round in warm water; bite strengthens in bright, warm conditions.",
      },
      gear: {
        rod: "6'–7' light-medium spinning or baitcast rod with a fast tip",
        reel: "1500–3000 spinning reel or a light baitcaster",
        mainLine: "10–20 lb braid",
        leader: "12–20 lb fluorocarbon around timber and rock",
        hooks: "Upgraded trebles on hard baits; 1/0–3/0 worm hooks for plastics",
        jigheads: "1/16–1/4 oz for soft plastics",
        terminal: "Direct braid-to-leader; loop knot on hard baits for action",
        lureSizes: "50–90 mm crankbaits and plastics, small poppers",
        lureColors: "Bright firetiger, gold, and orange; natural shad in clear ponds",
        baits: ["Shallow crankbaits", "Soft plastic paddle-tails", "Small topwaters", "Live baitfish where permitted"],
        setups: {
          beginner: "A light spinning combo with 15 lb braid and a couple of crankbaits catches peacock bass from most city ponds.",
          budget: "Add a soft plastic kit and a small popper for shade-line surface bites; a lip grip helps with the sharp gill plates.",
          serious: "Finesse and reaction lures for pressured urban fish, a kayak to reach mid-pond structure, and light gear that makes the fight fun.",
        },
      },
      techniques: {
        presentation:
          "Cast tight to structure and shade, and bring the lure past the ambush point with pace. Peacock bass are reaction feeders that chase and crush a moving target.",
        retrieve:
          "Steady to fast retrieves with crankbaits; twitch-and-pause soft plastics along edges; walk topwaters over structure at first light. Strikes are hard and immediate.",
        positioning:
          "Fan-cast around visible structure and shade lines, covering water quickly to find active fish. Keep moving along the bank.",
        depth: "Surface to 3 m near structure",
        structure: "Fallen timber, drains, weed edges, jetties, and shade lines",
        current: "Mostly still water; in canals, target inflows and any gentle flow.",
        byStyle: {
          shore: "Walk-and-cast city ponds and canals, hitting every laydown and drain; peacock bass are a premier land-based target.",
          kayak: "Reach mid-water structure and work shade under overhanging trees.",
          boat: "Cover big ex-mining lakes fast, casting to points and timber.",
        },
      },
      timing: {
        seasons: "Fishable year-round in warm water; the bite is strongest in bright, hot conditions.",
        timeOfDay: "Dawn and dusk for topwater; midday shade lines hold active fish.",
        weather: "Warm, sunny, and stable is ideal; cold snaps slow them noticeably.",
        wind: "A light breeze rippling the surface can improve the bite in clear ponds.",
        waterTemp: "Prefer warm water above 26°C; sluggish when cool.",
        movement: "Territorial around structure; roam more when hunting bait schools.",
      },
      habitat: {
        overview:
          "An introduced still-water predator thriving in urban ponds, canals, reservoirs, and ex-mining lakes wherever warm water and structure meet.",
        depthRange: "0.5–3 m near cover",
        structures: ["Fallen timber", "Drains and culverts", "Weed edges", "Jetties and pontoons", "Shade lines"],
        lookFor: "Baitfish scattering near a laydown, or fish flashing gold along a shade line.",
        migration: "Resident and territorial; local movement follows bait and spawning.",
      },
      mistakes: [
        "Retrieving too slowly for a reaction predator",
        "Ignoring shade lines during the middle of the day",
        "Fine leader that frays on timber and gill plates",
        "Releasing into new waters — never move introduced fish between systems",
      ],
      handling: {
        landing: "Lip grip or small net; watch the sharp gill covers.",
        handling: "Wet hands and quick photos; support the body horizontally.",
        release: "They release well. Because they are introduced in the region, follow local rules on keeping versus releasing and never relocate them.",
        regulations: "Status varies — some waters encourage harvest of this introduced species, others restrict it. Check local rules and never transport live fish.",
      },
    },
  },
  {
    id: "mangrove-jack",
    slug: "mangrove-jack",
    commonName: "Mangrove Jack",
    scientificName: "Lutjanus argentimaculatus",
    water: "both",
    category: "Snapper",
    difficulty: 3,
    beginnerFriendly: true,
    region: "sea",
    wikiTitle: "Mangrove red snapper",
    description:
      "A hard-hitting reddish snapper that lives in mangrove creeks and estuaries as a juvenile before moving to offshore reefs with age. Mangrove jack (jenahak merah, ikan tanda) ambush prey from cover and bury you in the roots in a heartbeat — pound-for-pound one of the toughest estuary fish going.",
    avgSize: "30–45 cm",
    trophySize: "60 cm+ and over 5 kg on offshore reefs",
    regions: [],
    states: [],
    environments: ["river", "canal", "inshore", "reef", "bridge", "dock"],
    styles: ["shore", "boat", "kayak"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["live prawns", "live baitfish", "soft plastics", "hard-body lures"],
    lookalikes: [
      { name: "Barramundi", howToTell: "Silver with a sloped head; mangrove jack are reddish with a blunter head and canine teeth." },
      { name: "Other reef snappers", howToTell: "Mangrove jack are deep red-brown in estuaries, coppery on reefs, with prominent canines and a slightly forked tail." },
    ],
    guide: {
      summary:
        "Estuary mangrove jack sit deep in snags, roots, and rock and ambush anything that passes. Present live prawns and baitfish or lures tight to cover, then lock up hard the instant they hit or they'll bury you. Bigger fish move to coastal reefs and rubble, where they fight just as dirty in deeper water.",
      identification: {
        characteristics: [
          "Deep red-brown to coppery body, brighter red in estuaries",
          "Blunt snapper head with obvious canine teeth",
          "Slightly forked tail and strong, stocky body",
          "Juveniles show faint pale bars in tannic creek water",
        ],
      },
      quickPlan: {
        bestBaitNow: "Live prawn or small live baitfish presented tight to a snag",
        lureType: "Paddle-tail soft plastic or a shallow hard-body",
        setup: "Medium-heavy baitcaster, 30–50 lb braid, 30–50 lb leader",
        locationType: "Mangrove roots, rock bars, bridge pylons, or an inshore reef",
        bestTime: "Low light and night on a moving tide",
        seasonalNote: "Warm months fire up estuary jacks; bigger fish hold on reefs year-round.",
      },
      gear: {
        rod: "6'6\"–7' medium-heavy baitcaster with fast recovery to pull fish from cover",
        reel: "Strong baitcaster or 4000 spinning with a locked drag",
        mainLine: "30–50 lb braid",
        leader: "30–50 lb fluorocarbon, heavier around oysters and reef",
        hooks: "2/0–5/0 for live bait; strong single or upgraded trebles on lures",
        jigheads: "1/8–3/8 oz for plastics",
        terminal: "Short heavy leader straight to hook or lure; minimal hardware",
        lureSizes: "3–5 inch plastics, 60–100 mm hard-bodies",
        lureColors: "Natural prawn and mullet tones, dark colours at night",
        baits: ["Live prawns", "Live mullet and herring", "Soft plastic paddle-tails", "Shallow hard-bodies"],
        setups: {
          beginner: "A medium-heavy spinning combo with 40 lb braid and live prawns fished by a snag will hook you a jack fast — landing it is the hard part.",
          budget: "Add a paddle-tail and a shallow hard-body for lure sessions, and heavy leader for oyster-covered structure.",
          serious: "Baitcaster for pinpoint casts into cover, a heavier reef outfit for offshore fish, and tide timing to fish the productive run.",
        },
      },
      techniques: {
        presentation:
          "Put the bait or lure as tight to cover as you dare and be ready instantly. Jacks hit hard and try to reach the snag before you react — the fight is won or lost in the first two seconds.",
        retrieve:
          "For lures, a quick retrieve past the ambush point draws the strike; pause near cover invites the hit. Lock up and pull hard immediately on any take.",
        positioning:
          "Cast up-current so the offering swings naturally into the strike zone, and keep the rod low and ready to lever fish away from structure.",
        depth: "Surface to 6 m in estuaries; deeper on reefs",
        structure: "Mangrove roots, snags, rock bars, bridge pylons, and inshore reefs",
        current: "A moving tide switches jacks on; slack water quiets them.",
        byStyle: {
          shore: "Bridges, jetties, and rock walls at night on the tide are prime land-based jack spots.",
          boat: "Cast tight to snag lines and reef edges; use the boat to pull fish to open water after the hookup.",
          kayak: "Sneak into tight creek pockets and present to roots larger boats can't reach.",
        },
      },
      timing: {
        seasons: "Estuary fish peak in warm months; reef fish are available year-round.",
        timeOfDay: "Low light and after dark are best; midday fish tuck deep into cover.",
        weather: "Warm, stable conditions; jacks feed hard on humid, overcast evenings.",
        wind: "Light wind is fine; jacks are structure-oriented rather than wind-driven.",
        waterTemp: "Prefer warm water above 26°C.",
        tide: "The run of the tide around structure is the key trigger.",
        moon: "Bigger tides around the new and full moon boost the bite.",
        movement: "Juveniles live in estuaries and move offshore to reefs as they mature.",
      },
      habitat: {
        overview:
          "A structure-loving snapper that starts life in mangrove estuaries and creeks and shifts to coastal and offshore reefs with age.",
        depthRange: "0.5–6 m inshore, deeper on reefs",
        structures: ["Mangrove roots", "Snags and timber", "Rock bars", "Bridge and jetty pylons", "Inshore reefs and rubble"],
        lookFor: "Undercut mangrove banks, a snag on the down-current side, or bait holding around bridge pylons at night.",
        migration: "Ontogenetic move from estuaries to offshore reefs as fish grow.",
      },
      mistakes: [
        "Slow reaction to the strike — jacks reach cover instantly",
        "Leader too light for oyster-crusted structure",
        "Fishing slack water instead of the tide",
        "Standing the fish up softly rather than pulling hard early",
      ],
      handling: {
        landing: "Net or firm lip grip; mind the canine teeth and sharp gill plates.",
        handling: "Wet hands, support horizontally, and keep fingers clear of the mouth.",
        release: "They release well when handled quickly; support upright until they kick away.",
        regulations: "Size and bag limits vary by country and reef fisheries may be regulated. Check local rules before keeping fish.",
      },
    },
  },
];
