import type { SpeciesSeed } from "./index";

/** Southeast Asia catalog, part 3: the pangasius catfishes. All region "sea". */
export const seaSpecies3: SpeciesSeed[] = [
  {
    id: "mekong-giant-catfish",
    slug: "mekong-giant-catfish",
    commonName: "Mekong Giant Catfish",
    scientificName: "Pangasianodon gigas",
    water: "freshwater",
    category: "Catfish",
    difficulty: 4,
    beginnerFriendly: false,
    region: "sea",
    wikiTitle: "Mekong giant catfish",
    description:
      "The pla buek — one of the largest freshwater fish on Earth and a legend of the Mekong. Wild fish are critically endangered and protected, so anglers meet this giant at managed Thai fishing lakes, where stocked fish over 100 kg eat bread and pellet baits and pull like nothing else in fresh water.",
    avgSize: "8–25 kg",
    trophySize: "100 kg+ at established venues; wild fish have neared 300 kg",
    regions: [],
    states: [],
    environments: ["lake", "pond", "river"],
    styles: ["shore", "boat"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["bread baits", "pellet baits", "dough baits"],
    lookalikes: [
      { name: "Swai (iridescent shark)", howToTell: "Swai are far smaller with a slimmer profile and barbels; adult Mekong giants are massive, grey, low-eyed, and effectively barbel-less." },
      { name: "Siamese carp", howToTell: "Carp have large obvious scales and a small mouth; the giant catfish is scaleless with a broad toothless mouth." },
    ],
    guide: {
      summary:
        "Mekong giant catfish are targeted at managed lakes with floating or suspended bread and pellet baits fished over a fed area. The take is a slow engulf followed by an unstoppable first run, and fights on balanced tackle regularly pass thirty minutes. Wild fish are protected everywhere — this is strictly a stocked-venue fishery, and that's what makes it accessible.",
      identification: {
        characteristics: [
          "Enormous grey, scaleless body with a broad head and toothless mouth",
          "Low-set eyes and near-absent barbels distinguish adults from other catfish",
          "Deeply forked tail that powers long, heavy runs",
          "Pale grey-silver colour, darker across the back",
        ],
      },
      quickPlan: {
        bestBaitNow: "Bread or pellet-mash ball fished mid-water over a fed swim",
        lureType: "Bait fishing only — not a lure target",
        setup: "Heavy carp or light boat outfit, 50–80 lb braid, 60–80 lb leader",
        locationType: "Managed fishing lake with resident giants",
        bestTime: "Morning and late afternoon feeding spells",
        seasonalNote: "Venues fish year-round; hot, stable weather keeps the fish feeding high in the water.",
      },
      gear: {
        rod: "Heavy carp rod or light stand-up boat rod with real lifting power",
        reel: "Large baitrunner-style spinning or a strong conventional, high capacity",
        mainLine: "50–80 lb braid or 40 lb+ mono",
        leader: "60–80 lb abrasion-resistant leader",
        hooks: "Strong 2/0–6/0 hooks matched to a bread or pellet ball",
        terminal: "Sliding float or free-running rig suspending bait mid-water; strong swivels",
        lureSizes: "Not applicable — bait fishing",
        lureColors: "Not applicable",
        baits: ["Bread mash and crust", "Pellet balls", "Dough baits"],
        setups: {
          beginner: "Book a guided session at a Thai fishing park — tackle, bait, and net crew are provided, and hooking a giant is genuinely likely on a day ticket.",
          budget: "A strong spinning outfit with 60 lb braid and venue bait will do the job at most lakes; hire the landing gear on site.",
          serious: "Personal heavy carp or stand-up tackle, a practiced feeding routine to keep fish in the swim, and the patience to wait out the biggest lake residents.",
        },
      },
      techniques: {
        presentation:
          "Feed the swim with bread or pellet mash to draw fish up, then suspend a matching hookbait mid-water in the fed zone. Watch the float or line for the slow, deliberate take of a filter-feeding giant.",
        retrieve:
          "Static bait fishing. When the fish takes, wind tight and let the rod load — no violent strike needed into the toothless mouth. Give line freely on the first run and settle into a long, patient fight.",
        positioning:
          "Fish where the venue's fish patrol — often mid-lake channels and fed areas. Keep other lines clear once a giant is hooked; the fight can circle the whole swim.",
        depth: "Mid-water over 2–6 m",
        structure: "Fed swims, channels, and patrol routes of managed lakes",
        current: "Still water; feeding response is driven by the fed area rather than flow.",
        byStyle: {
          shore: "Bank fishing over a fed swim is the standard venue approach.",
          boat: "Some big venues use boats to follow hooked fish and shorten the fight.",
        },
      },
      timing: {
        seasons: "Year-round at venues; warm months keep fish high and feeding.",
        timeOfDay: "Morning and late afternoon spells are most consistent.",
        weather: "Warm, stable, overcast conditions are ideal; cold snaps push fish deep.",
        wind: "A light ripple helps confidence; heavy wind makes float-watching harder.",
        waterTemp: "Feed best above 26°C.",
        movement: "Patrol set routes around the lake and rise to fed areas.",
      },
      habitat: {
        overview:
          "Historically a Mekong basin migrant, now met by anglers almost entirely in large managed lakes in Thailand where stocked giants patrol open water and fed swims.",
        depthRange: "2–6 m, feeding mid-water",
        structures: ["Fed swims", "Open-water channels", "Patrol routes"],
        lookFor: "Huge grey shapes rolling or swirling over a fed area — giants feeding just under the surface.",
        migration: "Wild fish migrated long distances up the Mekong to spawn; venue fish are resident.",
      },
      mistakes: [
        "Striking hard instead of letting the rod load into the toothless mouth",
        "Under-strength line or a stiff drag against a 100 kg first run",
        "Rushing the fight and pulling the hook at the net",
        "Poor feeding discipline — no fed swim, no fish",
      ],
      handling: {
        landing: "Venue crews land giants in huge nets or slings; never attempt to lift one — photos happen in the water or over a wet cradle.",
        handling: "Keep the fish wet and supported at all times and follow staff instructions exactly.",
        release: "Strictly catch-and-release. Revive thoroughly; a fish this size needs time before it swims off.",
        regulations: "Wild Mekong giant catfish are critically endangered and protected across their range — never target them in the wild. Venue fishing is catch-and-release under house rules.",
      },
    },
  },
  {
    id: "swai-catfish",
    slug: "swai-catfish",
    commonName: "Swai Catfish",
    scientificName: "Pangasianodon hypophthalmus",
    water: "freshwater",
    category: "Catfish",
    difficulty: 2,
    beginnerFriendly: true,
    region: "sea",
    wikiTitle: "Iridescent shark",
    description:
      "The iridescent shark or patin — a sleek, hard-running pangasius found in rivers, reservoirs, and nearly every fishing pond in the region. Swai eat bread, pellets, and fruit baits, run like a train on light tackle, and are often the first proper fight a Southeast Asian angler ever hooks.",
    avgSize: "1.5–5 kg",
    trophySize: "15 kg+ in big rivers and mature lakes",
    regions: [],
    states: [],
    environments: ["river", "lake", "pond", "canal"],
    styles: ["shore", "boat"],
    seasons: ["spring", "summer", "fall", "winter"],
    baitTypes: ["bread baits", "pellet baits", "dough baits", "fruit baits"],
    lookalikes: [
      { name: "Mekong giant catfish", howToTell: "Giants dwarf swai and lack barbels as adults; swai keep two pairs of barbels and a slimmer, shark-like profile." },
      { name: "Other pangasius species", howToTell: "Swai show a silvery iridescent flank (bold stripes as juveniles) and a shark-like dorsal; local pangasius are separated mostly by range and head shape.", },
    ],
    guide: {
      summary:
        "Swai cruise mid-water in schools, hoovering up bread, pellets, and anything drifting past. Feed a swim to pull the school in, float-fish or slow-sink a matching bait, and hold on — even a mid-sized swai runs hard enough to strip light tackle. They're abundant, obliging, and the perfect fish to learn on without being boring.",
      identification: {
        characteristics: [
          "Sleek, shark-like profile with a high dorsal fin",
          "Silvery iridescent flanks; juveniles carry two dark lateral stripes",
          "Two pairs of barbels and low-set eyes",
          "Scaleless body and a deeply forked tail built for speed",
        ],
      },
      quickPlan: {
        bestBaitNow: "Bread crust or a pellet ball fished mid-water in a fed swim",
        lureType: "Bait fishing is the staple; small vibes occasionally take them",
        setup: "Medium spinning outfit, 15–30 lb braid, 20–30 lb leader",
        locationType: "Fishing pond, reservoir arm, or slow river stretch",
        bestTime: "Morning and evening; all day at fed ponds",
        seasonalNote: "Feeds year-round in warm water; rain washing food into rivers fires the bite.",
      },
      gear: {
        rod: "6'6\"–7'6\" medium spinning rod with a forgiving action",
        reel: "3000–5000 spinning reel with a smooth drag — swai runs are long",
        mainLine: "15–30 lb braid",
        leader: "20–30 lb fluorocarbon or mono",
        hooks: "1/0–4/0 strong hooks matched to bread or pellet baits",
        terminal: "Sliding float rig mid-water, or a light running rig on the drop",
        lureSizes: "Not a primary lure target; small vibes and spoons at times",
        lureColors: "Not applicable for bait; natural flash if luring",
        baits: ["Bread crust and mash", "Pellet balls", "Dough baits", "Fruit baits (banana, palm fruit)"],
        setups: {
          beginner: "A medium spinning combo, a loaf of bread, and a local pond — the classic first fight. Feed a few handfuls, float a crust, hang on.",
          budget: "Add a bag of pellets and a sliding float; a net saves fish and leaders at the bank.",
          serious: "Lighter finesse gear for sport at pressured ponds, or heavier line to stop double-digit river fish near snags.",
        },
      },
      techniques: {
        presentation:
          "Feed little and often to hold the school mid-water, then present a bait falling slowly through the fed zone. Takes are confident — the float buries or the line peels off.",
        retrieve:
          "Static or slow-sinking baits do the work. When hooked, let the first run go against the drag; swai turn after the initial burst and give a strong, clean fight in open water.",
        positioning:
          "Fish open water near the fed area, away from snags — a hooked swai will find any obstruction on its first run.",
        depth: "Mid-water over 1.5–5 m",
        structure: "Open water near fed swims, river holes, and reservoir arms",
        current: "In rivers, fish slow eddies and inside bends where drifting food collects.",
        byStyle: {
          shore: "Bank fishing with a fed swim is the standard, from city ponds to reservoir points.",
          boat: "On big rivers and reservoirs, anchor over holes and feed the school up to the boat.",
        },
      },
      timing: {
        seasons: "Year-round in warm water; wet-season rivers fish especially well.",
        timeOfDay: "Morning and evening peaks; fed ponds produce all day.",
        weather: "Warm and stable is best; a fresh rise in the river pulls fish onto the feed.",
        wind: "Little effect; find the food, find the fish.",
        waterTemp: "Happiest above 25°C.",
        movement: "Schools cruise mid-water following food; river fish shift with flow and season.",
      },
      habitat: {
        overview:
          "One of the region's most widespread catfish — big rivers, reservoirs, canals, and nearly every stocked pond, always cruising mid-water in schools.",
        depthRange: "1.5–6 m, usually mid-water",
        structures: ["Fed swims", "River holes and eddies", "Reservoir arms", "Pond open water"],
        lookFor: "Swirls and flashes mid-water over a fed area as the school competes for food.",
        migration: "Wild fish migrate seasonally with the flood pulse; pond and reservoir fish are resident.",
      },
      mistakes: [
        "Locking the drag against the blistering first run",
        "Fishing hard on the bottom when the school is suspended mid-water",
        "Hooks too small and light for a heavy, rubbery mouth",
        "Ignoring the feeding routine — swai follow the free food",
      ],
      handling: {
        landing: "Net them; swai thrash and their dorsal spine is sharp.",
        handling: "Wet hands, support the body, and mind the dorsal and pectoral spines.",
        release: "Hardy and quick to release; support upright until the kick.",
        regulations: "Few restrictions in most areas, but pond and venue rules vary — check locally before keeping fish.",
      },
    },
  },
];
