/**
 * ============================================================
 *  TRIZA — Social Referencing / Emotion Borrowing (P19)
 * ============================================================
 *
 *  Principle (P19): When uncertain, an agent borrows emotion from a
 *  trusted other (like an infant looking at a parent before
 *  approaching a novel object). Trust scales how much is borrowed.
 *
 *  Math:
 *    borrowEmotion(self, other)
 *      = self × (1 - other.trust × 0.5)
 *      + other.currentEmotion × (other.trust × 0.5)
 *
 *    trust ∈ [0, 1]  → borrowing weight ∈ [0, 0.5]
 *    (Even a fully-trusted other can only move half the emotion —
 *     self always retains at least 50% of its own state.)
 *
 *    emotion ∈ [-2, +2]
 *
 *  shouldReference(uncertainty) := uncertainty > threshold   (default 0.6)
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * Another agent that self can reference for emotion.
 */
export interface OtherAgent {
  /** Unique id. */
  id: string
  /** Trust score in [0, 1]. 0 = no trust, 1 = full trust. */
  trust: number
  /** Current emotion in [-2, +2]. */
  currentEmotion: number
}

/**
 * Default uncertainty threshold for shouldReference().
 * If self is > this uncertain, look to others.
 */
export const DEFAULT_UNCERTAINTY_THRESHOLD = 0.6

/**
 * Borrow emotion from a trusted other using the weighted-blend rule.
 *
 *   newEmotion = self × (1 - other.trust × 0.5)
 *              + other.currentEmotion × (other.trust × 0.5)
 *
 * Trust ∈ [0, 1] is clamped internally. The borrowing weight
 * (other.trust × 0.5) is at most 0.5 — self never gives up more than
 * half its emotional state in a single reference.
 *
 * @param selfEmotion Self's current emotion in [-2, +2].
 * @param other       The trusted other agent.
 * @returns           Self's new emotion after borrowing.
 */
export function borrowEmotion(
  selfEmotion: number,
  other: OtherAgent
): number {
  if (!other) return selfEmotion

  const trust = clamp(other.trust, 0, 1)
  const borrowWeight = trust * 0.5
  const keepWeight = 1 - borrowWeight

  return selfEmotion * keepWeight + other.currentEmotion * borrowWeight
}

/**
 * Should the agent socially reference others right now?
 *
 *   shouldReference := uncertainty > threshold   (default 0.6)
 *
 * @param uncertainty Self's uncertainty in [0, 1].
 * @param threshold   Minimum uncertainty that triggers referencing.
 *                    Default 0.6.
 * @returns           True if self should look to others.
 */
export function shouldReference(
  uncertainty: number,
  threshold: number = DEFAULT_UNCERTAINTY_THRESHOLD
): boolean {
  return uncertainty > threshold
}

/**
 * SocialReferenceBank — a collection of other agents that self can
 * reference for emotion. Picks the most trusted when self is
 * uncertain.
 */
export class SocialReferenceBank {
  /** All known other agents, keyed by id. */
  private others: Map<string, OtherAgent> = new Map()

  /**
   * Add (or update) an other agent.
   */
  add(other: OtherAgent): void {
    if (!other || !other.id) return
    this.others.set(other.id, other)
  }

  /**
   * @returns The most-trusted other agent, or null if bank is empty.
   */
  mostTrusted(): OtherAgent | null {
    if (this.others.size === 0) return null

    let best: OtherAgent | null = null
    for (const o of this.others.values()) {
      if (!best || o.trust > best.trust) best = o
    }
    return best
  }

  /**
   * Borrow emotion if self is uncertain enough. Picks the most
   * trusted other. If self is NOT uncertain (or there are no others),
   * returns self's emotion unchanged.
   *
   * @param selfEmotion Self's current emotion in [-2, +2].
   * @param uncertainty Self's uncertainty in [0, 1].
   * @returns           Self's new emotion (possibly borrowed).
   */
  borrow(selfEmotion: number, uncertainty: number): number {
    if (!shouldReference(uncertainty)) return selfEmotion
    const other = this.mostTrusted()
    if (!other) return selfEmotion
    return borrowEmotion(selfEmotion, other)
  }
}

// ---- Internal helpers ----------------------------------------------------

function clamp(x: number, min: number, max: number): number {
  if (x < min) return min
  if (x > max) return max
  return x
}
