/**
 * ============================================================================
 * P14 — AGENCY = RESISTANCE  ⭐ ORIGINAL CONTRIBUTION
 * ============================================================================
 *
 * Principle: Agency = Resistance. Jo cheez pakarne par resist karti hai, wo
 * khud move karti hai. Jo resist nahi karti — wo move hoti hai kisi aur ki
 * wajah se. (The thing that resists being grasped moves itself. The thing
 * that does not resist is moved by something else.)
 *
 * P14 — ORIGINAL CONTRIBUTION. Agency = Resistance. Jo cheez pakarne par
 * resist karti hai, wo khud move karti hai. This is TRIZA's unique
 * contribution to AI theory.
 *
 * Math: `Agency(O) = self_caused / (self_caused + other_caused)`.
 *   - 1  = fully self-caused (alive, autonomous — the thing moves itself).
 *   - 0  = fully other-caused (passive — the thing is moved by external force).
 *   - 0.5 = balanced.
 *
 * Resistance is the empirical signal of agency: when an observation's
 * actual change diverges from the expected change, the observation
 * "resisted" the expectation. High resistance ⇒ high agency.
 *
 * This file is self-contained: no imports.
 * ============================================================================
 */

/** Causal attribution for a single observation: how much was self-caused
 *  vs other-caused. */
export interface CausalAttribution {
  observationId: string;
  selfCaused: number;
  otherCaused: number;
}

/** Input shape for resistanceScore — what was observed vs what changed. */
export interface ResistanceInput {
  features: string[];
  expectedChange?: string[];
  actualChange: string[];
}

/**
 * Compute the agency of an observation from its causal attribution.
 *
 * Principle: P14 — Agency = Resistance (ORIGINAL).
 * Math: `Agency(O) = self_caused / (self_caused + other_caused)`.
 * Returns a number in [0, 1]. 1 = fully self-caused (alive), 0 = fully
 * other-caused (passive). If both counts are 0 (no causal factors at all),
 * returns 0 — a thing with no causal forces acting on it is treated as
 * passive rather than autonomous.
 *
 * @param attribution the self/other causal counts for one observation
 */
export function agency(attribution: CausalAttribution): number {
  const total: number = attribution.selfCaused + attribution.otherCaused;
  if (total <= 0) {
    return 0;
  }
  return attribution.selfCaused / total;
}

/**
 * Decide whether an observation is "alive" (autonomous) based on its
 * agency score.
 *
 * Principle: P14 — Agency = Resistance (ORIGINAL).
 * Math: `isAlive = agency ≥ threshold` (default 0.5). "Jo resist karti hai
 * wo zinda hai." — what resists is alive. At exactly 0.5 the observation
 * is considered alive (≥ is intentional).
 *
 * @param agencyValue the agency score in [0, 1]
 * @param threshold cutoff above which the observation is considered alive
 */
export function isAlive(agencyValue: number, threshold: number = 0.5): boolean {
  return agencyValue >= threshold;
}

/**
 * Score how strongly an observation resisted its expectation.
 *
 * Principle: P14 — Agency = Resistance (ORIGINAL).
 * Math: `Resistance = 1 − (matched_changes / total_expected_changes)`.
 * A "matched" change is an expected change that also appears in the actual
 * changes. When all expected changes occurred, resistance = 0 (no pushback).
 * When none occurred, resistance = 1 (full resistance). If no changes were
 * expected, returns 0 (nothing to resist against).
 *
 * @param observation the observation with features, expected + actual changes
 */
export function resistanceScore(observation: ResistanceInput): number {
  const expected: string[] = observation.expectedChange ?? [];
  if (expected.length === 0) {
    return 0;
  }
  const actualSet: Set<string> = new Set(observation.actualChange);
  const matched: number = expected.filter((e) => actualSet.has(e)).length;
  return 1 - matched / expected.length;
}

/**
 * Map an agency score to a qualitative label.
 *
 * Principle: P14 — Agency = Resistance (ORIGINAL).
 * Math: piecewise labels:
 *   - 0   ≤ a < 0.2  → "passive"
 *   - 0.2 ≤ a < 0.5  → "reactive"
 *   - 0.5 ≤ a < 0.8  → "active"
 *   - 0.8 ≤ a ≤ 1.0  → "autonomous"
 *
 * @param value agency score in [0, 1]
 */
export function agencyLabel(value: number): string {
  if (value < 0.2) {
    return 'passive';
  }
  if (value < 0.5) {
    return 'reactive';
  }
  if (value < 0.8) {
    return 'active';
  }
  return 'autonomous';
}
