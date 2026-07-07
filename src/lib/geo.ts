/** Geocoding helpers — BigDataCloud reverse (free, no key) + Open-Meteo forward search. */

export type PlaceInfo = {
  label: string; // "Tampa, FL"
  city: string | null;
  state: string | null; // 2-letter when resolvable
  stateName: string | null;
};

const STATE_CODES: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO",
  Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR",
  Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
  Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA",
  "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
};

/** Rounds coordinates to ~0.7 mile precision — never store or show exact spots. */
export function approximate(lat: number, lng: number): { lat: number; lng: number } {
  return { lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 };
}

export async function reverseGeocode(lat: number, lng: number): Promise<PlaceInfo> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("geocode failed");
    const d = await res.json();
    const stateName: string | null = d.principalSubdivision || null;
    const state = stateName ? STATE_CODES[stateName] ?? null : null;
    const city: string | null = d.city || d.locality || null;
    const label = city && state ? `${city}, ${state}` : city || stateName || "Unknown location";
    return { label, city, state, stateName };
  } catch {
    return { label: "Unknown location", city: null, state: null, stateName: null };
  }
}

export type GeoSearchResult = {
  name: string;
  state: string | null;
  lat: number;
  lng: number;
  label: string;
};

/** Forward geocoding for manual location entry (Open-Meteo, US-filtered). */
export async function searchPlaces(query: string): Promise<GeoSearchResult[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json&countryCode=US`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const d = await res.json();
  if (!d.results) return [];
  return (d.results as { name: string; admin1?: string; latitude: number; longitude: number }[]).map(
    (r) => {
      const state = r.admin1 ? STATE_CODES[r.admin1] ?? null : null;
      return {
        name: r.name,
        state,
        lat: r.latitude,
        lng: r.longitude,
        label: state ? `${r.name}, ${state}` : r.name,
      };
    }
  );
}
