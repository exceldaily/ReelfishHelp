import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft, Backpack, CalendarPlus, ShoppingBag } from "lucide-react";
import { getDb, gearSetups, species, trips } from "@/db";
import { currentUser } from "@/lib/auth-helpers";
import { PageHeader, Card, Badge, Button, ButtonLink, WaterBadge } from "@/components/ui";
import { saveSetupToGear, saveSetupToTrip } from "@/lib/actions/gear-education-actions";
import { SETUP_CAT } from "../page";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const s = await db.query.gearSetups.findFirst({ where: eq(gearSetups.slug, slug) });
  return { title: s ? `${s.name} · Gear Setups` : "Gear Setup", description: s?.summary };
}

export default async function SetupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const s = await db.query.gearSetups.findFirst({ where: eq(gearSetups.slug, slug) });
  if (!s) notFound();

  const user = await currentUser();
  const myTrips = user
    ? await db.query.trips.findMany({ where: and(eq(trips.userId, user.id), eq(trips.status, "planned")), orderBy: [desc(trips.createdAt)], limit: 20 })
    : [];
  const related = s.relatedSpecies.length
    ? await db.query.species.findMany({ where: eq(species.active, true) }).then((all) => all.filter((x) => s.relatedSpecies.includes(x.slug)))
    : [];

  const rows: [string, string][] = [
    ["Rod", s.rod],
    ["Reel", s.reel],
    ["Main line", s.mainLine],
    ["Leader", s.leader],
    ["Hook", s.hook],
    ["Rig", s.rig],
    ["Lure / bait", s.lureBait],
    ["Knot", s.knot],
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/gear/setups" className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> All setups
      </Link>
      <PageHeader title={s.name} subtitle={s.summary} />

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="orange">{SETUP_CAT[s.category] ?? s.category}</Badge>
        <WaterBadge water={s.water} />
        {s.flags?.beginnerFriendly && <Badge variant="fresh">Beginner-friendly</Badge>}
        {s.flags?.heavyTackle && <Badge variant="dark">Heavy tackle</Badge>}
      </div>

      <Card className="p-5 sm:p-6 mb-5">
        <dl className="divide-y divide-sand-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-4 py-2.5">
              <dt className="w-28 shrink-0 text-sm font-bold text-ink-500">{label}</dt>
              <dd className="text-[15px] text-ink-800">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-5 mb-5 bg-tide-50 border-tide-100">
        <h3 className="font-display font-bold text-ink-900 mb-1">Why this setup works</h3>
        <p className="text-[15px] text-ink-700">{s.whyItWorks}</p>
      </Card>

      {/* save actions */}
      {user ? (
        <div className="flex flex-wrap gap-3 mb-6">
          <form action={saveSetupToGear}>
            <input type="hidden" name="setupSlug" value={s.slug} />
            <Button type="submit" variant="secondary" size="sm"><Backpack className="size-4" /> Save to My Gear</Button>
          </form>
          {myTrips.length > 0 && (
            <form action={saveSetupToTrip} className="flex items-center gap-2">
              <input type="hidden" name="setupSlug" value={s.slug} />
              <select name="tripId" className="rounded-xl border border-sand-300 px-3 py-2 min-h-10 text-sm bg-white">
                {myTrips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <Button type="submit" variant="outline" size="sm"><CalendarPlus className="size-4" /> Add to trip</Button>
            </form>
          )}
        </div>
      ) : (
        <div className="mb-6"><ButtonLink href="/login" variant="secondary" size="sm">Log in to save this setup</ButtonLink></div>
      )}

      {related.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display font-bold text-ink-900 mb-2">Matching fish guides</h3>
          <div className="flex flex-wrap gap-2">
            {related.map((x) => (
              <Link key={x.id} href={`/fish/${x.slug}`}><Badge variant="salt" className="hover:bg-tide-200">{x.commonName}</Badge></Link>
            ))}
          </div>
        </div>
      )}

      {/* affiliate slot (Phase 1: disabled placeholder + disclosure) */}
      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-2 text-ink-400">
          <ShoppingBag className="size-4" />
          <span className="text-sm font-semibold">Shop this setup — coming soon</span>
        </div>
        <p className="mt-1 text-xs text-ink-400">
          Some gear links will be affiliate links. We may earn a commission if you make a purchase, at no additional cost to you.
        </p>
      </Card>
    </div>
  );
}
