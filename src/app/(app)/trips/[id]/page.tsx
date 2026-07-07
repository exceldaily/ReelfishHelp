import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { MapPin, CloudSun, Waves, Sunrise, Sunset, Fish } from "lucide-react";
import { getDb, trips, species, catches } from "@/db";
import { requireUser } from "@/lib/auth-helpers";
import { getConditions } from "@/lib/conditions";
import { Card, Badge, PageHeader, Stat, WaterBadge } from "@/components/ui";
import { TripChecklist, TripActions } from "@/components/trip-checklist";
import { CatchCard } from "@/components/catch-card";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getDb();
  const trip = await db.query.trips.findFirst({ where: and(eq(trips.id, id), eq(trips.userId, user.id)) });
  if (!trip) notFound();

  const targets =
    trip.targetSpeciesIds.length > 0
      ? await db.query.species.findMany({ where: inArray(species.id, trip.targetSpeciesIds) })
      : [];

  const tripCatches = await db.query.catches.findMany({
    where: and(eq(catches.tripId, trip.id), eq(catches.userId, user.id)),
    with: { species: true, photos: true },
  });

  // projected conditions: live forecast if within the next 7 days and coords available
  const tripDate = new Date(`${trip.date}T${trip.time ?? "07:00"}:00`);
  const daysOut = (tripDate.getTime() - Date.now()) / 86400000;
  let conditions: Awaited<ReturnType<typeof getConditions>> | null = null;
  if (trip.lat != null && trip.lng != null && daysOut < 7) {
    try {
      conditions = await getConditions(trip.lat, trip.lng, daysOut > 0 ? tripDate : undefined);
    } catch {
      conditions = null;
    }
  }
  const forecastDay = conditions?.weather.daily.find((d) => d.date === trip.date) ?? null;
  const tideEvents =
    conditions?.tides?.events.filter((e) => e.time.startsWith(trip.date)) ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={trip.title}
        subtitle={
          <>
            {new Date(trip.date + "T12:00:00").toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            {trip.time ? ` · ${trip.time}` : ""}
            {trip.locationLabel ? (
              <span className="inline-flex items-center gap-1 ml-2"><MapPin className="size-4" />{trip.locationLabel}</span>
            ) : null}
          </>
        }
        action={
          trip.status === "completed" ? <Badge variant="fresh">Completed</Badge> : <Badge variant="salt">Planned</Badge>
        }
      />

      <div className="space-y-5">
        {/* projected conditions */}
        {forecastDay && (
          <Card className="p-5 sm:p-6">
            <h3 className="font-display font-bold text-ink-900 mb-3 flex items-center gap-2">
              <CloudSun className="size-5 text-tide-600" />
              {daysOut > 0 ? "Projected conditions" : "Conditions that day"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Forecast" value={forecastDay.conditionText} />
              <Stat label="Temps" value={`${Math.round(forecastDay.highF)}° / ${Math.round(forecastDay.lowF)}°`} />
              <Stat label="Wind max" value={`${Math.round(forecastDay.windMaxMph)} mph`} hint={`Rain ${forecastDay.precipChancePct}%`} />
              <Stat
                label="Sun"
                value={
                  <span className="text-sm inline-flex items-center gap-2">
                    <Sunrise className="size-4 text-bait-500" />
                    {new Date(forecastDay.sunrise).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    <Sunset className="size-4 text-bait-500" />
                    {new Date(forecastDay.sunset).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                }
              />
            </div>
            {conditions && daysOut > 0 && (
              <p className="mt-3 text-sm font-semibold text-tide-800 bg-tide-50 rounded-xl px-4 py-2.5">
                Outlook: {conditions.rating.label.toLowerCase()} ({conditions.rating.score}/100) — {conditions.rating.baitSuggestion}
              </p>
            )}
            {tideEvents.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wide text-ink-500 mb-2 flex items-center gap-1.5">
                  <Waves className="size-4" /> Tides that day
                </div>
                <div className="flex flex-wrap gap-2">
                  {tideEvents.map((t) => (
                    <span key={t.time} className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${t.type === "H" ? "bg-tide-50 text-tide-800" : "bg-sand-100 text-ink-700"}`}>
                      {t.type === "H" ? "High" : "Low"}{" "}
                      {new Date(t.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
        {!forecastDay && daysOut >= 7 && (
          <Card className="p-4 text-sm text-ink-500">
            Forecast opens 7 days out — check back closer to the trip for projected weather and tides.
          </Card>
        )}

        {/* targets */}
        {targets.length > 0 && (
          <Card className="p-5 sm:p-6">
            <h3 className="font-display font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Fish className="size-5 text-tide-600" /> Target species
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {targets.map((s) => (
                <Link
                  key={s.id}
                  href={`/fish/${s.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 hover:bg-sand-100 transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-ink-900">{s.commonName}</div>
                    <div className="text-xs text-ink-500">{s.guide.quickPlan.bestBaitNow}</div>
                  </div>
                  <WaterBadge water={s.water} />
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* checklists */}
        {(trip.gearChecklist.length > 0 || trip.baitChecklist.length > 0) && (
          <Card className="p-5 sm:p-6 grid sm:grid-cols-2 gap-6">
            <TripChecklist tripId={trip.id} list="gearChecklist" items={trip.gearChecklist} title="Gear checklist" />
            <TripChecklist tripId={trip.id} list="baitChecklist" items={trip.baitChecklist} title="Bait & tackle" />
          </Card>
        )}

        {trip.notes && (
          <Card className="p-5 sm:p-6">
            <h3 className="font-display font-bold text-ink-900 mb-2">Notes</h3>
            <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{trip.notes}</p>
          </Card>
        )}

        {/* catches logged from this trip */}
        {tripCatches.length > 0 && (
          <div>
            <h3 className="font-display font-bold text-ink-900 mb-3">Catches from this trip</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {tripCatches.map((c) => (
                <CatchCard
                  key={c.id}
                  c={{
                    id: c.id,
                    speciesName: c.species?.commonName ?? c.customSpeciesName ?? "Unknown",
                    photoUrl: c.photos[0]?.url ?? null,
                    caughtAt: c.caughtAt,
                    lengthIn: c.lengthIn,
                    weightLb: c.weightLb,
                    bait: c.bait,
                    released: c.released,
                    visibility: c.visibility,
                    locationLabel: c.locationLabel,
                    showLocation: true,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <Card className="p-5">
          <TripActions tripId={trip.id} status={trip.status} />
          {trip.status === "completed" && tripCatches.length === 0 && (
            <p className="mt-3 text-sm text-ink-500">
              Trip complete — log what you caught and it&apos;ll be linked here.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
