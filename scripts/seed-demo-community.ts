/**
 * Seeds example community accounts + forum Q&A so a fresh visitor can see what
 * the forum is for. Idempotent (fixed ids + onConflictDoNothing) — safe to
 * re-run. These are display-only demo accounts (random discarded password, so
 * nobody can log into them). Run:  npx tsx scripts/seed-demo-community.ts
 * (or with DATABASE_URL set to seed production).
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, users, profiles, forumQuestions, forumAnswers } from "../src/db";

const NOW = Date.now();
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000);

type U = { h: string; name: string; state: string; water: "freshwater" | "saltwater" | "both"; exp: "new" | "casual" | "regular" | "serious"; bio: string; styles?: string[]; joined: number };

const USERS: U[] = [
  { h: "saltysam", name: "Salty Sam", state: "FL", water: "saltwater", exp: "serious", bio: "Tampa Bay flats rat. Reds, snook, and the occasional early-morning tarpon. Catch-and-release most days.", styles: ["boat", "kayak"], joined: 140 },
  { h: "reeldealrach", name: "Reel Deal Rachel", state: "TX", water: "saltwater", exp: "regular", bio: "Wade fishing the Texas bays every chance I get. Trout and reds on soft plastics.", styles: ["shore", "kayak"], joined: 120 },
  { h: "basswhisperer", name: "The Bass Whisperer", state: "MO", water: "freshwater", exp: "serious", bio: "20 years chasing largemouth on Ozark lakes. If it swims near a laydown, I've thrown at it.", styles: ["boat"], joined: 200 },
  { h: "kayakcarl", name: "Kayak Carl", state: "FL", water: "both", exp: "regular", bio: "Paddle-powered and proud. Mangroves, springs, and the flats — wherever the yak fits.", styles: ["kayak"], joined: 95 },
  { h: "driftandchill", name: "Drift & Chill", state: "LA", water: "saltwater", exp: "casual", bio: "Louisiana marsh weekends. Slow drifts, cold drinks, redfish tails.", styles: ["boat"], joined: 60 },
  { h: "nautinancy", name: "Nauti Nancy", state: "NC", water: "saltwater", exp: "regular", bio: "Outer Banks surf and a little nearshore. My trailer has more miles than my truck.", styles: ["surf", "boat"], joined: 110 },
  { h: "walleyewanda", name: "Walleye Wanda", state: "MN", water: "freshwater", exp: "serious", bio: "10,000 lakes and I'm working through all of them. Jigging and live-bait rigs.", styles: ["boat"], joined: 180 },
  { h: "snooksniper", name: "Snook Sniper", state: "FL", water: "saltwater", exp: "serious", bio: "Night-tide bridge fanatic. Big linesiders or bust.", styles: ["shore", "boat"], joined: 130 },
  { h: "trollingtony", name: "Trolling Tony", state: "MI", water: "freshwater", exp: "regular", bio: "Great Lakes salmon and walleye. Boards, riggers, and lead core.", styles: ["boat"], joined: 150 },
  { h: "bluegillbill", name: "Bluegill Bill", state: "OH", water: "freshwater", exp: "casual", bio: "Farm ponds and panfish with the grandkids. Simple gear, big smiles.", styles: ["shore"], joined: 75 },
  { h: "flatsfanatic", name: "Flats Fanatic", state: "FL", water: "saltwater", exp: "serious", bio: "Poling skiff, tailing reds, and way too much tackle. Sight-fishing addict.", styles: ["boat"], joined: 160 },
  { h: "pierpete", name: "Pier Pressure Pete", state: "CA", water: "saltwater", exp: "casual", bio: "SoCal pier regular. Halibut, bass, and whatever the bait ball brings in.", styles: ["pier"], joined: 50 },
  { h: "muskiemaggie", name: "Muskie Maggie", state: "WI", water: "freshwater", exp: "serious", bio: "The fish of 10,000 casts owes me nothing and I keep paying. Big baits, big net.", styles: ["boat"], joined: 175 },
  { h: "redfishrider", name: "Redfish Rider", state: "LA", water: "saltwater", exp: "regular", bio: "Sight-casting bronze backs in skinny marsh water. Gold spoon in my sleep.", styles: ["kayak", "boat"], joined: 100 },
  { h: "gonecoastal", name: "Gone Coastal", state: "GA", water: "saltwater", exp: "casual", bio: "Georgia coast, live shrimp, and a popping cork. Keep it simple.", styles: ["boat"], joined: 45 },
  { h: "tightlinestim", name: "Tight Lines Tim", state: "SC", water: "both", exp: "regular", bio: "Lowcountry ponds during the week, inshore on weekends. Bass and reds keep me busy.", styles: ["shore", "boat"], joined: 90 },
  { h: "crappiecoach", name: "The Crappie Coach", state: "TN", water: "freshwater", exp: "serious", bio: "Slabs are a science. Spider rigs, minnows, and brush piles are my classroom.", styles: ["boat"], joined: 165 },
  { h: "offshoreolivia", name: "Offshore Olivia", state: "NJ", water: "saltwater", exp: "serious", bio: "Canyon runs and wreck fishing out of Jersey. Tuna, sea bass, and long boat rides.", styles: ["boat"], joined: 145 },
  { h: "newbienate", name: "Newbie Nate", state: "VA", water: "both", exp: "new", bio: "Six months in and hooked (pun intended). Learning something new every trip.", styles: ["shore"], joined: 30 },
  { h: "catfishcody", name: "Catfish Cody", state: "AL", water: "freshwater", exp: "regular", bio: "River cats after dark. Cut bait, stout rods, and a good headlamp.", styles: ["shore", "boat"], joined: 85 },
];

type Q = { id: string; author: string; state: string; topic: string; title: string; body: string; tags?: string[]; days: number; helpful?: number };

const QUESTIONS: Q[] = [
  { id: "dq-01", author: "newbienate", state: "VA", topic: "general", days: 3, helpful: 4, title: "Totally new to saltwater — what's a solid all-around inshore setup?", body: "I've only ever fished ponds for bass. Want to start chasing reds and trout from shore and the occasional pier. What rod/reel/line combo would you buy if you were starting over? Trying not to overthink it." },
  { id: "dq-02", author: "kayakcarl", state: "FL", topic: "kayaks", days: 6, helpful: 7, title: "Best budget sit-on-top for the flats under $1,000?", body: "Looking for something stable enough to stand and sight-cast, but light enough to car-top solo. Pedal drive would be nice but probably out of budget. What are you all paddling?" },
  { id: "dq-03", author: "trollingtony", state: "MI", topic: "boats-motors", days: 9, title: "20hp tiller won't idle right after sitting all winter — where do I start?", body: "Fires up fine but idles rough and stalls if I don't feed it throttle. Ran non-ethanol last season but didn't stabilize before storage. Carb cleaning first, or check something simpler before I tear into it?" },
  { id: "dq-04", author: "basswhisperer", state: "MO", topic: "bait-lures", days: 12, helpful: 6, title: "Bass shut completely off midday in this heat — what actually still works?", body: "Great morning bite, then nothing from 11 to 4. Water's pushing 88. I've tried slowing way down with a Texas rig but I'm getting bored to tears. What's your go-to midday summer pattern?" },
  { id: "dq-05", author: "walleyewanda", state: "MN", topic: "electronics", days: 5, title: "Reading sonar for suspended walleye — arches vs solid lines?", body: "Marking a lot of fish 15-20 ft down over 30 ft of water. Some show as clean arches, some as flat lines. Which are the players and which am I wasting time on? Running 2D + down imaging." },
  { id: "dq-06", author: "snooksniper", state: "FL", topic: "techniques", days: 4, helpful: 9, title: "Snook keep breaking me off on the bridge — what am I doing wrong?", body: "Hooking good fish at night under the lights but they dump me into the pilings every time. Running 30 lb braid to 40 lb fluoro. Is it drag, leader, or just letting them get the angle on me?" },
  { id: "dq-07", author: "reeldealrach", state: "TX", topic: "reel-recommendations", days: 8, helpful: 5, title: "Best 4000-size spinning reel under $150 for the bay?", body: "Wading a lot so it's going to get dunked and abused in the salt. Want something sealed-ish that'll last more than one season. What's holding up for you in that price range?" },
  { id: "dq-08", author: "redfishrider", state: "LA", topic: "where-to-fish", days: 15, title: "New to kayak fishing the marsh — tips for finding public launches?", body: "Not asking anyone's spots — just how you scout new general areas. How do you find safe public launches and broad marsh zones to explore without getting in over my head on the tide?" },
  { id: "dq-09", author: "muskiemaggie", state: "WI", topic: "rod-recommendations", days: 18, title: "Rod for throwing big glide baits all day without wrecking my shoulder?", body: "Chucking 8-inch glides and my current broomstick is beating me up. Want something with enough backbone to move a big bait and set through a bony mouth, but that loads a little. Length/power suggestions?" },
  { id: "dq-10", author: "catfishcody", state: "AL", topic: "tackle-rigs", days: 7, helpful: 3, title: "Best rig for channel cats in moving river current?", body: "Round sinkers roll and drift out of the hole I'm fishing. Slip-sinker rig, three-way, or something else? And how much weight are you using to hold in a decent current?" },
  { id: "dq-11", author: "offshoreolivia", state: "NJ", topic: "boats-motors", days: 20, helpful: 8, title: "First center console — 21 vs 23 foot for nearshore + occasional canyon?", body: "Mostly wreck and nearshore, but I want the option to run to the canyon on the calm days. Is the jump from 21 to 23 worth it for the ride, or overkill for how I'll actually use it? Single vs twin too." },
  { id: "dq-12", author: "bluegillbill", state: "OH", topic: "general", days: 2, helpful: 5, title: "Taking the grandkids panfishing — simplest setup that just works?", body: "Two kids, ages 6 and 9, first time fishing. I want minimal tangles and maximum bluegill. Bobber and worm, or is there something even more foolproof these days?" },
  { id: "dq-13", author: "crappiecoach", state: "TN", topic: "techniques", days: 11, title: "Spring crappie — spider rigging vs casting jigs, which is putting more in the box?", body: "Fish are moving shallow to stage. I usually spider rig but a buddy is smoking me casting small jigs to cover. When do you switch between the two?" },
  { id: "dq-14", author: "pierpete", state: "CA", topic: "bait-lures", days: 6, title: "What to throw off the pier for halibut and sand bass?", body: "Live bait isn't always available at my pier. What artificials actually produce for halibut and bass from a pier? Swimbait size and color that's been working for you lately?" },
  { id: "dq-15", author: "flatsfanatic", state: "FL", topic: "tackle-rigs", days: 10, helpful: 11, title: "A braid-to-fluoro connection that actually holds — FG is killing me", body: "I know the FG is the gold standard but tying it on a rocking boat with cold hands is a nightmare. Is there a knot that's 90% as strong and half as fiddly for a 20 lb braid to 30 lb leader?" },
  { id: "dq-16", author: "tightlinestim", state: "SC", topic: "electronics", days: 14, title: "Worth putting a cheap fish finder on a 12-ft jon boat?", body: "Mostly ponds and small rivers. Is a $100-150 finder actually useful in shallow water, or am I better off just reading the bank and saving the money? What features actually matter down there?" },
  { id: "dq-17", author: "nautinancy", state: "NC", topic: "boats-motors", days: 22, title: "How often should I repack trailer bearings launching in saltwater?", body: "Backing the trailer into the salt most weekends. I've heard everything from 'once a year' to 'every few months.' What's your real-world schedule, and are bearing buddies enough or a band-aid?" },
  { id: "dq-18", author: "gonecoastal", state: "GA", topic: "techniques", days: 5, helpful: 4, title: "Surf fishing the beach — how do you actually read the trough?", body: "Everyone says 'fish the trough' but I can't tell where it is. What am I looking for at low tide to find the cuts and holes, and how far am I really casting to reach fish?" },
];

type A = { id: string; q: string; author: string; body: string; accepted?: boolean; helpful?: number; days: number };

const ANSWERS: A[] = [
  { id: "da-01", q: "dq-01", author: "flatsfanatic", accepted: true, helpful: 8, days: 2, body: "Keep it simple: a 7'0\" medium spinning rod, a 3000-size sealed reel, 15 lb braid, and a 24\" section of 25 lb fluoro leader. That covers reds, trout, snook, and flounder from shore or a pier. Throw a paddletail on a 1/4 oz jighead and you'll catch fish. The Setup Builder on here will spit out almost exactly that if you tell it 'inshore, shore, artificial.'" },
  { id: "da-02", q: "dq-01", author: "saltysam", helpful: 3, days: 2, body: "Agree with the 3000 combo. One tip nobody told me starting out: add the fluoro leader. Braid straight to the hook spooks fish and gets cut on everything. The Gear > Knots page has the double uni if you're new to tying leaders — easier than the FG to start." },
  { id: "da-03", q: "dq-02", author: "redfishrider", accepted: true, helpful: 9, days: 5, body: "I fished a 12-ft sit-on-top for two years on the marsh before upgrading. Look for something 33\"+ wide if you want to stand — width is stability. Buy used; last year's models go cheap in the fall. Don't blow the whole budget on the yak and forget a good seat and a leash for everything, because everything WILL go overboard once." },
  { id: "da-04", q: "dq-02", author: "kayakcarl", helpful: 2, days: 4, body: "Also factor in how you'll load it solo. A 100 lb pedal yak is great on the water and miserable in the parking lot. If you're car-topping, weight matters more than you think." },
  { id: "da-05", q: "dq-03", author: "offshoreolivia", accepted: true, helpful: 6, days: 8, body: "Classic post-winter carb gum. Before you tear it down: run fresh non-ethanol with a double dose of stabilizer/cleaner and let it idle 20 minutes — sometimes that frees a stuck idle circuit. If it's still rough, pull the bowl and clean the low-speed jet; that's almost always the culprit on a small tiller. Cheap fix, just fiddly." },
  { id: "da-06", q: "dq-03", author: "nautinancy", helpful: 1, days: 7, body: "And replace the fuel line primer bulb if it's the original — they crack and let air in, which mimics a carb problem for hours of frustration. Ask me how I know." },
  { id: "da-07", q: "dq-04", author: "tightlinestim", accepted: true, helpful: 7, days: 11, body: "Midday summer I go deep and slow or fast and reactive, nothing in between. Either drag a Carolina rig on the first drop-off the fish pulled out to, or burn a squarebill/chatterbait down shade lines to trigger a reaction. The afternoon bite is real once you find the depth they slid to." },
  { id: "da-08", q: "dq-04", author: "basswhisperer", helpful: 2, days: 10, body: "Shade and current. A little wind on a point or any moving water near cover will hold active fish even at 2pm. I've saved a lot of dead afternoons just relocating to the windy bank." },
  { id: "da-09", q: "dq-05", author: "trollingtony", accepted: true, helpful: 5, days: 4, body: "Arches usually mean the fish is moving through your cone — often the more active ones. Flat lines are frequently fish holding still or riding your down-imaging beam. But don't overthink shape; watch which marks react when you drop on them. If a 'line' eats, it was a player. Boat speed changes how the same fish paints, too." },
  { id: "da-10", q: "dq-06", author: "snooksniper", days: 4, helpful: 4, body: "It's usually letting them turn. The second you feel the hit, put the wood to them and lean HARD to get their head coming your way and out from the pilings — don't play it soft. Bump that leader to 50-60 lb too; bridge snook will saw through 40 on the barnacles. Locked-ish drag, short fight." },
  { id: "da-11", q: "dq-06", author: "flatsfanatic", accepted: true, helpful: 9, days: 3, body: "This. Everyone loses bridge snook the same way — too light a leader and too gentle a fight. 50 lb fluoro minimum around structure, drag buttoned down, and turn their head immediately. If you can't stop them in the first 3 seconds, you were always going to lose. The species guide on here even flags snook as high structure-risk for exactly this reason." },
  { id: "da-12", q: "dq-07", author: "reeldealrach", days: 7, helpful: 2, body: "I'll answer my own with what I landed on: went with a sealed 4000 in the $120 range and rinsed it after every wade. Two seasons of abuse and it's still smooth. The sealing matters way more than the brand name at this price." },
  { id: "da-13", q: "dq-07", author: "saltysam", accepted: true, helpful: 6, days: 6, body: "Whatever you buy, back the drag off before you store it and rinse with a light spray (not a blast) after saltwater. I've seen $300 reels die faster than $100 ones just from bad care. In the 4000/$150 range there are several solid sealed options — buy the one you can service parts for locally." },
  { id: "da-14", q: "dq-08", author: "driftandchill", accepted: true, helpful: 4, days: 13, body: "Public boat ramps and WMAs are your friend for legal access — a lot of state wildlife sites list them online. Start on a rising tide near a ramp so you're never far from the truck, and note that skinny marsh can strand you on a hard falling tide. Scout broad zones on a satellite map first, then confirm depth on a mid-tide before you commit." },
  { id: "da-15", q: "dq-08", author: "redfishrider", helpful: 3, days: 12, body: "One safety add: always tell someone your general area and launch time, and carry a paddle leash + whistle. The marsh all looks the same once the sun drops. Tide app on the phone is non-negotiable." },
  { id: "da-16", q: "dq-09", author: "muskiemaggie", days: 17, helpful: 2, body: "Answering my own after demoing a few: an 8'6\"-9', heavy (not extra-heavy) rod with a moderate-fast taper saved my shoulder throwing glides all day. Enough tip to load the cast, enough butt to move the bait and drive the hooks. Extra-heavy pool cues wreck you by noon." },
  { id: "da-17", q: "dq-09", author: "walleyewanda", helpful: 1, days: 16, body: "Balance matters as much as power for all-day casting. A rod that's tip-heavy will fatigue you no matter the rating. Pair it with a bigger round reel to counterbalance and it feels lighter in hand." },
  { id: "da-18", q: "dq-10", author: "catfishcody", days: 6, helpful: 2, body: "Solved this myself: a no-roll (flat) sinker on a slip rig holds current way better than an egg or round sinker that tumbles. Three-way works too if you want the bait up off the bottom. I'm running 2-4 oz depending on flow — enough to just hold, not anchor." },
  { id: "da-19", q: "dq-10", author: "basswhisperer", accepted: true, helpful: 4, days: 6, body: "No-roll slip rig for current, every time. Add a bead to protect your knot and a circle hook so they hook themselves in the corner — fewer gut-hooked cats and easier releases. The Terminal Tackle section here has a good rundown on the fish-finder/slip rigs if you want pictures of the setup." },
  { id: "da-20", q: "dq-11", author: "nautinancy", accepted: true, helpful: 7, days: 19, body: "The 21 to 23 jump is mostly about ride and dry decks in a chop — and it's real when you're running back from the canyon into a building sea. If canyon days are truly occasional and calm-only, a well-built 21 will do it, but you'll pick your days more carefully. Twins are peace of mind offshore; a single with a kicker is the budget-friendly middle ground." },
  { id: "da-21", q: "dq-11", author: "offshoreolivia", helpful: 3, days: 18, body: "I went 23 and never regretted the extra foot the first time it snotted up 30 miles out. Fuel burn and slip fees go up though — factor the whole cost of ownership, not just the sticker." },
  { id: "da-22", q: "dq-12", author: "bluegillbill", days: 1, helpful: 3, body: "Reporting back after the trip: a small bobber, a #8 hook, and a piece of nightcrawler under a dock or over any brush = nonstop bluegill and zero tangles. Kept both kids busy for two hours. Cut the worm small so the little fish can actually get it." },
  { id: "da-23", q: "dq-12", author: "crappiecoach", accepted: true, helpful: 5, days: 1, body: "Bobber and worm is still king for kids. One upgrade: use a small slip bobber so they're not fighting a fixed bobber on a long line — way fewer casting tangles for little arms. Keep the hook small and barbless if you can for easy unhooking." },
  { id: "da-23b", q: "dq-13", author: "crappiecoach", days: 10, helpful: 2, body: "My own two cents since I asked half-rhetorically: once fish push shallow to stage, casting a 1/16 oz jig to cover out-fishes the spider rig for me — you can pick apart individual brush and stumps. I only go back to spider rigging when they're scattered and suspended out deeper." },
  { id: "da-24", q: "dq-13", author: "walleyewanda", accepted: true, helpful: 3, days: 9, body: "Spider rig to find them, cast to pick them apart. When they're grouped and neutral, trolling multiple baits covers water and triggers bites. Once you locate an active shallow group, put the trolling rods down and pitch jigs — you'll catch more and spook them less." },
  { id: "da-25", q: "dq-14", author: "pierpete", days: 5, helpful: 2, body: "Following up with what's worked: a 3-4\" swimbait on a 1/2 oz jighead in anything sardine/anchovy colored gets bit by both halibut and bass off the pier. Bounce it slow along the bottom near the pilings. Grubs in root beer or brown produce when the water's clearer." },
  { id: "da-26", q: "dq-14", author: "saltysam", helpful: 1, days: 4, body: "Work the whole water column before you commit. Halibut hug the bottom but bass will suspend around the pilings and the bait balls up higher. If you mark bait, match its size first, color second." },
  { id: "da-27", q: "dq-15", author: "reeldealrach", accepted: true, helpful: 10, days: 9, body: "The double uni is your friend. It's not quite as thin as an FG through the guides but it's plenty strong for 20-to-30 and you can tie it cold, wet, and grumpy in about a minute. The Knots section on here groups them by 'braid to leader' — the double uni and the Alberto are both way more forgiving than the FG for what you're doing." },
  { id: "da-28", q: "dq-15", author: "snooksniper", helpful: 3, days: 8, body: "Alberto knot changed my life for exactly this. Slim enough to cast, dead simple, and it doesn't slip on slick braid. Save the FG for when you've got a steady table and warm hands." },
  { id: "da-29", q: "dq-16", author: "trollingtony", accepted: true, helpful: 4, days: 13, body: "In shallow water a cheap finder is more useful for bottom composition and depth than for 'seeing fish.' Knowing you just slid from 4 ft of mud to 6 ft of gravel matters more than marks. A basic 2D unit does that fine — you don't need side imaging on a 12-footer. Get a portable one you can move between boats." },
  { id: "da-30", q: "dq-17", author: "offshoreolivia", accepted: true, helpful: 6, days: 21, body: "Salt is brutal on bearings. Repack at least once a season, and inspect mid-season if you launch weekly — pull a cap and look for milky grease or rust, that's your tell. Bearing Buddies help keep water out but they're not a substitute for actually repacking; think of them as insurance, not a fix. Rinse the hubs after every salt dunk." },
  { id: "da-31", q: "dq-18", author: "nautinancy", accepted: true, helpful: 5, days: 4, body: "Go look at the beach at DEAD low tide — that's when the structure shows itself. The trough is the darker, deeper strip of water running parallel to the beach between the dry sand and the outer sandbar. Look for cuts in the bar (breaks in where the waves are breaking) — fish funnel through those. Most of your fish are closer than you think; you often don't need to bomb it past the bar." },
  { id: "da-32", q: "dq-18", author: "gonecoastal", helpful: 2, days: 3, body: "This helped me a ton — thanks. Started fishing the trough on the incoming tide right at the cuts and finally stopped skunking. Way closer than I was casting before." },
];

async function main() {
  const db = await getDb();
  const passwordHash = await bcrypt.hash(`demo-${Math.random()}-${Date.now()}`, 12); // random + discarded → not loginable

  for (const u of USERS) {
    const id = `demo-${u.h}`;
    await db.insert(users).values({ id, email: `${u.h}@demo.reelfishhelp.app`, passwordHash, createdAt: daysAgo(u.joined) }).onConflictDoNothing();
    await db.insert(profiles).values({
      userId: id,
      username: u.h,
      displayName: u.name,
      bio: u.bio,
      homeState: u.state,
      waterPref: u.water,
      experience: u.exp,
      fishingStyles: u.styles ?? [],
      favoriteSpecies: [],
      visibility: "public",
      onboarded: true,
      acceptedTermsAt: daysAgo(u.joined),
      createdAt: daysAgo(u.joined),
    }).onConflictDoNothing();
  }

  for (const q of QUESTIONS) {
    await db.insert(forumQuestions).values({
      id: q.id,
      userId: `demo-${q.author}`,
      boardId: `state-${q.state.toLowerCase()}`,
      title: q.title,
      body: q.body,
      tags: q.tags ?? [],
      topic: q.topic,
      status: "open",
      answerCount: 0,
      helpfulCount: q.helpful ?? 0,
      createdAt: daysAgo(q.days),
      updatedAt: daysAgo(q.days),
    }).onConflictDoNothing();
  }

  for (const a of ANSWERS) {
    await db.insert(forumAnswers).values({
      id: a.id,
      questionId: a.q,
      userId: `demo-${a.author}`,
      body: a.body,
      helpfulCount: a.helpful ?? 0,
      accepted: !!a.accepted,
      createdAt: daysAgo(a.days),
    }).onConflictDoNothing();
  }

  // roll up answer counts + mark resolved where an answer was accepted
  for (const q of QUESTIONS) {
    const ans = ANSWERS.filter((a) => a.q === q.id);
    const resolved = ans.some((a) => a.accepted);
    await db
      .update(forumQuestions)
      .set({ answerCount: ans.length, status: resolved ? "resolved" : "open" })
      .where(eq(forumQuestions.id, q.id));
  }

  console.log(`✓ demo community seeded: ${USERS.length} accounts, ${QUESTIONS.length} questions, ${ANSWERS.length} answers`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
