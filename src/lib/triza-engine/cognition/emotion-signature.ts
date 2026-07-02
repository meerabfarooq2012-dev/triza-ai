/**
 * ============================================================
 *  TRIZA — Emotion as Value Signature (P4) ⭐
 * ============================================================
 *
 *  Principle (P4): "Har concept ke andar ek value signature.
 *  Emotion observation ka OUTPUT hai, input nahi."
 *
 *  Emotion is NOT a primary input. Emotion is an emergent output:
 *  the weighted average of all valenced experiences (links) tied
 *  to a concept. Each link contributes with a weight that decays
 *  over time (recency) and scales with how intensely the
 *  experience was felt (intensity).
 *
 *  Math (Pillar 4):
 *    Emotion(C) = Σ(w_i × v_i) / Σ w_i
 *    w = recency × intensity
 *    recency = 1 / (1 + (now − t) / 86_400_000)
 *
 *  Where:
 *    v_i = valence of link i (in [-2, +2])
 *    t   = link timestamp (epoch ms)
 *    86_400_000 = ms per day (recency decays over DAYS)
 *
 *  Output range: [-2, +2]. Returns 0 when no links exist for the
 *  concept (no experience → no emotion).
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/** Signed valence in {-2, -1, 0, +1, +2}. */
export type EmotionValence = -2 | -1 | 0 | 1 | 2;

/** Milliseconds per day — the recency decay unit. */
const MS_PER_DAY: number = 86_400_000;

/**
 * An Emotional Link — one valenced experience tied to a concept.
 *
 * Principle: P4 — Emotion as Value Signature.
 */
export interface EmotionalLink {
  /** The concept this experience is about. */
  conceptId: string;
  /** Signed valence in {-2, -1, 0, +1, +2}. */
  valence: EmotionValence;
  /** How intensely this experience was felt, in [0, +∞). */
  intensity: number;
  /** When the experience happened (epoch ms). */
  timestamp: number;
}

/**
 * Compute the weight of a single emotional link at time `now`.
 *
 * Principle: P4 — Emotion as Value Signature.
 * Math: `w = recency × intensity`
 * where `recency = 1 / (1 + (now − t) / 86_400_000)`.
 *
 * Recency is 1 when the link is fresh (now === t) and decays
 * toward 0 as the link ages (over DAYS). Intensity scales linearly.
 *
 * @param link  the emotional link
 * @param now   current time (epoch ms)
 * @returns     the link's weight (≥ 0)
 */
export function weight(link: EmotionalLink, now: number): number {
  const ageMs: number = Math.max(0, now - link.timestamp);
  const recency: number = 1 / (1 + ageMs / MS_PER_DAY);
  const intensity: number = Math.max(0, link.intensity);
  return recency * intensity;
}

/**
 * Compute the emotion value for a concept — the weighted average
 * of all its emotional links' valences.
 *
 * Principle: P4 — Emotion as Value Signature.
 * Math: `Emotion(C) = Σ(w_i × v_i) / Σ w_i`, where the sum runs
 * over all links with `conceptId === C` and `w_i = weight(link_i, now)`.
 *
 * Output range: [-2, +2]. Returns 0 when no links exist for the
 * concept (no experience → no emotion). Division-by-zero guarded.
 *
 * @param conceptId  the concept whose emotion to compute
 * @param links      all available emotional links
 * @param now        current time (epoch ms)
 * @returns          the emotion value in [-2, +2]
 */
export function emotion(
  conceptId: string,
  links: EmotionalLink[],
  now: number,
): number {
  const relevant: EmotionalLink[] = links.filter((l) => l.conceptId === conceptId);
  if (relevant.length === 0) return 0;

  let numerator: number = 0;
  let denominator: number = 0;
  for (const link of relevant) {
    const w: number = weight(link, now);
    numerator += w * link.valence;
    denominator += w;
  }
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Label an emotion value with a discrete feeling word.
 *
 * Principle: P4 — Emotion as Value Signature.
 * Math: thresholds on the [-2, +2] emotion value.
 *
 *   [-2.0, -1.5)  → anguish
 *   [-1.5, -0.5)  → sad
 *   [-0.5, +0.5)  → neutral
 *   [+0.5, +1.5)  → happy
 *   [+1.5, +2.0]  → joyful
 *
 * @param value an emotion value (typically in [-2, +2])
 * @returns     the feeling label
 */
export function emotionLabel(value: number): string {
  if (value < -1.5) return 'anguish';
  if (value < -0.5) return 'sad';
  if (value < 0.5) return 'neutral';
  if (value < 1.5) return 'happy';
  return 'joyful';
}
