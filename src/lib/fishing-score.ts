import type { CurrentWeather, DailyForecast } from "./weather";
import type { MoonInfo } from "./moon";
import type { TideInfo } from "./tides";

export type ActivityRating = {
  score: number; // 0–100
  label: "Excellent conditions" | "Good conditions" | "Moderate conditions" | "Tough conditions";
  reasons: string[];
  baitSuggestion: string;
};

/**
 * Practical fishing-activity indicator built from environmental conditions.
 * This is guidance, not a guarantee — phrased accordingly in the UI.
 */
export function fishingActivityScore(input: {
  current: CurrentWeather;
  today: DailyForecast;
  moon: MoonInfo;
  tides: TideInfo | null;
  at?: Date;
}): ActivityRating {
  const { current, today, moon, tides } = input;
  const at = input.at ?? new Date();
  let score = 55;
  const reasons: string[] = [];

  // Barometric pressure trend — the classic driver
  if (current.pressureTrend === "falling") {
    score += 14;
    reasons.push("Falling barometric pressure often triggers feeding ahead of weather");
  } else if (current.pressureTrend === "rising") {
    score -= 8;
    reasons.push("Rising pressure after a front usually slows the bite");
  } else {
    score += 4;
    reasons.push("Steady pressure — stable feeding patterns");
  }

  // Cloud cover
  if (current.cloudCoverPct >= 50 && current.cloudCoverPct <= 95) {
    score += 8;
    reasons.push("Cloud cover keeps fish shallower and feeding longer");
  } else if (current.cloudCoverPct < 20 && current.isDay) {
    score -= 5;
    reasons.push("Bright sun pushes fish tight to cover and depth");
  }

  // Wind
  if (current.windMph >= 5 && current.windMph <= 15) {
    score += 8;
    reasons.push(`A ${Math.round(current.windMph)} mph ${current.windDirCompass} wind puts a helpful chop on the water`);
  } else if (current.windMph > 25) {
    score -= 15;
    reasons.push("Strong wind makes presentation and boat control difficult");
  } else if (current.windMph < 3) {
    score -= 3;
    reasons.push("Dead calm — fish get spooky; downsize and fish quieter");
  }

  // Precipitation / storms
  if (current.weatherCode >= 95) {
    score -= 30;
    reasons.push("Thunderstorms — stay off the water until they pass");
  } else if (current.weatherCode >= 61 && current.weatherCode <= 65) {
    score -= 5;
    reasons.push("Steady rain — bites can stay strong but comfort and visibility drop");
  } else if (current.weatherCode >= 51 && current.weatherCode <= 55) {
    score += 4;
    reasons.push("Light drizzle is classic feeding weather");
  }

  // Temperature extremes
  if (current.tempF < 35) {
    score -= 10;
    reasons.push("Cold snap — slow presentations way down");
  } else if (current.tempF > 95) {
    score -= 8;
    reasons.push("Extreme heat — fish dawn, dusk, and deeper water");
  }

  // Moon
  if (moon.isMajorPeriod) {
    score += 6;
    reasons.push(`${moon.name} period — stronger feeding windows and bigger tides`);
  }

  // Dawn/dusk proximity (within 90 min of sunrise or sunset)
  const sunrise = new Date(today.sunrise).getTime();
  const sunset = new Date(today.sunset).getTime();
  const t = at.getTime();
  if (Math.abs(t - sunrise) < 90 * 60000 || Math.abs(t - sunset) < 90 * 60000) {
    score += 10;
    reasons.push("Prime low-light feeding window (dawn/dusk)");
  }

  // Tide movement for coastal users
  if (tides && tides.events.length > 0) {
    const next = tides.events.find((e) => new Date(e.time).getTime() > t);
    if (next) {
      const minsToTurn = (new Date(next.time).getTime() - t) / 60000;
      if (minsToTurn > 45 && minsToTurn < 300) {
        score += 8;
        reasons.push(`Moving tide — ${next.type === "H" ? "incoming" : "outgoing"} water pushing bait`);
      } else if (minsToTurn <= 45) {
        score -= 4;
        reasons.push("Approaching slack tide — expect a lull, fish the turn");
      }
    }
  }

  score = Math.max(5, Math.min(98, Math.round(score)));
  const label =
    score >= 75 ? "Excellent conditions" :
    score >= 60 ? "Good conditions" :
    score >= 42 ? "Moderate conditions" : "Tough conditions";

  // Bait/lure category by conditions
  let baitSuggestion: string;
  if (current.weatherCode >= 61 || current.cloudCoverPct > 70) {
    baitSuggestion = "Low light and cover: moving baits with vibration/flash — spinnerbaits, spoons, paddletails, or noisy topwater";
  } else if (current.windMph > 15) {
    baitSuggestion = "Windy: heavier jigs and bottom rigs you can keep in contact; natural cut/live bait shines";
  } else if (current.cloudCoverPct < 25 && current.isDay) {
    baitSuggestion = "Bright and clear: natural colors, lighter line, slower finesse presentations near cover or depth";
  } else {
    baitSuggestion = "Mixed conditions: start with natural-colored soft plastics or live bait, adjust speed until fish respond";
  }

  return { score, label, reasons, baitSuggestion };
}
