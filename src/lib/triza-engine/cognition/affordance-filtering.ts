/**
 * ============================================================================
 * P26 — AFFORDANCE FILTERING
 * ============================================================================
 *
 * Principle (P26): The agent does NOT consider every possible action.
 * Each action has a WEIGHT that reflects how much it is "afforded" by
 * the current context. The agent first FILTERS (keep only context-
 * matching actions whose weight ≥ threshold), then SELECTS one action
 * via softmax-weighted random sampling (higher weight → more likely),
 * then UPDATES the chosen action's weight based on the outcome
 * (success reinforces, failure attenuates).
 *
 * Math:
 *   - filter(affordances, ctx, threshold = 0.3):
 *       keep a iff a.context matches ctx AND a.weight ≥ threshold
 *   - select(filtered):
 *       softmax sampling. p_i = exp(w_i) / Σ exp(w_j), then sample i.
 *       A deterministic seed is supported for reproducibility.
 *   - updateWeights(affordances, chosen, outcome):
 *       success → weight(chosen) += 0.1
 *       failure → weight(chosen) -= 0.1
 *       all weights clamped to [0, 1].
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** A candidate action weighted by how much the context affords it. */
export interface Affordance {
  /** Action name (e.g. "press-button", "open-door"). */
  action: string;
  /** Weight in [0, 1] — how much this action is afforded right now. */
  weight: number;
  /** Context tag (e.g. "kitchen", "near-door"). */
  context: string;
}

/** Default weight threshold for filter(). */
export const DEFAULT_THRESHOLD = 0.3;

/** Reinforcement step applied on outcome. */
export const WEIGHT_STEP = 0.1;

/**
 * Filter affordances by context and weight.
 *
 * Principle: P26.
 *
 *   keep a iff contextMatches(a.context, currentContext) AND a.weight ≥ threshold
 *
 * Context match is case-insensitive substring containment (either direction).
 *
 * @param affordances   All candidate affordances.
 * @param currentContext The current context tag.
 * @param threshold      Minimum weight (default 0.3).
 * @returns             Filtered affordances.
 */
export function filter(
  affordances: Affordance[],
  currentContext: string,
  threshold: number = DEFAULT_THRESHOLD
): Affordance[] {
  const ctx = (currentContext ?? '').toLowerCase().trim();
  const th = Number.isFinite(threshold) ? threshold : DEFAULT_THRESHOLD;
  return (affordances ?? []).filter((a) => {
    const w = clamp01(a.weight);
    if (w < th) return false;
    if (!ctx) return false;
    const aCtx = (a.context ?? '').toLowerCase().trim();
    if (!aCtx) return false;
    return aCtx.includes(ctx) || ctx.includes(aCtx);
  });
}

/**
 * Softmax-weighted random selection of an affordance.
 *
 * Principle: P26. Higher-weight actions are more likely to be selected,
 * but lower-weight ones are not impossible (exploration).
 *
 *   p_i = exp(w_i) / Σ_j exp(w_j)
 *
 * Selection is via a uniform random draw if no seed is provided. If a
 * seed is provided, a tiny LCG (linear congruential generator) is used
 * for deterministic, reproducible sampling.
 *
 * @param filtered The filtered affordance list (must be non-empty).
 * @param seed     Optional numeric seed for deterministic sampling.
 * @returns        The chosen affordance, or null if the list is empty.
 */
export function select(
  filtered: Affordance[],
  seed?: number
): Affordance | null {
  const list = (filtered ?? []).filter((a) => a && Boolean(a.action));
  if (list.length === 0) return null;
  if (list.length === 1) return list[0];

  // Softmax over weights.
  const weights = list.map((a) => clamp01(a.weight));
  const maxW = Math.max(...weights); // numerical stability
  const exps = weights.map((w) => Math.exp(w - maxW));
  const sumExp = exps.reduce((s, e) => s + e, 0);
  if (!(sumExp > 0)) {
    // Degenerate: uniform fallback.
    const idx = seededRandom(seed) * list.length;
    return list[Math.floor(idx) % list.length];
  }
  const probs = exps.map((e) => e / sumExp);

  // Sample.
  const r = seededRandom(seed);
  let acc = 0;
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i];
    if (r <= acc) return list[i];
  }
  // Numerical tail — return last.
  return list[list.length - 1];
}

/**
 * Update affordance weights after an outcome.
 *
 * Principle: P26.
 *
 *   success → weight(chosen) += 0.1
 *   failure → weight(chosen) -= 0.1
 *   all weights clamped to [0, 1]
 *
 * Non-chosen affordances are passed through unchanged.
 *
 * @param affordances The current affordance set.
 * @param chosen      The action name that was selected.
 * @param outcome     'success' or 'failure'.
 * @returns           A new affordance array with updated weights.
 */
export function updateWeights(
  affordances: Affordance[],
  chosen: string,
  outcome: 'success' | 'failure'
): Affordance[] {
  const delta = outcome === 'success' ? WEIGHT_STEP : -WEIGHT_STEP;
  return (affordances ?? []).map((a) => {
    if (a.action !== chosen) return { ...a };
    return { ...a, weight: clamp01(a.weight + delta) };
  });
}

// ---- internal helpers ----------------------------------------------------

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * Deterministic pseudo-random in [0, 1) if seed is provided; otherwise
 * Math.random(). Uses a small LCG so we have no dependencies.
 */
function seededRandom(seed?: number): number {
  if (seed === undefined || seed === null || !Number.isFinite(seed)) {
    return Math.random();
  }
  // LCG constants (Numerical Recipes).
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  let s = (Math.floor(seed) >>> 0) ^ 0x9e3779b9;
  s = (a * s + c) >>> 0;
  return s / m;
}
