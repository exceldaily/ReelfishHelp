/** Live tide predictions via NOAA CO-OPS (free, no API key). */

export type TideEvent = { time: string; type: "H" | "L"; heightFt: number };
export type TideInfo = {
  station: { id: string; name: string; lat: number; lng: number; distanceMi: number };
  events: TideEvent[]; // high/low events for the requested window
};

type Station = { id: string; name: string; lat: number; lng: number };

const globalCache = globalThis as unknown as { __tideStations?: Promise<Station[] | null> };

async function fetchStations(): Promise<Station[] | null> {
  try {
    const res = await fetch(
      "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions",
      { next: { revalidate: 60 * 60 * 24 * 7 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.stations as { id: string; name: string; lat: number; lng: number }[]).map((s) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
    }));
  } catch {
    return null;
  }
}

function getStations(): Promise<Station[] | null> {
  if (!globalCache.__tideStations) globalCache.__tideStations = fetchStations();
  return globalCache.__tideStations;
}

export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function nearestTideStation(
  lat: number,
  lng: number
): Promise<(Station & { distanceMi: number }) | null> {
  const stations = await getStations();
  if (!stations || stations.length === 0) return null;
  let best: (Station & { distanceMi: number }) | null = null;
  for (const s of stations) {
    const d = milesBetween(lat, lng, s.lat, s.lng);
    if (!best || d < best.distanceMi) best = { ...s, distanceMi: d };
  }
  return best;
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Tide predictions for a location. Returns null when no station is within
 * `maxMiles` (i.e. inland locations — tides not applicable).
 */
export async function getTides(
  lat: number,
  lng: number,
  opts: { date?: Date; days?: number; maxMiles?: number } = {}
): Promise<TideInfo | null> {
  const { date = new Date(), days = 2, maxMiles = 50 } = opts;
  const station = await nearestTideStation(lat, lng);
  if (!station || station.distanceMi > maxMiles) return null;

  const end = new Date(date);
  end.setDate(end.getDate() + days - 1);
  const params = new URLSearchParams({
    product: "predictions",
    application: "reelfishhelp",
    begin_date: fmtDate(date),
    end_date: fmtDate(end),
    datum: "MLLW",
    station: station.id,
    time_zone: "lst_ldt",
    units: "english",
    interval: "hilo",
    format: "json",
  });
  try {
    const res = await fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.predictions) return null;
    const events: TideEvent[] = (
      data.predictions as { t: string; v: string; type: "H" | "L" }[]
    ).map((p) => ({ time: p.t, type: p.type, heightFt: parseFloat(p.v) }));
    return {
      station: {
        id: station.id,
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        distanceMi: Math.round(station.distanceMi * 10) / 10,
      },
      events,
    };
  } catch {
    return null;
  }
}

/** True when the location is close enough to the coast for tides to matter. */
export async function isCoastal(lat: number, lng: number, maxMiles = 50): Promise<boolean> {
  const station = await nearestTideStation(lat, lng);
  return !!station && station.distanceMi <= maxMiles;
}
