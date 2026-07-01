/**
 * ============================================================
 *  TRIZA — Habituation-Driven Attention (P17)
 * ============================================================
 *
 *  Principle (P17): Attention novelty aur inverse-frequency se banta,
 *  prompt se nahi. Habituation = repeated stimuli lose salience.
 *
 *  Math (Pillar 17):
 *    Attention(O) = Novelty × (1 / Freq) + adaptive_threshold
 *
 *  Where:
 *    Novelty(O)  = (# features never seen before) / (# features in O)
 *    Freq(O)     = average historical count of O's features
 *    Threshold   = adaptive — if too many things are attended the
 *                  threshold rises (we become hard to impress);
 *                  if too few, it lowers (we become curious).
 *
 *  Div-by-zero guard: attention = novelty × (1 / (freq + 1)) + 0.
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * An attention signal computed for a single observation.
 */
export interface AttentionSignal {
  /** Observation id (caller-supplied or auto-generated). */
  observationId: string
  /** Fraction of features never seen before, in [0, 1]. */
  novelty: number
  /** Average historical count of the observed features. */
  frequency: number
  /** Computed attention score. */
  attention: number
  /** Current adaptive threshold when this signal was generated. */
  threshold: number
  /** True if attention ≥ threshold (this observation is "attended"). */
  attended: boolean
}

/** Initial adaptive threshold. */
const INITIAL_THRESHOLD = 0.3

/** Adaptive threshold bounds. */
const MIN_THRESHOLD = 0.1
const MAX_THRESHOLD = 0.9

/** Window of recent observations used to adapt the threshold. */
const ADAPT_WINDOW = 10

/** If >50% of last N are attended, raise threshold. */
const RAISE_RATIO = 0.5

/** If <10% of last N are attended, lower threshold. */
const LOWER_RATIO = 0.1

/** How much to nudge the threshold on adaptation. */
const ADAPT_STEP = 0.05

/**
 * AttentionModel — habituation-driven attention with an adaptive
 * threshold. Novelty × inverse-frequency, no prompts.
 */
export class AttentionModel {
  /** How many times each feature has been seen (habituation counts). */
  private frequency: Map<string, number> = new Map()

  /** Current adaptive threshold. */
  private threshold: number = INITIAL_THRESHOLD

  /** Rolling window of recent `attended` flags, for adaptation. */
  private recentAttended: boolean[] = []

  /** Internal counter for generating observation ids. */
  private idCounter = 0

  /**
   * Observe a set of features. Updates the per-feature frequency
   * counts, computes novelty, frequency, attention, and attended flag.
   *
   *   novelty    = (# features never seen before) / (# features)
   *   frequency  = mean( freq[f] for f in features )
   *   attention  = novelty × (1 / (frequency + 1))
   *   attended   = attention ≥ threshold
   *
   * @param features       Perception features in this observation.
   * @param observationId  Optional observation id. Auto-generated if omitted.
   * @returns              The computed attention signal.
   */
  observe(
    features: string[],
    observationId?: string
  ): AttentionSignal {
    const obsId = observationId ?? `obs_${Date.now()}_${this.idCounter++}`

    if (!features || features.length === 0) {
      const empty: AttentionSignal = {
        observationId: obsId,
        novelty: 0,
        frequency: 0,
        attention: 0,
        threshold: this.threshold,
        attended: false,
      }
      this.recentAttended.push(false)
      this.trimWindow()
      return empty
    }

    // Novelty: fraction of features never seen before.
    let novelCount = 0
    let freqSum = 0
    for (const f of features) {
      const count = this.frequency.get(f) ?? 0
      if (count === 0) novelCount += 1
      freqSum += count
      // Update the frequency map AFTER reading (so this observation
      // doesn't count itself as "seen").
      this.frequency.set(f, count + 1)
    }

    const novelty = novelCount / features.length
    const frequency = freqSum / features.length
    // Div-by-zero guard: (frequency + 1) is always ≥ 1.
    const attention = novelty * (1 / (frequency + 1))
    const attended = attention >= this.threshold

    this.recentAttended.push(attended)
    this.trimWindow()

    return {
      observationId: obsId,
      novelty,
      frequency,
      attention,
      threshold: this.threshold,
      attended,
    }
  }

  /**
   * Adapt the threshold based on recent observation history.
   *
   *   If >50% of last 10 were attended → raise threshold (we're
   *   too easily distracted).
   *   If <10% of last 10 were attended → lower threshold (we're
   *   too numb).
   *
   * Threshold is clamped to [0.1, 0.9].
   */
  adapt(): void {
    if (this.recentAttended.length === 0) return

    const attendedCount = this.recentAttended.filter(Boolean).length
    const ratio = attendedCount / this.recentAttended.length

    if (ratio > RAISE_RATIO) {
      this.threshold = clamp(this.threshold + ADAPT_STEP, MIN_THRESHOLD, MAX_THRESHOLD)
    } else if (ratio < LOWER_RATIO) {
      this.threshold = clamp(this.threshold - ADAPT_STEP, MIN_THRESHOLD, MAX_THRESHOLD)
    }
  }

  /**
   * @returns The current adaptive threshold.
   */
  getThreshold(): number {
    return this.threshold
  }

  // ---- Internal helpers ------------------------------------------------

  /** Trim the rolling window to the last ADAPT_WINDOW entries. */
  private trimWindow(): void {
    if (this.recentAttended.length > ADAPT_WINDOW) {
      this.recentAttended = this.recentAttended.slice(-ADAPT_WINDOW)
    }
  }
}

// ---- Internal helpers ----------------------------------------------------

function clamp(x: number, min: number, max: number): number {
  if (x < min) return min
  if (x > max) return max
  return x
}
