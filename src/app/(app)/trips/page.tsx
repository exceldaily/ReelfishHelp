import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CalendarDays, MapPin, Plus, CheckCircle2 } from "lucide-react";
import { getDb, trips } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { PageHeader, ButtonLink, EmptyState, Badge, Card } from "@/components/ui";

export const metadata = { title: "My Trips" };

export default async function TripsPage() {
  const user = await requireUser();
  const db = await getDb();
  const rows = await db.query.trips.findMany({
    where: eq(trips.userId, user.id),
    orderBy: [desc(trips.date)],
  });

  const upcoming = rows.filter((t) => t.status === "planned");
  const completed = rows.filter((t) => t.status === "completed");

  const TripRow = ({ t }: { t: (typeof rows)[number] }) => (
    <Link key={t.id} href={`/trips/${t.id}`} className="block">
      <Card className="p-4 hover:shadow-lift transition-shadow flex items-center gap-4">
        <div className="size-12 rounded-xl bg-tide-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] font-bold uppercase text-tide-700">
            {new Date(t.date + "T12:00:00").toLocaleDateString([], { month: "short" })}
          </span>
          <span className="font-display font-extrabold text-tide-900 leading-none">
            {new Date(t.date + "T12:00:00").getDate()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-ink-900 truncate">{t.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
            {t.time && <span>{t.time}</span>}
            {t.locationLabel && (
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{t.locationLabel}</span>
            )}
            <span>{t.targetSpeciesIds.length} target species</span>
            <span>
              {t.gearChecklist.filter((i) => i.done).length}/{t.gearChecklist.length} gear packed
            </span>
          </div>
        </div>
        {t.status === "completed" ? (
          <Badge variant="fresh"><CheckCircle2 className="size-3.5" /> Completed</Badge>
        ) : (
          <Badge variant="salt">Planned</Badge>
        )}
      </Card>
    </Link>
  );

  return (
    <div>
      <PageHeader
        title="Trips"
        subtitle="Plan around the conditions, pack from the checklist, and turn finished trips into catch logs."
        action={<ButtonLink href="/trips/new"><Plus className="size-4" /> Plan a trip</ButtonLink>}
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={<CalendarDays />}
          title="No trips planned"
          body="Pick a day, a stretch of water, and a target — we'll pull the forecast and tides for it."
          action={<ButtonLink href="/trips/new">Plan your first trip</ButtonLink>}
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Upcoming</h2>
              <div className="space-y-3">{upcoming.map((t) => <TripRow key={t.id} t={t} />)}</div>
            </section>
          )}
          {completed.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Completed</h2>
              <div className="space-y-3">{completed.map((t) => <TripRow key={t.id} t={t} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
