/**
 * ============================================================
 *  TRIZA — Joint Attention (P18)
 * ============================================================
 *
 *  Principle (P18): Joint attention = shared focus with another agent.
 *  Two agents are "jointly attending" when their focus sets overlap.
 *  Over time, an agent can drift its own focus toward the other's
 *  focus to maintain alignment (shared gaze following).
 *
 *  Math:
 *    shared     = selfFocus ∩ otherFocus
 *    union      = selfFocus ∪ otherFocus
 *    alignment  = |shared| / |union|     (Jaccard similarity, in [0, 1])
 *
 *  isAligned(focus)  := alignment ≥ threshold   (default 0.3)
 *
 *  maintainFocus: over `steps` iterations, drift self-focus toward
 *  other-focus by adding ONE feature per step (a feature the other
 *  is attending but self is not). This models gaze-following.
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * The result of comparing two agents' focus sets.
 */
export interface JointFocus {
  /** Self's focus features. */
  self: string[]
  /** The other agent's focus features. */
  other: string[]
  /** Intersection: features both are attending to. */
  shared: string[]
  /** Jaccard alignment = |shared| / |union|, in [0, 1]. */
  alignment: number
}

/**
 * Default alignment threshold for isAligned().
 */
export const DEFAULT_ALIGNMENT_THRESHOLD = 0.3

/**
 * Detect joint attention between self and another agent.
 *
 *   shared    = selfFocus ∩ otherFocus
 *   alignment = |shared| / |selfFocus ∪ otherFocus|
 *
 * @param selfFocus  Features self is attending to.
 * @param otherFocus Features the other agent is attending to.
 * @returns          A JointFocus describing the overlap.
 */
export function detectJointFocus(
  selfFocus: string[],
  otherFocus: string[]
): JointFocus {
  const self = selfFocus ?? []
  const other = otherFocus ?? []

  const selfSet = new Set(self)
  const otherSet = new Set(other)

  const shared: string[] = []
  for (const f of selfSet) {
    if (otherSet.has(f)) shared.push(f)
  }

  const unionSize = selfSet.size + otherSet.size - shared.length
  const alignment = unionSize === 0 ? 0 : shared.length / unionSize

  return { self, other, shared, alignment }
}

/**
 * Is the joint focus "aligned"? Returns true when alignment ≥ threshold.
 *
 * @param focus     The JointFocus to test.
 * @param threshold Minimum alignment. Default 0.3.
 * @returns         True if aligned.
 */
export function isAligned(
  focus: JointFocus,
  threshold: number = DEFAULT_ALIGNMENT_THRESHOLD
): boolean {
  if (!focus) return false
  return focus.alignment >= threshold
}

/**
 * Maintain joint attention by drifting self-focus toward other-focus
 * over `steps` iterations. At each step, self adopts ONE feature from
 * the other that self doesn't already have (gaze-following).
 *
 * Stops early if self has absorbed every feature the other has.
 *
 * @param currentFocus Self's current focus.
 * @param otherFocus   Other's focus (the target to drift toward).
 * @param steps        Maximum number of features to absorb.
 * @returns            Self's updated focus (original + absorbed features).
 */
export function maintainFocus(
  currentFocus: string[],
  otherFocus: string[],
  steps: number
): string[] {
  if (steps <= 0) return currentFocus ? [...currentFocus] : []

  const self = currentFocus ? [...currentFocus] : []
  const selfSet = new Set(self)

  // Features the other has that self doesn't (in stable order).
  const toAbsorb: string[] = []
  if (otherFocus) {
    for (const f of otherFocus) {
      if (!selfSet.has(f)) toAbsorb.push(f)
    }
  }

  // Absorb at most `steps` of them, one per step.
  const absorbed = toAbsorb.slice(0, steps)
  for (const f of absorbed) {
    self.push(f)
  }

  return self
}
