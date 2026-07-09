import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, SlidersHorizontal, Backpack } from "lucide-react";
import { getDb, gearSetups } from "@/db";
import { PageHeader, Card, Badge, EmptyState, WaterBadge } from "@/components/ui";

export const metadata = {
  title: "Gear Setups · Gear",
  description: "Complete, situational fishing setups — rod, reel, line, leader, rig, and knot — that you can copy and fish.",
};

export const SETUP_CAT: Record<string, string> = {
  "all-around": "All-Around",
  shore: "Shore / Bank / Beach",
  pier: "Pier / Dock / Bridge",
  kayak: "Kayak",
  "inshore-boat": "Inshore Boat",
  offshore: "Offshore / Deepwater",
  technique: "Technique",
  trophy: "Heavy / Trophy",
};
const METHODS = ["casting", "trolling", "bottom fishing", "jigging", "drifting", "still fishing", "surf fishing", "sight fishing"];

export default async function SetupsPage({ searchParams }: { searchParams: Promise<{ water?: string; cat?: string; method?: string }> }) {
  const f = await searchParams;
  const db = await getDb();
  const all = await db.query.gearSetups.findMany({ where: eq(gearSetups.status, "published"), orderBy: [asc(gearSetups.sort)] });

  const results = all.filter(
    (s) =>
      (!f.water || s.water === f.water || s.water === "both") &&
      (!f.cat || s.category === f.cat) &&
      (!f.method || s.methods.includes(f.method))
  );

  const sel = "rounded-xl border border-sand-300 px-3 py-2.5 min-h-11 text-[15px] bg-white";

  return (
    <div>
      <Link href="/gear" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> All gear
      </Link>
      <PageHeader
        title="Gear Setups"
        subtitle="Proven, situational rigs — copy the whole setup or open one to save it to your gear or a trip."
      />

      <form method="GET" className="flex flex-wrap gap-2 mb-6">
        <select name="water" defaultValue={f.water ?? ""} className={sel}>
          <option value="">Any water</option>
          <option value="freshwater">Freshwater</option>
          <option value="saltwater">Saltwater</option>
        </select>
        <select name="cat" defaultValue={f.cat ?? ""} className={sel}>
          <option value="">Any category</option>
          {Object.entries(SETUP_CAT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="method" defaultValue={f.method ?? ""} className={`${sel} capitalize`}>
          <option value="">Any method</option>
          {METHODS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
        </select>
        <button className="inline-flex items-center gap-2 rounded-xl bg-tide-900 text-white font-bold px-4 py-2.5 min-h-11 hover:bg-tide-800">
          <SlidersHorizontal className="size-4" /> Filter
        </button>
        {(f.water || f.cat || f.method) && (
          <Link href="/gear/setups" className="inline-flex items-center px-3 text-sm font-semibold text-ink-500 hover:text-ink-900">Clear</Link>
        )}
      </form>

      {results.length === 0 ? (
        <EmptyState icon={<Backpack />} title="No setups match those filters" body="Try widening the water type or method." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <Link key={s.id} href={`/gear/setups/${s.slug}`} className="group bg-white rounded-2xl border border-sand-200 shadow-card p-5 hover:shadow-lift transition-shadow flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-ink-900 group-hover:text-tide-700 transition-colors">{s.name}</h3>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge variant="orange">{SETUP_CAT[s.category] ?? s.category}</Badge>
                <WaterBadge water={s.water} />
                {s.flags?.beginnerFriendly && <Badge variant="fresh">Beginner</Badge>}
              </div>
              <p className="mt-2 text-sm text-ink-500 flex-1">{s.summary}</p>
              <div className="mt-3 text-xs text-ink-500 space-y-0.5">
                <div><span className="font-semibold text-ink-700">Rod:</span> {s.rod}</div>
                <div><span className="font-semibold text-ink-700">Reel:</span> {s.reel}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
