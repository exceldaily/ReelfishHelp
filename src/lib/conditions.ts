import { getWeather, type WeatherBundle } from "./weather";
import { getTides, type TideInfo } from "./tides";
import { getMoon, type MoonInfo } from "./moon";
import { reverseGeocode, type PlaceInfo, approximate } from "./geo";
import { fishingActivityScore, type ActivityRating } from "./fishing-score";
import { suggestSpecies, type SpeciesSuggestion } from "./suggestions";

export type ConditionsBundle = {
  place: PlaceInfo;
  coords: { lat: number; lng: number }; // approximate
  environment: "coastal" | "freshwater";
  weather: WeatherBundle;
  tides: TideInfo | null;
  moon: MoonInfo;
  rating: ActivityRating;
  suggestions: SpeciesSuggestion[];
  fetchedAt: string;
};

/** One-stop live conditions payload used by the dashboard, conditions page, and trip planner. */
export async function getConditions(
  latRaw: number,
  lngRaw: number,
  at?: Date
): Promise<ConditionsBundle> {
  const { lat, lng } = approximate(latRaw, lngRaw);
  const [weather, tides, place] = await Promise.all([
    getWeather(lat, lng),
    getTides(lat, lng, { date: at, days: 2 }),
    reverseGeocode(lat, lng),
  ]);
  const moon = getMoon(at ?? new Date());
  const environment = tides ? "coastal" : "freshwater";

  const targetDate = at ?? new Date();
  const dayStr = targetDate.toISOString().slice(0, 10);
  const today = weather.daily.find((d) => d.date === dayStr) ?? weather.daily[0];

  const rating = fishingActivityScore({ current: weather.current, today, moon, tides, at });
  const suggestions = await suggestSpecies({
    environment,
    state: place.state,
    month: targetDate.getMonth(),
  });

  return {
    place,
    coords: { lat, lng },
    environment,
    weather,
    tides,
    moon,
    rating,
    suggestions,
    fetchedAt: new Date().toISOString(),
  };
}
