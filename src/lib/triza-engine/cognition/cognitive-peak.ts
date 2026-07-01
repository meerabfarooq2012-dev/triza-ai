/**
 * ============================================================================
 * P29 — DUAL-PHASE COGNITIVE PEAK
 * ============================================================================
 *
 * Principle (P29): Cognitive capacity is not flat across the day — it
 * follows a DUAL-PEAK circadian rhythm. There is a morning PEAK, an
 * afternoon TROUGH, and an evening REBOUND. The agent should learn
 * hardest material during a peak and either rest or do light work
 * during a trough.
 *
 * Circadian mapping (24-hour clock, hourOfDay ∈ [0, 24)):
 *   - 09–12  → 'peak'     (morning high capacity)
 *   - 13–15  → 'trough'   (post-lunch dip)
 *   - 16–18  → 'rebound'  (evening recovery)
 *   - else   → nearest of the three (clamped to the closest phase)
 *
 * Capacity multipliers:
 *   - peak     → 1.2  (20% above baseline)
 *   - rebound  → 1.0  (baseline)
 *   - trough   → 0.7  (30% below baseline)
 *
 * Optimal learning window: ANY phase is 'peak' AND multiplier > 1.0.
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** A cognitive circadian phase. */
export type CognitivePhase = 'peak' | 'trough' | 'rebound';

/** Phase boundaries (hours of day, inclusive lower, exclusive upper). */
export const PEAK_HOURS: [number, number] = [9, 12];
export const TROUGH_HOURS: [number, number] = [13, 15];
export const REBOUND_HOURS: [number, number] = [16, 18];

/** Capacity multipliers per phase. */
export const PHASE_MULTIPLIERS: Record<CognitivePhase, number> = {
  peak: 1.2,
  rebound: 1.0,
  trough: 0.7,
};

/**
 * Classify the cognitive phase for a given hour of day.
 *
 * Principle: P29.
 *
 *   hourOfDay ∈ [9, 12)  → 'peak'
 *   hourOfDay ∈ [13, 15) → 'trough'
 *   hourOfDay ∈ [16, 18) → 'rebound'
 *   else                  → nearest of the three
 *
 * "Nearest" is computed by distance to the centre of each phase window.
 * Hour is normalised into [0, 24) via modular arithmetic.
 *
 * @param hourOfDay Hour of day (0–24, fractional allowed).
 * @returns         The cognitive phase.
 */
export function cognitivePhase(hourOfDay: number): CognitivePhase {
  let h = Number(hourOfDay);
  if (!Number.isFinite(h)) h = 0;
  // Normalise into [0, 24).
  h = ((h % 24) + 24) % 24;

  if (h >= PEAK_HOURS[0] && h < PEAK_HOURS[1]) return 'peak';
  if (h >= TROUGH_HOURS[0] && h < TROUGH_HOURS[1]) return 'trough';
  if (h >= REBOUND_HOURS[0] && h < REBOUND_HOURS[1]) return 'rebound';

  // Nearest phase by distance to phase centre.
  const peakCentre = (PEAK_HOURS[0] + PEAK_HOURS[1]) / 2;
  const troughCentre = (TROUGH_HOURS[0] + TROUGH_HOURS[1]) / 2;
  const reboundCentre = (REBOUND_HOURS[0] + REBOUND_HOURS[1]) / 2;

  const dPeak = circularDistance(h, peakCentre);
  const dTrough = circularDistance(h, troughCentre);
  const dRebound = circularDistance(h, reboundCentre);

  const minD = Math.min(dPeak, dTrough, dRebound);
  if (minD === dPeak) return 'peak';
  if (minD === dRebound) return 'rebound';
  return 'trough';
}

/**
 * Capacity multiplier for a phase.
 *
 * Principle: P29.
 *
 *   peak     → 1.2
 *   rebound  → 1.0
 *   trough   → 0.7
 *
 * Unknown phases default to 1.0 (baseline).
 *
 * @param phase One of 'peak' | 'trough' | 'rebound' (or any string).
 * @returns     The capacity multiplier.
 */
export function capacityMultiplier(phase: string): number {
  if (phase === 'peak') return PHASE_MULTIPLIERS.peak;
  if (phase === 'rebound') return PHASE_MULTIPLIERS.rebound;
  if (phase === 'trough') return PHASE_MULTIPLIERS.trough;
  return 1.0; // baseline default for unknown phases
}

/**
 * Decide whether the current window is optimal for learning.
 *
 * Principle: P29. A window is optimal if ANY of the observed phases is a
 * 'peak' AND the multiplier is above 1.0 (i.e., capacity is enhanced).
 *
 * @param phases     Array of phase labels observed (e.g. across hours).
 * @param multiplier Current capacity multiplier.
 * @returns          True if this is an optimal learning window.
 */
export function optimalLearningWindow(
  phases: string[],
  multiplier: number
): boolean {
  if (!Array.isArray(phases) || phases.length === 0) return false;
  if (!Number.isFinite(multiplier) || multiplier <= 1.0) return false;
  return phases.some((p) => p === 'peak');
}

/**
 * Compute the hour of the NEXT peak (09:00).
 *
 * Principle: P29.
 *
 *   - If currentHour < 9 → next peak is today at 9.
 *   - Else (currentHour ≥ 9) → next peak is tomorrow at 9.
 *
 * The returned value is always in [0, 24).
 *
 * @param currentHour Current hour of day (0–24, fractional allowed).
 * @returns           Hour of the next peak (always 9, by definition).
 */
export function nextPeak(currentHour: number): number {
  let h = Number(currentHour);
  if (!Number.isFinite(h)) h = 0;
  h = ((h % 24) + 24) % 24;
  // The peak hour is 9 (start of PEAK_HOURS). If we are already at or
  // past 9, the next peak is tomorrow at 9 — still 9 in 24-hour terms.
  // We always return 9 (the hour-of-day of the next peak window start).
  if (h < PEAK_HOURS[0]) {
    return PEAK_HOURS[0]; // today, 9 AM
  }
  return PEAK_HOURS[0]; // tomorrow, 9 AM (same hour-of-day)
}

// ---- internal helper -----------------------------------------------------

/**
 * Smallest circular distance between two hour-of-day values, on a 24-hour
 * ring. Always returns a value in [0, 12].
 */
function circularDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 24;
  return d > 12 ? 24 - d : d;
}
