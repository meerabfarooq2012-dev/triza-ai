/**
 * ============================================================
 *  TRIZA — Feedback Learning (Hebbian-inspired weight store)
 * ============================================================
 *
 *  Hebbian-inspired: weights strengthen when feedback is positive,
 *  weaken when negative. This is REAL learning — not a fake toast.
 *
 *  Rule (per-entry weight update):
 *      w_new = clamp( w_old + η * reward, MIN, MAX )
 *
 *      where:
 *        η      = LEARNING_RATE   (0.15)
 *        reward = +1 for 👍 (good response)
 *                 -1 for 👎 (needs work)
 *        MIN    = 0.1   (entry never fully vanishes — still discoverable)
 *        MAX    = 3.0   (entry cannot dominate the ranking by itself)
 *
 *  Why clamp [0.1, 3.0]?
 *    - Lower bound 0.1: a heavily 👎'd entry still has a tiny residual
 *      score so we don't accidentally "delete" knowledge; if many users
 *      later 👍 it, it can recover.
 *    - Upper bound 3.0: prevents a single popular entry from drowning
 *      out all others. The score multiplier is capped.
 *
 *  How is the weight used?
 *    `searchKnowledgeBase()` in response-generator.ts computes a raw
 *    0-1 honest score for each candidate (regex hit + keyword overlap).
 *    We then multiply by the entry's learned weight:
 *
 *        weightedScore = rawScore * getWeight(entryId)
 *
 *    So a well-received entry (weight > 1) ranks HIGHER for similar
 *    future queries, while a poorly-received one (weight < 1) ranks
 *    lower. This is the core of Hebbian reinforcement applied to a
 *    knowledge base — "neurons that fire together, wire together",
 *    translated to "entries that users like, surface together".
 *
 *  Storage:
 *    In-memory Map<entryId, weight>. Module-level singleton, so it
 *    persists for the lifetime of the serverless function / dev
 *    server process. Persistence to localStorage (client) or DB
 *    (server) can be wired via exportFeedbackState() /
 *    importFeedbackState() — kept simple for now per task spec.
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

// ---- Constants -----------------------------------------------------------

/** Learning rate (η). Each 👍/👎 moves the weight by this much. */
export const LEARNING_RATE = 0.15

/** Minimum weight — an entry never fully disappears. */
export const MIN_WEIGHT = 0.1

/** Maximum weight — no entry can dominate the ranking. */
export const MAX_WEIGHT = 3.0

/** Default starting weight for an entry that has never received feedback. */
export const DEFAULT_WEIGHT = 1.0

/** Reward signal: +1 for positive (👍), -1 for negative (👎). */
export type Reward = 1 | -1

// ---- Store (module-level singleton) -------------------------------------

/**
 * In-memory weight map. Keyed by KnowledgeEntry.id.
 *
 * NOTE: This is intentionally a plain Map — no DB needed for the
 * landing demo. On a long-running dev server the weights persist
 * across requests; on Vercel serverless each warm instance keeps
 * its own map. Cross-instance persistence (DB / Upstash) can be
 * added later without changing the public API of this module.
 */
const weights = new Map<string, number>()

// ---- Public API ---------------------------------------------------------

/**
 * Adjust an entry's weight using the Hebbian-inspired rule.
 *
 *   w_new = clamp( w_old + η * reward, MIN, MAX )
 *
 * @param entryId  The KnowledgeEntry.id being reinforced/weakened.
 * @param reward   +1 for 👍, -1 for 👎.
 * @returns The new clamped weight (also stored in the map).
 */
export function adjustWeight(entryId: string, reward: Reward): number {
  if (!entryId || typeof entryId !== 'string') {
    return DEFAULT_WEIGHT
  }

  // Fused matches use a '+'-joined id (e.g. "a+b+c"). For feedback
  // we apply the reward to the FIRST id in the chain (the top-ranked
  // one) — this keeps feedback targeted and avoids double-counting.
  const targetId = entryId.split('+')[0]
  if (!targetId) return DEFAULT_WEIGHT

  const current = weights.get(targetId) ?? DEFAULT_WEIGHT
  const next = clamp(current + LEARNING_RATE * reward, MIN_WEIGHT, MAX_WEIGHT)
  const rounded = round2(next)
  weights.set(targetId, rounded)
  return rounded
}

/**
 * Get the current learned weight for an entry.
 * Returns DEFAULT_WEIGHT (1.0) if no feedback has ever been recorded.
 */
export function getWeight(entryId: string): number {
  if (!entryId || typeof entryId !== 'string') return DEFAULT_WEIGHT
  const targetId = entryId.split('+')[0]
  return weights.get(targetId) ?? DEFAULT_WEIGHT
}

/**
 * Apply the learned weight to a raw honest score.
 *
 *   weightedScore = rawScore * getWeight(entryId)
 *
 * Used by searchKnowledgeBase() in response-generator.ts so that
 * well-received entries rank higher for similar future queries.
 */
export function getWeightedScore(rawScore: number, entryId: string): number {
  return rawScore * getWeight(entryId)
}

// ---- Persistence (for future localStorage / DB wiring) -----------------

/**
 * Snapshot the entire weight map for persistence.
 * Returns a plain object (JSON-serialisable) of { entryId: weight }.
 */
export function exportFeedbackState(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of weights) {
    out[k] = v
  }
  return out
}

/**
 * Restore a previously exported weight map.
 * Merges into the existing map (does not clear other keys unless
 * `replace` is true).
 *
 * @param state   Output of a previous exportFeedbackState() call.
 * @param replace If true, clears the map before importing.
 */
export function importFeedbackState(
  state: Record<string, number>,
  replace = false
): void {
  if (replace) weights.clear()
  if (!state || typeof state !== 'object') return
  for (const [k, v] of Object.entries(state)) {
    if (typeof v === 'number' && Number.isFinite(v)) {
      weights.set(k, clamp(round2(v), MIN_WEIGHT, MAX_WEIGHT))
    }
  }
}

/**
 * Reset all learned weights (mainly for tests / dev reset).
 * Clears the in-memory map — every entry goes back to DEFAULT_WEIGHT.
 */
export function resetFeedbackState(): void {
  weights.clear()
}

/**
 * Return a read-only view of the map (sorted by weight desc) —
 * useful for debugging / an admin dashboard later.
 */
export function inspectFeedbackState(): Array<{ entryId: string; weight: number }> {
  return Array.from(weights.entries())
    .map(([entryId, weight]) => ({ entryId, weight: round2(weight) }))
    .sort((a, b) => b.weight - a.weight)
}

// ---- Internal helpers ---------------------------------------------------

function clamp(x: number, min: number, max: number): number {
  if (x < min) return min
  if (x > max) return max
  return x
}

function round2(x: number): number {
  return Math.round(x * 100) / 100
}
