"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Wind,
  Thermometer,
  Gauge,
  CloudSun,
  Sunrise,
  Sunset,
  Droplets,
  Waves,
  Search,
  CalendarClock,
  Fish,
  ArrowUp,
} from "lucide-react";
import { Card, Spinner, Badge, WaterBadge, FieldError, Stat } from "@/components/ui";
import type { ConditionsBundle } from "@/lib/conditions";

type Props = {
  initialCoords: { lat: number; lng: number } | null;
  initialLabel: string | null;
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function fmtDay(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function ScoreDial({ score, label }: { score: number; label: string }) {
  const angle = (score / 100) * 360;
  const color =
    score >= 75 ? "var(--color-moss-500)" : score >= 60 ? "var(--color-tide-500)" : score >= 42 ? "var(--color-bait-500)" : "#b91c1c";
  return (
    <div className="flex items-center gap-4">
      <div
        className="size-24 rounded-full grid place-items-center shrink-0"
        style={{ background: `conic-gradient(${color} ${angle}deg, var(--color-sand-200) ${angle}deg)` }}
        role="img"
        aria-label={`Fishing activity score ${score} out of 100`}
      >
        <div className="size-[76px] rounded-full bg-white grid place-items-center">
          <div className="text-center">
            <div className="font-display text-2xl font-extrabold text-ink-900 leading-none">{score}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-ink-300 mt-0.5">/ 100</div>
          </div>
        </div>
      </div>
      <div>
        <div className="font-display text-xl font-bold text-ink-900">{label}</div>
        <p className="text-xs text-ink-500 mt-0.5 max-w-56">
          A practical indicator from live conditions — never a guarantee. Fish still have opinions.
        </p>
      </div>
    </div>
  );
}

export function ConditionsView({ initialCoords, initialLabel }: Props) {
  const [coords, setCoords] = useState(initialCoords);
  const [label, setLabel] = useState(initialLabel);
  const [data, setData] = useState<ConditionsBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planAt, setPlanAt] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [locDenied, setLocDenied] = useState(false);

  const load = useCallback(async (lat: number, lng: number, at?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      if (at) params.set("at", new Date(at).toISOString());
      const res = await fetch(`/api/conditions?${params}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to load conditions");
      setData(d);
      setLabel(d.place.label);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load live conditions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (coords) {
      load(coords.lat, coords.lng);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          load(c.lat, c.lng);
        },
        () => setLocDenied(true),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    } else {
      setLocDenied(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doSearch() {
    if (search.trim().length < 2) return;
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(search)}`);
    const d = await res.json();
    setSearchResults(d.results ?? []);
  }

  function pickPlace(p: { label: string; lat: number; lng: number }) {
    setSearchResults([]);
    setSearch("");
    setCoords({ lat: p.lat, lng: p.lng });
    setLabel(p.label);
    load(p.lat, p.lng, planAt || undefined);
  }

  const w = data?.weather;

  return (
    <div>
      {/* location + planning bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-ink-900">
            <MapPin className="size-4 text-tide-600" />
            {label ?? "Set your location"}
            {data && (
              <Badge variant={data.environment === "coastal" ? "salt" : "fresh"}>
                {data.environment === "coastal" ? "Coastal water" : "Freshwater area"}
              </Badge>
            )}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Change location…"
                className="rounded-xl border border-sand-300 pl-9 pr-3 py-2 text-sm min-h-10 w-48"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 left-0 w-64 bg-white rounded-xl shadow-lift border border-sand-200 py-1 z-20">
                  {searchResults.map((r) => (
                    <button
                      key={`${r.lat}${r.lng}`}
                      onClick={() => pickPlace(r)}
                      className="w-full text-left px-3.5 py-2 text-sm font-semibold hover:bg-sand-100"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (!("geolocation" in navigator)) return;
                navigator.geolocation.getCurrentPosition((pos) => {
                  const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  setCoords(c);
                  load(c.lat, c.lng, planAt || undefined);
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sand-300 px-3 py-2 text-sm font-semibold min-h-10 hover:bg-sand-100"
            >
              <Navigation className="size-4 text-tide-600" /> Use my location
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-sand-100 pt-3">
          <CalendarClock className="size-4 text-ink-500" />
          <label htmlFor="plan-ahead" className="text-sm font-semibold text-ink-700">Plan ahead:</label>
          <input
            id="plan-ahead"
            type="datetime-local"
            value={planAt}
            onChange={(e) => setPlanAt(e.target.value)}
            className="rounded-xl border border-sand-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => coords && load(coords.lat, coords.lng, planAt || undefined)}
            disabled={!coords}
            className="rounded-xl bg-tide-900 text-white px-4 py-2 text-sm font-bold hover:bg-tide-800 disabled:opacity-50"
          >
            {planAt ? "Check that time" : "Refresh now"}
          </button>
          <span className="text-xs text-ink-300">Forecast covers the next 7 days.</span>
        </div>
      </Card>

      {locDenied && !coords && (
        <Card className="p-6 mb-6 text-center">
          <p className="font-semibold text-ink-900">Location is off — no problem.</p>
          <p className="text-sm text-ink-500 mt-1">
            Search for your city or fishing area above, and we&apos;ll pull live conditions for it.
          </p>
        </Card>
      )}

      {error && <FieldError>{error}</FieldError>}
      {loading && (
        <div className="py-16 text-center">
          <Spinner className="size-8" />
          <p className="mt-3 text-sm text-ink-500">Reading the water — live weather, tides, and moon…</p>
        </div>
      )}

      {data && !loading && w && (
        <div className="space-y-6 animate-fade-up">
          {/* score + suggestions */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5 sm:p-6">
              <ScoreDial score={data.rating.score} label={data.rating.label} />
              <ul className="mt-4 space-y-1.5">
                {data.rating.reasons.slice(0, 4).map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-ink-700">
                    <span className="mt-1.5 size-1.5 rounded-full bg-tide-400 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold text-tide-800 bg-tide-50 rounded-xl px-4 py-3">
                🎣 {data.rating.baitSuggestion}
              </p>
            </Card>

            <Card className="p-5 sm:p-6">
              <h3 className="font-display font-bold text-ink-900 mb-3 flex items-center gap-2">
                <Fish className="size-5 text-tide-600" /> Worth targeting near you
              </h3>
              <div className="space-y-2">
                {data.suggestions.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={`/fish/${s.slug}`}
                    className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 hover:bg-sand-100 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-ink-900">{s.commonName}</div>
                      <div className="text-xs text-ink-500">{s.whyNow}</div>
                    </div>
                    <WaterBadge water={s.water} />
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* current conditions grid */}
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                <CloudSun className="size-5 text-tide-600" /> Current conditions
              </h3>
              <span className="text-sm text-ink-500">{w.current.conditionText}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Temperature" value={`${Math.round(w.current.tempF)}°F`} hint={`Feels ${Math.round(w.current.feelsLikeF)}°`} />
              <Stat
                label="Wind"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    {Math.round(w.current.windMph)} mph
                    <ArrowUp className="size-4 text-tide-600" style={{ transform: `rotate(${w.current.windDirDeg + 180}deg)` }} />
                  </span>
                }
                hint={`From ${w.current.windDirCompass} · gusts ${Math.round(w.current.windGustMph)}`}
              />
              <Stat
                label="Pressure"
                value={`${w.current.pressureMb.toFixed(0)} mb`}
                hint={`${w.current.pressureTrend} — ${w.current.pressureTrend === "falling" ? "often a feeding trigger" : w.current.pressureTrend === "rising" ? "post-front slowdown" : "stable patterns"}`}
              />
              <Stat label="Cloud cover" value={`${w.current.cloudCoverPct}%`} hint={w.current.cloudCoverPct > 50 ? "Fish roam more" : "Fish tight to cover"} />
              <Stat label="Sunrise" value={<span className="inline-flex items-center gap-1.5"><Sunrise className="size-4 text-bait-500" />{fmtTime(w.daily[0].sunrise)}</span>} />
              <Stat label="Sunset" value={<span className="inline-flex items-center gap-1.5"><Sunset className="size-4 text-bait-500" />{fmtTime(w.daily[0].sunset)}</span>} />
              <Stat label="Moon" value={<span>{data.moon.emoji} {data.moon.name}</span>} hint={`${data.moon.illuminationPct}% lit${data.moon.isMajorPeriod ? " · major period" : ""}`} />
              <Stat label="Rain chance" value={<span className="inline-flex items-center gap-1.5"><Droplets className="size-4 text-tide-500" />{w.daily[0].precipChancePct}%</span>} hint="today" />
            </div>
          </Card>

          {/* tides */}
          {data.tides && (
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-ink-900 flex items-center gap-2">
                  <Waves className="size-5 text-tide-600" /> Tides
                </h3>
                <span className="text-xs text-ink-500">
                  NOAA station {data.tides.station.name} · {data.tides.station.distanceMi} mi away
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.tides.events.slice(0, 8).map((t) => {
                  const past = new Date(t.time).getTime() < Date.now();
                  return (
                    <div
                      key={t.time}
                      className={`rounded-xl px-3.5 py-3 ${past ? "bg-sand-100/50 opacity-60" : t.type === "H" ? "bg-tide-50" : "bg-sand-100"}`}
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                        {t.type === "H" ? "High tide" : "Low tide"}
                      </div>
                      <div className="font-display font-bold text-ink-900">
                        {new Date(t.time).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}
                      </div>
                      <div className="text-xs text-ink-500">{t.heightFt.toFixed(1)} ft</div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-ink-500">
                Fish the moving water between tides — the last two hours of a falling tide at drains and passes is a classic window.
              </p>
            </Card>
          )}

          {/* forecast */}
          <Card className="p-5 sm:p-6">
            <h3 className="font-display font-bold text-ink-900 mb-4 flex items-center gap-2">
              <Thermometer className="size-5 text-tide-600" /> 7-day outlook
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {w.daily.map((d) => (
                <div key={d.date} className="rounded-xl bg-sand-100/60 p-3 text-center">
                  <div className="text-xs font-bold text-ink-700">{fmtDay(d.date)}</div>
                  <div className="mt-1 text-[11px] text-ink-500 min-h-8">{d.conditionText}</div>
                  <div className="mt-1 font-display font-bold text-ink-900">
                    {Math.round(d.highF)}° <span className="text-ink-300 font-normal">{Math.round(d.lowF)}°</span>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-ink-500">
                    <span className="inline-flex items-center gap-0.5"><Droplets className="size-3" />{d.precipChancePct}%</span>
                    <span className="inline-flex items-center gap-0.5"><Wind className="size-3" />{Math.round(d.windMaxMph)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between text-xs text-ink-300">
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="size-3.5" /> Live data: Open-Meteo weather{data.tides ? " · NOAA tide predictions" : ""} · location shown approximately
            </span>
            <span>Updated {new Date(data.fetchedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
