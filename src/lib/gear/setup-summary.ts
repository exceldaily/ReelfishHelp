import type { UserSetup } from "@/db/schema";

/** One-line human description of a saved Setup Builder rig. */
export function setupSummary(s: UserSetup): string {
  const rod = s.rod as { type?: string | null; power?: string | null } | null;
  const reel = s.reel as { type?: string | null; size?: number | null } | null;
  const line = s.line as { type?: string | null; lb?: number | null } | null;
  const leader = s.leader as { type?: string | null; lb?: number | null } | null;
  const bits = [
    rod?.power ? `${rod.power} ${rod.type ?? "rod"}`.trim() : rod?.type,
    line?.lb ? `${line.lb} lb ${line.type ?? "line"}` : line?.type,
    leader?.lb && leader.type && leader.type !== "none" ? `${leader.lb} lb ${leader.type} leader` : null,
    reel?.size ? `${reel.size}-size reel` : null,
    s.method,
    s.water,
  ].filter(Boolean);
  return bits.join(" · ");
}
