/**
 * Feature flags.
 * Photo fish ID is hidden site-wide until ANTHROPIC_API_KEY is configured —
 * add the key (and redeploy) to bring the feature back, no code changes needed.
 */
export function fishIdEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
