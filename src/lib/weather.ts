/** Live weather via Open-Meteo (free, no API key). */

export type CurrentWeather = {
  tempF: number;
  feelsLikeF: number;
  windMph: number;
  windGustMph: number;
  windDirDeg: number;
  windDirCompass: string;
  pressureMb: number;
  pressureTrend: "rising" | "falling" | "steady";
  cloudCoverPct: number;
  precipIn: number;
  weatherCode: number;
  conditionText: string;
  isDay: boolean;
};

export type DailyForecast = {
  date: string;
  code: number;
  conditionText: string;
  highF: number;
  lowF: number;
  sunrise: string;
  sunset: string;
  precipChancePct: number;
  windMaxMph: number;
};

export type HourlyPoint = {
  time: string;
  tempF: number;
  precipChancePct: number;
  windMph: number;
  windDirDeg: number;
  pressureMb: number;
  cloudCoverPct: number;
  code: number;
};

export type WeatherBundle = {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyPoint[];
  timezone: string;
};

const WMO: Record<number, string> = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  56: "Freezing drizzle", 57: "Freezing drizzle", 61: "Light rain", 63: "Rain",
  65: "Heavy rain", 66: "Freezing rain", 67: "Freezing rain", 71: "Light snow",
  73: "Snow", 75: "Heavy snow", 77: "Snow grains", 80: "Light showers",
  81: "Showers", 82: "Heavy showers", 85: "Snow showers", 86: "Snow showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Severe thunderstorm",
};

export function conditionText(code: number): string {
  return WMO[code] ?? "Unknown";
}

export function compass(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function getWeather(lat: number, lng: number): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current:
      "temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day",
    hourly:
      "temperature_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "7",
    past_hours: "6",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`Weather service unavailable (${res.status})`);
  const d = await res.json();

  // pressure trend from the last 6 hours
  const nowIdx = d.hourly.time.findIndex((t: string) => t === d.current.time.slice(0, 13) + ":00");
  const idx = nowIdx >= 0 ? nowIdx : 6;
  const pNow = d.current.pressure_msl as number;
  const pPast = d.hourly.pressure_msl[Math.max(0, idx - 5)] as number;
  const delta = pNow - pPast;
  const pressureTrend = delta > 1 ? "rising" : delta < -1 ? "falling" : "steady";

  const current: CurrentWeather = {
    tempF: d.current.temperature_2m,
    feelsLikeF: d.current.apparent_temperature,
    windMph: d.current.wind_speed_10m,
    windGustMph: d.current.wind_gusts_10m,
    windDirDeg: d.current.wind_direction_10m,
    windDirCompass: compass(d.current.wind_direction_10m),
    pressureMb: pNow,
    pressureTrend,
    cloudCoverPct: d.current.cloud_cover,
    precipIn: d.current.precipitation,
    weatherCode: d.current.weather_code,
    conditionText: conditionText(d.current.weather_code),
    isDay: d.current.is_day === 1,
  };

  const daily: DailyForecast[] = d.daily.time.map((date: string, i: number) => ({
    date,
    code: d.daily.weather_code[i],
    conditionText: conditionText(d.daily.weather_code[i]),
    highF: d.daily.temperature_2m_max[i],
    lowF: d.daily.temperature_2m_min[i],
    sunrise: d.daily.sunrise[i],
    sunset: d.daily.sunset[i],
    precipChancePct: d.daily.precipitation_probability_max[i] ?? 0,
    windMaxMph: d.daily.wind_speed_10m_max[i],
  }));

  const hourly: HourlyPoint[] = d.hourly.time.map((time: string, i: number) => ({
    time,
    tempF: d.hourly.temperature_2m[i],
    precipChancePct: d.hourly.precipitation_probability[i] ?? 0,
    windMph: d.hourly.wind_speed_10m[i],
    windDirDeg: d.hourly.wind_direction_10m[i],
    pressureMb: d.hourly.pressure_msl[i],
    cloudCoverPct: d.hourly.cloud_cover[i],
    code: d.hourly.weather_code[i],
  }));

  return { current, daily, hourly, timezone: d.timezone };
}
