/**
 * ============================================================
 *  TRIZA — Emotional Identity (Persistent Mood System)
 * ============================================================
 *
 *  P4 (emotion-signature.ts) computes per-concept emotion as
 *  `Emotion(C) = Σ(w_i × v_i) / Σ w_i` — a single observation's
 *  emotional value, used as a transparency signal.
 *
 *  This module is COMPLEMENTARY: it maintains TRIZA's OVERALL
 *  emotional state across a whole session — TRIZA's *mood* —
 *  built up from a moving average of recent per-concept
 *  emotion observations, weighted by recency.
 *
 *  Why this is deeper than WIRE-1's tone-prepend:
 *    - WIRE-1 prepends a tone sentence based on the CURRENT
 *      observation's emotion. State-less. Resets every turn.
 *    - EmotionalIdentity accumulates: 3 happy messages in a
 *      row push mood into "joyful" territory, and a single
 *      negative message does NOT immediately flip TRIZA into
 *      despair — momentum holds the mood (TRIZA is still warm
 *      from the positive run). Repeated negatives eventually
 *      pull TRIZA down. This is what makes TRIZA feel like it
 *      has a *persistent emotional identity*, not a per-turn
 *      reflex.
 *
 *  Math:
 *    mood_new = mood_old × momentum + value × (1 − momentum)
 *      (exponential moving average — momentum ∈ [0.3, 0.9])
 *
 *    volatility = stddev(last ≤10 history values) / 2
 *      (normalized to [0, 1]; emotion values are in [-2, +2])
 *
 *    momentum = clamp(0.5 + (1 − volatility) × 0.3, 0.3, 0.9)
 *      (stable recent emotions → sticky mood; volatile → loose)
 *
 *    moodLabel thresholds on the [-2, +2] mood value:
 *      ≥ 1.5  → ecstatic
 *      ≥ 1.0  → joyful
 *      ≥ 0.5  → happy
 *      ≥ 0.1  → content
 *      > −0.1 → neutral
 *      > −0.5 → sad
 *      > −1.0 → frustrated
 *      > −1.5 → upset
 *      else   → despairing
 *
 *  Determinism: observe() uses no RNG and no real-clock drift
 *  beyond the supplied value/trigger inputs. All math is pure
 *  arithmetic. serialize()/deserialize() use JSON. The class
 *  is fully testable without time mocks (timestamps are only
 *  stored, not used in the mood math — recency weighting is
 *  done by the capped-length history list, not by time decay).
 *
 *  Zero external APIs. Pure TypeScript. CPU-only.
 * ============================================================
 */

/** Maximum number of recent emotion observations to retain. */
const HISTORY_CAP: number = 20;

/** Number of recent observations used to compute volatility. */
const VOLATILITY_WINDOW: number = 10;

/** Emotion values lie in [-2, +2], so dividing stddev by 2 normalizes to [0, 1]. */
const EMOTION_RANGE: number = 2;

/**
 * Discrete mood label — the human-readable form of `mood`.
 *
 * Ordered from most-negative to most-positive so the threshold
 * ladder in `moodLabelFromValue` reads top-down.
 */
export type MoodLabel =
  | 'despairing'
  | 'upset'
  | 'frustrated'
  | 'sad'
  | 'neutral'
  | 'content'
  | 'happy'
  | 'joyful'
  | 'ecstatic';

/**
 * One observed emotion value, kept in history for volatility
 * computation and for transparency inspection.
 */
export interface EmotionObservation {
  /** The per-concept emotion value observed (in [-2, +2]). */
  value: number;
  /** Epoch ms when the observation was made. */
  timestamp: number;
  /** What triggered this observation (e.g. "concept:water"). */
  trigger: string;
}

/**
 * TRIZA's persistent emotional state across a session.
 *
 * Principle: P4+ (Emotional Identity — extension of P4 from
 * per-concept emotion to session-level mood).
 */
export interface EmotionalState {
  /** Current mood, a moving average in [-2, +2]. */
  mood: number;
  /** Discrete label for `mood`. */
  moodLabel: MoodLabel;
  /**
   * Emotional momentum ∈ [0.3, 0.9]. High momentum = mood is
   * sticky, hard to shift (recent emotions were stable).
   */
  momentum: number;
  /** Recent emotion observations (last ≤20). */
  history: EmotionObservation[];
  /** Volatility ∈ [0, 1] — how much mood swings between turns. */
  volatility: number;
}

/**
 * Map a raw mood value to its discrete label.
 *
 * Principle: P4+ — Emotional Identity.
 * Math: thresholds on the [-2, +2] mood value.
 *
 * @param value  the mood value (typically in [-2, +2])
 * @returns       the mood label
 */
export function moodLabelFromValue(value: number): MoodLabel {
  if (value >= 1.5) return 'ecstatic';
  if (value >= 1.0) return 'joyful';
  if (value >= 0.5) return 'happy';
  if (value >= 0.1) return 'content';
  if (value > -0.1) return 'neutral';
  if (value > -0.5) return 'sad';
  if (value > -1.0) return 'frustrated';
  if (value > -1.5) return 'upset';
  return 'despairing';
}

/**
 * Clamp a number to a closed interval.
 *
 * @param x     the value to clamp
 * @param lower inclusive lower bound
 * @param upper inclusive upper bound
 * @returns      x clamped to [lower, upper]
 */
function clamp(x: number, lower: number, upper: number): number {
  if (x < lower) return lower;
  if (x > upper) return upper;
  return x;
}

/**
 * Population standard deviation of a list of numbers.
 *
 * @param values  the numbers (must have length ≥ 1; returns 0 for empty)
 * @returns        population stddev (square root of population variance)
 */
function populationStddev(values: number[]): number {
  if (values.length === 0) return 0;
  let sum: number = 0;
  for (const v of values) sum += v;
  const mean: number = sum / values.length;
  let acc: number = 0;
  for (const v of values) acc += (v - mean) * (v - mean);
  return Math.sqrt(acc / values.length);
}

/**
 * EmotionalIdentity — TRIZA's persistent mood across a session.
 *
 * Principle: P4+ — Emotional Identity (extension of P4).
 *
 * Usage:
 *   const id = new EmotionalIdentity()
 *   id.observe(2, 'concept:good-news')   // happy observation
 *   id.current().moodLabel               // → 'happy'
 *   id.toneModifier()                    // → { prepend: 'This sparks...', exclamationDensity: ... }
 */
export class EmotionalIdentity {
  private state: EmotionalState = {
    mood: 0,
    moodLabel: 'neutral',
    momentum: 0.5,
    history: [],
    volatility: 0.3,
  };

  /**
   * Apply a new emotion observation. Returns the updated state
   * (also stored internally).
   *
   * Principle: P4+ — Emotional Identity.
   * Math:
   *   1. Push {value, timestamp=now, trigger} to history (cap 20).
   *   2. mood_new = mood_old × momentum + value × (1 − momentum)
   *      (exponential moving average — momentum ∈ [0.3, 0.9])
   *   3. volatility = stddev(last ≤10 history values) / 2
   *      (normalized to [0, 1] because emotion ∈ [-2, +2])
   *   4. momentum = clamp(0.5 + (1 − volatility) × 0.3, 0.3, 0.9)
   *      (stable recent emotions → sticky mood; volatile → loose)
   *   5. moodLabel from mood value via `moodLabelFromValue`.
   *
   * @param value    the per-concept emotion value (in [-2, +2])
   * @param trigger  what produced this observation (for transparency)
   * @returns         the updated emotional state (a fresh copy)
   */
  observe(value: number, trigger: string): EmotionalState {
    // 1. Push to history (cap at HISTORY_CAP, FIFO eviction)
    this.state.history.push({
      value,
      timestamp: Date.now(),
      trigger,
    });
    if (this.state.history.length > HISTORY_CAP) {
      // Drop oldest entries until we are back under the cap.
      this.state.history.splice(0, this.state.history.length - HISTORY_CAP);
    }

    // 2. Exponential moving average: new mood is a convex
    //    combination of the old mood and the fresh value.
    //    momentum ∈ [0.3, 0.9] controls how much the past
    //    weighs vs the present.
    const m: number = this.state.momentum;
    this.state.mood = m * this.state.mood + (1 - m) * value;

    // 3. Volatility = stddev of last ≤10 history values, then
    //    normalize by dividing by the emotion range (2) so the
    //    result lands in [0, 1].
    const windowStart: number = Math.max(0, this.state.history.length - VOLATILITY_WINDOW);
    const recentValues: number[] = this.state.history
      .slice(windowStart)
      .map((o) => o.value);
    const rawStddev: number = populationStddev(recentValues);
    this.state.volatility = clamp(rawStddev / EMOTION_RANGE, 0, 1);

    // 4. Momentum = clamp(0.5 + (1 − volatility) × 0.3, 0.3, 0.9).
    //    Low volatility → high momentum (mood is sticky).
    //    High volatility → low momentum (mood is loose, reacts fast).
    this.state.momentum = clamp(0.5 + (1 - this.state.volatility) * 0.3, 0.3, 0.9);

    // 5. Discrete label from the new mood value.
    this.state.moodLabel = moodLabelFromValue(this.state.mood);

    return this.current();
  }

  /**
   * Get the current emotional state (a fresh shallow-ish copy —
   * history array is cloned so callers cannot mutate internals).
   *
   * Principle: P4+ — Emotional Identity.
   */
  current(): EmotionalState {
    return {
      mood: this.state.mood,
      moodLabel: this.state.moodLabel,
      momentum: this.state.momentum,
      history: this.state.history.slice(),
      volatility: this.state.volatility,
    };
  }

  /**
   * Get a tone modifier for self-expression.
   *
   * Principle: P4+ — Emotional Identity.
   *
   * Mapping (mood value → prepend + exclamationDensity):
   *   mood ≤ −1.0  → "I'm feeling heavy about this. "
   *                  exclamationDensity 0.0 (calm, no "!")
   *   mood ≤ −0.5  → "This sits uncomfortably with me. "
   *                  exclamationDensity 0.1
   *   mood ≥ +1.0  → "I'm genuinely energized by this! "
   *                  exclamationDensity 0.9
   *   mood ≥ +0.5  → "This sparks something in me. "
   *                  exclamationDensity 0.6
   *   else         → '' (neutral, no prepend)
   *                  exclamationDensity 0.3
   *
   * `exclamationDensity` is a 0..1 hint for the response layer:
   *   - > 0.5 → replace the last "." with "!" (energetic voice)
   *   - < 0.2 → replace any "!" with "." (calmer voice)
   *
   * @returns {prepend, exclamationDensity}
   */
  toneModifier(): { prepend: string; exclamationDensity: number } {
    const mood: number = this.state.mood;
    if (mood <= -1.0) {
      return { prepend: "I'm feeling heavy about this. ", exclamationDensity: 0.0 };
    }
    if (mood <= -0.5) {
      return { prepend: 'This sits uncomfortably with me. ', exclamationDensity: 0.1 };
    }
    if (mood >= 1.0) {
      return { prepend: "I'm genuinely energized by this! ", exclamationDensity: 0.9 };
    }
    if (mood >= 0.5) {
      return { prepend: 'This sparks something in me. ', exclamationDensity: 0.6 };
    }
    return { prepend: '', exclamationDensity: 0.3 };
  }

  /**
   * Serialize the emotional state to a JSON string for persistence.
   *
   * Principle: P4+ — Emotional Identity.
   * Math: identity function over the state object via JSON.stringify.
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }

  /**
   * Restore the emotional state from a JSON snapshot.
   *
   * Principle: P4+ — Emotional Identity.
   * Math: JSON.parse into the internal state; invalid input is a no-op
   *       (the prior state is preserved, and a warning is logged).
   *
   * @param json  the serialized state from `serialize()`
   */
  deserialize(json: string): void {
    try {
      const parsed: unknown = JSON.parse(json);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof (parsed as EmotionalState).mood === 'number' &&
        typeof (parsed as EmotionalState).momentum === 'number' &&
        typeof (parsed as EmotionalState).volatility === 'number' &&
        Array.isArray((parsed as EmotionalState).history)
      ) {
        this.state = parsed as EmotionalState;
        // Re-derive the label in case the snapshot is from a
        // version with different thresholds.
        this.state.moodLabel = moodLabelFromValue(this.state.mood);
      } else {
        console.warn('[TRIZA] EmotionalIdentity.deserialize: invalid snapshot shape — ignored');
      }
    } catch (err) {
      console.warn(
        '[TRIZA] EmotionalIdentity.deserialize: JSON parse failed — ignored:',
        err instanceof Error ? err.message : err,
      );
    }
  }
}
