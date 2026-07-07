/** Moon phase computed locally (no service needed). */

export type MoonInfo = {
  phase: number; // 0..1 (0 = new, 0.5 = full)
  name: string;
  emoji: string;
  illuminationPct: number;
  isMajorPeriod: boolean; // new or full ±1.5 days — classically better fishing
};

const SYNODIC = 29.53058867;
// Reference new moon: 2000-01-06 18:14 UTC
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

export function getMoon(date: Date = new Date()): MoonInfo {
  const daysSince = (date.getTime() - REF_NEW_MOON) / 86400000;
  const phase = ((daysSince % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC;

  let name: string;
  let emoji: string;
  if (phase < 0.033 || phase > 0.967) { name = "New Moon"; emoji = "🌑"; }
  else if (phase < 0.216) { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (phase < 0.284) { name = "First Quarter"; emoji = "🌓"; }
  else if (phase < 0.467) { name = "Waxing Gibbous"; emoji = "🌔"; }
  else if (phase < 0.533) { name = "Full Moon"; emoji = "🌕"; }
  else if (phase < 0.716) { name = "Waning Gibbous"; emoji = "🌖"; }
  else if (phase < 0.784) { name = "Last Quarter"; emoji = "🌗"; }
  else { name = "Waning Crescent"; emoji = "🌘"; }

  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const daysFromNew = Math.min(phase, 1 - phase) * SYNODIC;
  const daysFromFull = Math.abs(phase - 0.5) * SYNODIC;
  const isMajorPeriod = daysFromNew <= 1.5 || daysFromFull <= 1.5;

  return {
    phase,
    name,
    emoji,
    illuminationPct: Math.round(illumination * 100),
    isMajorPeriod,
  };
}
