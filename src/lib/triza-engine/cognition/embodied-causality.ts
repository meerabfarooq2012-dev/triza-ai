/**
 * ============================================================
 *  TRIZA — Embodied Causality (P3)
 * ============================================================
 *
 *  Principle (P3): "Maani experience se aata hai."
 *  Meaning comes from embodied experience — from cause→effect
 *  links tagged with a valence (how good/bad the outcome felt).
 *  A concept's meaning is the sum of the causal experiences
 *  that involve it.
 *
 *  Math (Pillar 3):
 *    L = (cause, effect, valence)
 *    v ∈ { -2, -1, 0, +1, +2 }
 *
 *  Where:
 *    cause    = the source concept id
 *    effect   = the resulting concept id
 *    valence  = signed value: -2 harmful ... +2 beneficial
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/** Signed valence in {-2, -1, 0, +1, +2}. */
export type Valence = -2 | -1 | 0 | 1 | 2;

/**
 * A Causal Link — an embodied cause→effect edge with valence.
 *
 * Math: `L = (cause, effect, valence)`.
 */
export interface CausalLink {
  /** The source concept id (what acts). */
  cause: string;
  /** The resulting concept id (what is acted upon / produced). */
  effect: string;
  /** Signed outcome valence in {-2, -1, 0, +1, +2}. */
  valence: Valence;
  /** Confidence in the link, in [0, 1]. Defaults to 1. */
  confidence: number;
}

/**
 * CausalMemory — a store of embodied cause→effect links.
 *
 * Principle: P3 — Embodied Causality.
 * Supports forward lookup (effects of a cause), backward lookup
 * (causes of an effect), and valence summation (the felt-meaning
 * of a cause is the signed sum of all its effects' valences).
 */
export class CausalMemory {
  private readonly links: CausalLink[] = [];

  /**
   * Add a causal link to memory.
   *
   * Principle: P3 — Embodied Causality.
   * Math: stores `L = (cause, effect, valence)` with a confidence.
   *
   * @param cause      source concept id
   * @param effect     resulting concept id
   * @param valence    signed valence in {-2, -1, 0, +1, +2}
   * @param confidence confidence in the link, in [0, 1] (default 1)
   */
  add(cause: string, effect: string, valence: Valence, confidence: number = 1): void {
    this.links.push({
      cause,
      effect,
      valence,
      confidence: Math.max(0, Math.min(1, confidence)),
    });
  }

  /** All stored causal links (snapshot). */
  all(): CausalLink[] {
    return [...this.links];
  }

  /**
   * Forward lookup — all links where `cause` is the source.
   *
   * Principle: P3 — Embodied Causality.
   * Math: `effectsOf(c) = { L : L.cause = c }`.
   */
  effectsOf(cause: string): CausalLink[] {
    return this.links.filter((l) => l.cause === cause);
  }

  /**
   * Backward lookup — all links where `effect` is the result.
   *
   * Principle: P3 — Embodied Causality.
   * Math: `causesOf(e) = { L : L.effect = e }`.
   */
  causesOf(effect: string): CausalLink[] {
    return this.links.filter((l) => l.effect === effect);
  }

  /**
   * Sum the valences of all links FROM this cause.
   *
   * Principle: P3 — Embodied Causality.
   * Math: `valenceSum(c) = Σ L.valence  for L in effectsOf(c)`.
   * This is the felt-meaning of the cause — positive if it tends to
   * produce good outcomes, negative if it tends to produce bad ones.
   */
  valenceSum(cause: string): number {
    return this.links
      .filter((l) => l.cause === cause)
      .reduce((sum, l) => sum + l.valence, 0);
  }
}

/**
 * Explain a valence value as a human-readable label.
 *
 * Principle: P3 — Embodied Causality.
 * Math: `v ∈ {-2, -1, 0, +1, +2}` mapped to labels.
 *
 *   -2 → harmful
 *   -1 → negative
 *    0 → neutral
 *   +1 → positive
 *   +2 → beneficial
 *
 * Values outside the canonical set are rounded to the nearest integer
 * in [-2, +2] before labeling.
 *
 * @param v a valence value (typically in [-2, +2])
 * @returns a human-readable label
 */
export function explainValence(v: number): string {
  const clamped: number = Math.max(-2, Math.min(2, v));
  const rounded: number = Math.round(clamped);
  switch (rounded) {
    case -2:
      return 'harmful';
    case -1:
      return 'negative';
    case 0:
      return 'neutral';
    case 1:
      return 'positive';
    case 2:
      return 'beneficial';
    default:
      return 'neutral';
  }
}

/**
 * Create a fresh CausalMemory seeded with ~10 default causal links
 * reflecting common embodied experience.
 *
 * Principle: P3 — Embodied Causality.
 * Seed examples:
 *   study → knowledge (+2)
 *   neglect → ignorance (-2)
 *   exercise → health (+2)
 *   smoking → disease (-2)
 *   kindness → trust (+1)
 *   lying → distrust (-1)
 *   practice → skill (+2)
 *   procrastination → stress (-1)
 *   rest → recovery (+1)
 *   overeating → discomfort (-1)
 *
 * @returns a freshly-seeded CausalMemory
 */
export function createDefaultCausalMemory(): CausalMemory {
  const mem: CausalMemory = new CausalMemory();
  const seed: Array<[string, string, Valence]> = [
    ['study', 'knowledge', 2],
    ['neglect', 'ignorance', -2],
    ['exercise', 'health', 2],
    ['smoking', 'disease', -2],
    ['kindness', 'trust', 1],
    ['lying', 'distrust', -1],
    ['practice', 'skill', 2],
    ['procrastination', 'stress', -1],
    ['rest', 'recovery', 1],
    ['overeating', 'discomfort', -1],
  ];
  for (const [cause, effect, v] of seed) mem.add(cause, effect, v);
  return mem;
}
