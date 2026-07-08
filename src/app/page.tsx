import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Camera,
  CloudSun,
  MapPin,
  Search,
  Fish,
  Compass,
  BookOpenText,
  Trophy,
  CalendarDays,
  Waves,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/auth";
import { getDb, species } from "@/db";
import { eq } from "drizzle-orm";
import { resolveManyImages } from "@/lib/wiki-images";
import { fishIdEnabled } from "@/lib/flags";
import { Logo } from "@/components/logo";
import { FishImage } from "@/components/fish-image";
import { WaterBadge, Badge } from "@/components/ui";

const FEATURED_SLUGS = [
  "largemouth-bass",
  "redfish",
  "rainbow-trout",
  "speckled-trout",
  "walleye",
  "snook",
  "crappie",
  "mahi-mahi",
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/home");
  const fishId = fishIdEnabled();

  const db = await getDb();
  const all = await db.query.species.findMany({ where: eq(species.active, true) });
  const featured = FEATURED_SLUGS.map((slug) => all.find((s) => s.slug === slug)).filter(
    (s): s is NonNullable<typeof s> => !!s
  );
  await resolveManyImages(featured);
  const refreshed = await db.query.species.findMany({ where: eq(species.active, true) });
  const featuredWithImages = FEATURED_SLUGS.map((slug) =>
    refreshed.find((s) => s.slug === slug)
  ).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="flex-1">
      {/* ───────────────────────────── hero ───────────────────────────── */}
      <div className="water-gradient text-white relative">
        <div className="topo-lines absolute inset-0" aria-hidden />
        <header className="relative bg-black border-b border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 h-20 flex items-center justify-between">
            <Logo dark />
            <nav className="flex items-center gap-2">
              <Link
                href="/fish"
                className="hidden sm:block rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-neutral-900"
              >
                Find Fish
              </Link>
              <Link
                href="/conditions"
                className="hidden sm:block rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-neutral-900"
              >
                Conditions
              </Link>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-neutral-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-bait-500 hover:bg-bait-600 px-4 py-2 text-sm font-bold text-white"
              >
                Sign up free
              </Link>
            </nav>
          </div>
        </header>

        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-tide-700 bg-tide-900/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-tide-200">
              <Waves className="size-3.5" />
              Fishing intelligence for US anglers
            </div>
            <h1 className="mt-5 font-display text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Know the water.
              <br />
              <span className="text-tide-300">Catch the fish.</span>
            </h1>
            <p className="mt-5 text-lg text-tide-100/90 max-w-xl">
              Live local conditions and tides{fishId ? ", photo fish identification," : ""} and
              practical catch guides for 40+ American fresh and saltwater species — plus your own
              trip plans, catch log, gear locker, and spots.
            </p>

            {/* species search */}
            <form action="/fish" method="GET" className="mt-8 flex max-w-xl shadow-lift rounded-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink-300" />
                <input
                  name="q"
                  placeholder="What fish are you trying to catch?"
                  className="w-full rounded-l-2xl border-0 bg-white pl-12 pr-4 py-4 text-base text-ink-900 placeholder:text-ink-300 focus:outline-2 focus:outline-bait-500"
                  autoComplete="off"
                />
              </div>
              <button className="rounded-r-2xl bg-bait-500 hover:bg-bait-600 px-6 font-bold text-white text-base">
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {fishId && (
                <Link
                  href="/identify"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-tide-400/60 bg-tide-900/50 hover:bg-tide-800 px-5 py-3 font-bold text-white"
                >
                  <Camera className="size-5 text-bait-400" />
                  Identify a Fish from a Photo
                </Link>
              )}
              <Link
                href="/conditions"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-tide-200 hover:text-white"
              >
                <CloudSun className="size-5" />
                Check local conditions
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <svg viewBox="0 0 1440 70" className="block w-full text-sand-50 relative" preserveAspectRatio="none" aria-hidden>
          <path
            fill="currentColor"
            d="M0 40c120 20 240 30 360 22s240-34 360-38 240 16 360 26 240 10 360-4v24H0Z"
          />
        </svg>
      </div>

      {/* ─────────────────────────── how it works ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 text-center">
          From “where do I even start?” to fish on the line
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: MapPin,
              title: "Share your area",
              body: "We read your approximate location (or you pick a state) and detect the fishing environment — lake country, rivers, inshore salt, or surf.",
            },
            {
              icon: CloudSun,
              title: "Read the water",
              body: "Live weather, wind, pressure trend, moon phase, sunrise/sunset, and real NOAA tide predictions — rolled into a practical fishing activity rating.",
            },
            {
              icon: Fish,
              title: "Pick your fish",
              body: "Filter 40+ species by water, region, season, structure, and skill level to find exactly what's biting near you.",
            },
            {
              icon: BookOpenText,
              title: "Follow the plan",
              body: "Every species has a full catch guide: bait, rigs, gear by budget, techniques, timing, habitat, common mistakes, and safe handling.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="relative rounded-2xl bg-white border border-sand-200 shadow-card p-6">
              <div className="absolute -top-3 left-6 rounded-full bg-tide-900 text-white text-xs font-bold size-7 flex items-center justify-center">
                {i + 1}
              </div>
              <Icon className="size-7 text-tide-600" />
              <h3 className="mt-3 font-display font-bold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── featured species ───────────────────────── */}
      <section className="bg-tide-950 py-14 relative">
        <div className="topo-lines absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                The fish, and exactly how to catch them
              </h2>
              <p className="mt-1.5 text-tide-200">
                Field-guide depth without the guesswork — freshwater and salt, coast to coast.
              </p>
            </div>
            <Link
              href="/fish"
              className="hidden sm:inline-flex items-center gap-1.5 font-bold text-bait-400 hover:text-bait-100 whitespace-nowrap"
            >
              Browse all species <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {featuredWithImages.map((s) => (
              <Link
                key={s.id}
                href={`/fish/${s.slug}`}
                className="group rounded-2xl overflow-hidden bg-tide-900 border border-tide-800 hover:border-tide-600 transition-colors"
              >
                <FishImage src={s.imageUrl} alt={s.commonName} className="h-32 sm:h-40" />
                <div className="p-3.5">
                  <div className="font-display font-bold text-white text-sm sm:text-base group-hover:text-bait-400 transition-colors">
                    {s.commonName}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <WaterBadge water={s.water} />
                    {s.beginnerFriendly && <Badge variant="orange">Beginner friendly</Badge>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 sm:hidden text-center">
            <Link href="/fish" className="font-bold text-bait-400">
              Browse all species →
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────── toolkit ──────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 text-center">
          Your whole fishing life, organized
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: CalendarDays,
              title: "Plan trips around real conditions",
              body: "Pick a date, see projected weather and tides, build gear and bait checklists, and convert finished trips into catch logs.",
              href: "/trips",
            },
            {
              icon: Trophy,
              title: "Log catches, build your story",
              body: "Photos, measurements, bait, conditions — with privacy controls that never expose your exact spots unless you choose to share.",
              href: "/catches",
            },
            {
              icon: Compass,
              title: "Spots, gear, and community",
              body: "A private map of your fishing spots, a gear locker with wishlists from the guides, and a feed of anglers worth following.",
              href: "/community",
            },
          ].map(({ icon: Icon, title, body, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl bg-white border border-sand-200 shadow-card p-6 hover:shadow-lift transition-shadow"
            >
              <div className="size-11 rounded-xl bg-tide-100 flex items-center justify-center">
                <Icon className="size-6 text-tide-700" />
              </div>
              <h3 className="mt-4 font-display font-bold text-ink-900 group-hover:text-tide-700">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────── CTA ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="water-gradient rounded-3xl px-6 py-12 sm:px-12 text-center relative overflow-hidden">
          <div className="topo-lines absolute inset-0" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white">
              The next tide is coming. Be ready for it.
            </h2>
            <p className="mt-3 text-tide-100/90 max-w-xl mx-auto">
              Free account. Live data from day one. Built for phones in bright sun and salt spray.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-bait-500 hover:bg-bait-600 px-7 py-3.5 font-bold text-white text-base shadow-lift"
              >
                Create your free account
              </Link>
              <Link
                href="/fish"
                className="rounded-xl border-2 border-tide-500/70 px-7 py-3.5 font-bold text-white hover:bg-tide-800/60"
              >
                Explore the fish guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-sand-200 py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap items-center justify-between gap-4 text-sm text-ink-500">
          <Logo />
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/fish" className="hover:text-ink-900">Find Fish</Link>
            {fishId && <Link href="/identify" className="hover:text-ink-900">Identify</Link>}
            <Link href="/conditions" className="hover:text-ink-900">Conditions</Link>
            <Link href="/community" className="hover:text-ink-900">Community</Link>
            <Link href="/terms" className="hover:text-ink-900">Rules &amp; Terms</Link>
            <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
          </div>
          <p>Always check current state regulations before keeping fish.</p>
        </div>
      </footer>
    </div>
  );
}
