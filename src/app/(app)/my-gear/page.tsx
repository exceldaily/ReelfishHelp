import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Star, Wrench, Trash2 } from "lucide-react";
import { getDb, gearItems } from "@/db";
import { userSetups } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { deleteUserSetup, toggleFavoriteSetup } from "@/lib/actions/gear-education-actions";
import { setupSummary } from "@/lib/gear/setup-summary";
import { Badge, Card, PageHeader } from "@/components/ui";
import { GearView } from "@/components/gear-view";

export const metadata = { title: "My Gear" };

export default async function MyGearPage() {
  const user = await requireUser();
  const db = await getDb();
  const [items, setups] = await Promise.all([
    db.query.gearItems.findMany({
      where: eq(gearItems.userId, user.id),
      orderBy: [desc(gearItems.favorite), desc(gearItems.createdAt)],
    }),
    db.query.userSetups.findMany({
      where: eq(userSetups.ownerId, user.id),
      orderBy: [desc(userSetups.favorite), desc(userSetups.createdAt)],
    }),
  ]);
  const goTo = setups.find((s) => s.favorite);

  return (
    <div>
      <PageHeader
        title="My Gear"
        subtitle="Your rods, reels, tackle, and boats — plus a wishlist you can fill straight from the catch guides."
      />

      {/* spotlighted go-to setup */}
      {goTo && (
        <Card className="mb-6 p-5 ring-2 ring-bait-400/70 bg-gradient-to-r from-bait-100/60 to-card">
          <div className="flex flex-wrap items-center gap-2">
            <Star className="size-5 fill-bait-400 text-bait-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-bait-700">Go-to setup</span>
            <Link href="/gear/builder" className="ml-auto text-xs font-bold text-tide-700 hover:underline">
              Manage in builder
            </Link>
          </div>
          <div className="mt-1.5 font-display text-lg font-bold text-ink-900">{goTo.name}</div>
          {setupSummary(goTo) && <p className="mt-0.5 text-sm text-ink-700 capitalize">{setupSummary(goTo)}</p>}
          {goTo.notes && <p className="mt-1 text-xs text-ink-500 line-clamp-2">{goTo.notes}</p>}
        </Card>
      )}

      {/* saved builder setups */}
      {setups.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
            <Wrench className="size-5 text-tide-600" /> Saved setups
            <span className="text-ink-300 font-normal text-sm">({setups.length})</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {setups.map((s) => (
              <Card key={s.id} className={`p-4 flex items-start gap-3 ${s.favorite ? "ring-2 ring-bait-400/70" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-ink-900 truncate">{s.name}</span>
                    {s.favorite && <Badge variant="orange">Go-to</Badge>}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-500 capitalize">{setupSummary(s) || "Custom setup"}</div>
                </div>
                <form action={toggleFavoriteSetup}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    aria-label={s.favorite ? "Remove go-to setup" : "Make this my go-to setup"}
                    title={s.favorite ? "Remove go-to setup" : "Make this my go-to setup"}
                    className="p-1"
                  >
                    <Star className={`size-4 ${s.favorite ? "fill-bait-400 text-bait-400" : "text-sand-300 hover:text-bait-400"}`} />
                  </button>
                </form>
                <form action={deleteUserSetup}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" aria-label="Delete setup" className="p-1 text-ink-300 hover:text-red-600">
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </Card>
            ))}
          </div>
        </section>
      )}

      <GearView items={items} />
    </div>
  );
}
