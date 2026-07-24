/**
 * Unit formatting + conversion. Catches are ALWAYS stored canonically in
 * imperial (inches, pounds) so existing data and the gear engine stay valid;
 * we only convert at the edges for display and for form input in metric regions.
 */

export type UnitSystem = "imperial" | "metric";

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

export const lengthUnitLabel = (system: UnitSystem) => (system === "metric" ? "cm" : "in");
export const weightUnitLabel = (system: UnitSystem) => (system === "metric" ? "kg" : "lb");

function trimNum(n: number, decimals: number): string {
  return Number(n.toFixed(decimals)).toString();
}

/** Display a stored length (inches) in the viewer's unit system, e.g. `24"` or `61 cm`. */
export function formatLength(inches: number | null | undefined, system: UnitSystem): string | null {
  if (inches == null) return null;
  if (system === "metric") return `${trimNum(inches * CM_PER_IN, 0)} cm`;
  return `${trimNum(inches, 1)}"`;
}

/** Display a stored weight (pounds) in the viewer's unit system, e.g. `5.2 lb` or `2.4 kg`. */
export function formatWeight(lb: number | null | undefined, system: UnitSystem): string | null {
  if (lb == null) return null;
  if (system === "metric") return `${trimNum(lb * KG_PER_LB, 2)} kg`;
  return `${trimNum(lb, 1)} lb`;
}

/** Convert a stored length (inches) to the number a form should show for editing. */
export function lengthForInput(inches: number | null | undefined, system: UnitSystem): string {
  if (inches == null) return "";
  return system === "metric" ? trimNum(inches * CM_PER_IN, 1) : trimNum(inches, 1);
}

export function weightForInput(lb: number | null | undefined, system: UnitSystem): string {
  if (lb == null) return "";
  return system === "metric" ? trimNum(lb * KG_PER_LB, 2) : trimNum(lb, 2);
}

/** Convert a form value in the viewer's units back to canonical inches for storage. */
export function lengthToInches(value: number | null | undefined, system: UnitSystem): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return system === "metric" ? value / CM_PER_IN : value;
}

export function weightToPounds(value: number | null | undefined, system: UnitSystem): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return system === "metric" ? value / KG_PER_LB : value;
}
