/**
 * ============================================================
 *  TRIZA — Surprise (P6)
 * ============================================================
 *
 *  Principle (P6): "Expectation tootne se seekhna."
 *  Surprise = the mismatch between what we OBSERVED and what we
 *  EXPECTED (i.e. what we would have RECONSTRUCTED from memory).
 *  Surprise is the learning trigger: when the observation doesn't
 *  match the reconstruction, the model has something new to learn.
 *
 *  Math (Pillar 6):
 *    Surprise(O) = mismatch(O, Reconstruct(C))
 *    mismatch(a, b) = 1 - structure_match(a, b)
 *
 *  Where:
 *    expectation(memory, O) = Reconstruct(O, memory)   (P5)
 *    structure_match        = Jaccard similarity        (P5)
 *
 *  Imports: structureMatch, reconstruct from reconstruction.ts.
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

import { reconstruct, structureMatch } from './reconstruction';

/**
 * Expected features — what the model would have reconstructed from
 * memory given the observation's features.
 *
 * Principle: P6 — Surprise.
 * Math: `expectation(memory, O) = Reconstruct(O, memory)`.
 *
 * @param memory       memory of known concepts (each a feature list)
 * @param observation  observed features
 * @returns            the expected (reconstructed) feature set
 */
export function expectation(memory: string[][], observation: string[]): string[] {
  return reconstruct(observation, memory);
}

/**
 * Result of a surprise computation.
 *
 * Principle: P6 — Surprise.
 */
export interface SurpriseResult {
  /** Surprise value in [0, 1]. 0 = perfectly expected, 1 = totally novel. */
  value: number;
  /** Features the model expected but the observation did NOT contain. */
  mismatchedFeatures: string[];
  /** Features the observation contained but the model did NOT expect. */
  novelFeatures: string[];
}

/**
 * Compute surprise for an observation against memory.
 *
 * Principle: P6 — Surprise.
 * Math:
 *   expected  = expectation(memory, observation)
 *   value     = 1 - structure_match(observation, expected)
 *   mismatchedFeatures = expected − observation
 *   novelFeatures      = observation − expected
 *
 * `value` is in [0, 1]: 0 means the observation perfectly matched
 * the reconstruction (no surprise), 1 means total mismatch (full
 * surprise).
 *
 * @param observation  observed features
 * @param memory       memory of known concepts
 * @returns            the surprise value plus the mismatched and novel features
 */
export function surprise(observation: string[], memory: string[][]): SurpriseResult {
  const expected: string[] = expectation(memory, observation);
  const value: number = 1 - structureMatch(observation, expected);

  const obsSet: Set<string> = new Set(observation ?? []);
  const expSet: Set<string> = new Set(expected);

  // expected but missing in observation
  const mismatchedFeatures: string[] = expected.filter((f) => !obsSet.has(f));
  // present but unexpected
  const novelFeatures: string[] = (observation ?? []).filter((f) => !expSet.has(f));

  return {
    value,
    mismatchedFeatures,
    novelFeatures,
  };
}

/**
 * Threshold check: is this surprise value surprising enough?
 *
 * Principle: P6 — Surprise.
 * Math: `isSurprising(s) = s > threshold` (default threshold = 0.5).
 *
 * @param surpriseValue  the surprise value (typically in [0, 1])
 * @param threshold      surprise threshold (default 0.5)
 * @returns              true if the value exceeds the threshold
 */
export function isSurprising(surpriseValue: number, threshold: number = 0.5): boolean {
  return surpriseValue > threshold;
}
