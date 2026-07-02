/**
 * ============================================================================
 * P32 — COUNTERFACTUAL REASONING
 * ============================================================================
 *
 * Principle: Counterfactual Reasoning. Two modes:
 *   (1) Regret mode: "What if I had chosen the alternative?" — compares
 *       the actual outcome against a PREDICTED alternative outcome and
 *       registers regret = the missed gain.
 *   (2) Forward-planning mode: "Which option should I pick next?" —
 *       predicts the value of each option and chooses the highest.
 *
 * Math:
 *   - regretMode(actual, alt, outcome):
 *       alternativeOutcome = predictRelative(alt, actual)
 *                            = |alt| / (|actual| + |alt|)   // relative richness
 *       regret              = max(0, alternativeOutcome − outcome)
 *       lesson              = "if [alt features] then higher value"
 *
 *   - forwardPlan(current, options):
 *       chosen         = argmax_options |option|
 *       expectedValue  = |chosen|   // more features = more info = more value
 *
 *   - shouldCounterfact(outcome, τ = 0.3): outcome < τ.
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface Counterfactual {
  actual: string[];
  alternative: string[];
  regret: number;
  lesson: string;
}

/**
 * Predict the value of a feature-set as its RELATIVE richness:
 * |features| / (|actual| + |features|). Returns a number in [0, 1].
 * More features relative to the actual set → higher predicted value.
 */
function predictRelative(features: string[], baseline: string[]): number {
  const total: number = features.length + baseline.length;
  if (total === 0) return 0;
  return features.length / total;
}

/**
 * Predict the ABSOLUTE value of a feature-set: |features|. More
 * features = more information = more expected value.
 */
function predictAbsolute(features: string[]): number {
  return features.length;
}

/**
 * Regret-mode counterfactual. Compares the actual outcome (a number
 * the caller supplies, typically 0-1) against a predicted alternative
 * outcome derived from the alternative's feature richness. Regret is
 * the missed gain (clamped at 0 — you cannot regret a gain).
 *
 * Principle: P32 — Counterfactual Reasoning (regret-driven mode).
 * Math: regret = max(0, predictRelative(alt, actual) − outcome).
 *
 * @param actual       Features of the actually-chosen path.
 * @param alternative  Features of the alternative path.
 * @param outcome      Observed outcome of the actual path (0-1 scale).
 */
export function regretMode(
  actual: string[],
  alternative: string[],
  outcome: number
): Counterfactual {
  const alternativeOutcome: number = predictRelative(alternative, actual);
  const regret: number = Math.max(0, alternativeOutcome - outcome);
  const lesson: string = `if [${alternative.join(', ')}] then higher value`;
  return { actual, alternative, regret, lesson };
}

/**
 * Forward-planning mode: pick the option with the highest predicted
 * value. Predicted value = number of features (more features = more
 * information = more expected value). Returns the chosen option and
 * its expected value.
 *
 * Principle: P32 — Counterfactual Reasoning (forward-planning mode).
 * Math: chosen = argmax_options |option|; expectedValue = |chosen|.
 *
 * @param current  Current state features (kept for API stability; not
 *                 used in this simple heuristic).
 * @param options  Array of candidate options, each a feature array.
 */
export function forwardPlan(
  current: string[],
  options: string[][]
): { chosen: string[]; expectedValue: number } {
  if (options.length === 0) {
    return { chosen: [], expectedValue: 0 };
  }
  let chosen: string[] = options[0];
  let bestValue: number = predictAbsolute(options[0]);
  for (let i = 1; i < options.length; i++) {
    const v: number = predictAbsolute(options[i]);
    if (v > bestValue) {
      bestValue = v;
      chosen = options[i];
    }
  }
  return { chosen, expectedValue: bestValue };
}

/**
 * Decide whether a counterfactual analysis is warranted. If the
 * observed outcome is below a threshold, the agent should ask "what
 * if?" and learn from the alternative. Default threshold 0.3.
 *
 * Principle: P32 — Counterfactual Reasoning.
 * Math: shouldCounterfact = outcome < τ.
 *
 * @param outcome   Observed outcome (0-1 scale).
 * @param threshold Cutoff below which a counterfactual is warranted.
 */
export function shouldCounterfact(outcome: number, threshold: number = 0.3): boolean {
  return outcome < threshold;
}

/**
 * Extract the lesson string from a counterfactual. The lesson is a
 * human-readable "if-then" rule derived from the alternative path.
 *
 * Principle: P32 — Counterfactual Reasoning.
 *
 * @param cf The counterfactual to extract the lesson from.
 */
export function extractLesson(cf: Counterfactual): string {
  return cf.lesson;
}
