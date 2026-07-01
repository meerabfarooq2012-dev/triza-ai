/**
 * P12 — Self as Anchor (Layer II: Structure & Composition)
 * --------------------------------------------------------
 * Principle: AI ka pehla frame khud AI hona chahiye. Phir har observation
 * "self vs not-self" ke contrast se categorize ho. (The AI's first frame
 * should be itself. Then every observation gets categorized by the contrast
 * "self vs not-self".) The self is the reference point against which all
 * else is measured.
 *
 * Math: `Self = {actions, internal, meta} + Similarity(O, Self)`.
 * Similarity is the Jaccard index between the observation's feature set and
 * the flattened self-signature. The result is a 0–1 number used to bucket
 * observations as `self`, `not-self`, or `ambiguous`.
 *
 * This file is self-contained: no imports.
 */

/** The Self model — what the AI can do, what it currently is, what it knows about itself. */
export interface SelfModel {
  actions: string[];
  internal: string[];
  meta: string[];
}

/**
 * TRIZA's default self model. The first frame is always "I am TRIZA".
 */
export const DEFAULT_SELF: SelfModel = {
  actions: ['observe', 'think', 'respond', 'learn', 'reflect'],
  internal: ['curious', 'neutral'],
  meta: [
    'I am TRIZA',
    'I am transparent',
    'I learn from feedback',
  ],
};

/**
 * Flatten a SelfModel into a single feature array.
 *
 * Principle: P12 — Self as Anchor.
 * Math: `selfSignature(Self) = Self.actions ∪ Self.internal ∪ Self.meta`.
 * Lowercased so that similarity comparisons are case-insensitive.
 *
 * @param self the self model
 * @returns the flattened, lowercased feature list
 */
export function selfSignature(self: SelfModel): string[] {
  return [
    ...self.actions,
    ...self.internal,
    ...self.meta,
  ].map((s) => s.toLowerCase());
}

/**
 * Jaccard similarity between an observation's features and the self signature.
 *
 * Principle: P12 — Self as Anchor.
 * Math: `Similarity(O, Self) = |O ∩ Self| / |O ∪ Self|` (Jaccard index).
 * Returns a number in [0, 1]. 1 = identical to self, 0 = no overlap.
 *
 * @param observation feature list of the observation
 * @param self the self model to compare against
 */
export function similarityToSelf(
  observation: string[],
  self: SelfModel,
): number {
  const sig: Set<string> = new Set(selfSignature(self));
  const obs: Set<string> = new Set(
    observation.map((s) => s.toLowerCase()),
  );
  if (sig.size === 0 && obs.size === 0) {
    return 0;
  }
  let intersection: number = 0;
  for (const token of obs) {
    if (sig.has(token)) {
      intersection += 1;
    }
  }
  const union: number = sig.size + obs.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Categorize an observation relative to self: `self`, `not-self`, or
 * `ambiguous`.
 *
 * Principle: P12 — Self as Anchor.
 * Math: `category = 'self' if sim ≥ threshold; 'not-self' if sim < 0.1;
 *         'ambiguous' otherwise`. Default threshold = 0.3.
 *
 * @param observation feature list of the observation
 * @param self the self model
 * @param threshold similarity above which the observation is categorized as
 *                  `self` (default 0.3)
 */
export function categorizeBySelf(
  observation: string[],
  self: SelfModel,
  threshold: number = 0.3,
): { category: 'self' | 'not-self' | 'ambiguous'; similarity: number } {
  const similarity: number = similarityToSelf(observation, self);
  let category: 'self' | 'not-self' | 'ambiguous';
  if (similarity >= threshold) {
    category = 'self';
  } else if (similarity < 0.1) {
    category = 'not-self';
  } else {
    category = 'ambiguous';
  }
  return { category, similarity };
}
