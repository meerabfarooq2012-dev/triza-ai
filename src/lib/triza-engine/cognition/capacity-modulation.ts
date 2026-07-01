/**
 * ============================================================================
 * P24 — CAPACITY MODULATION
 * ============================================================================
 *
 * Principle (P24): Internal brain state determines learning. The agent's
 * capacity to learn is not constant — it depends on three internal
 * dimensions: ENERGY (tired vs rested), AROUSAL (sleepy vs alert) and
 * FOCUS (distracted vs concentrated). High capacity → full learning rate;
 * low capacity → learning is deferred or reduced.
 *
 * Math:
 *   - capacity(state) = (energy + arousal + focus) / 3   ∈ [0, 1]
 *   - modulateLearningRate(baseRate, state) = baseRate × capacity(state)
 *   - shouldLearn(state, threshold = 0.4) = capacity(state) ≥ threshold
 *   - updateState(state, event):
 *       rest     → energy +0.10,  arousal −0.05
 *       effort   → energy −0.05,  focus +0.05
 *       reward   → arousal +0.10, focus +0.05
 *       novelty  → arousal +0.15, energy −0.05
 *     Every component is clamped to [0, 1]. The returned state carries
 *     a fresh timestamp.
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** Internal brain state. All components are in [0, 1]. */
export interface BrainState {
  /** Physical energy (0 = exhausted, 1 = fully rested). */
  energy: number;
  /** Arousal / alertness (0 = sleepy, 1 = fully alert). */
  arousal: number;
  /** Focus / concentration (0 = distracted, 1 = locked-in). */
  focus: number;
  /** Timestamp (ms) of this state snapshot. */
  timestamp: number;
}

/** Default shouldLearn() threshold. */
export const DEFAULT_LEARN_THRESHOLD = 0.4;

/**
 * Overall learning capacity in [0, 1].
 *
 * Principle: P24. Capacity = mean of the three internal dimensions.
 *
 *   capacity = (energy + arousal + focus) / 3
 *
 * @param state The brain state.
 * @returns     A capacity score in [0, 1].
 */
export function capacity(state: BrainState): number {
  const e = clamp01(state.energy);
  const a = clamp01(state.arousal);
  const f = clamp01(state.focus);
  return (e + a + f) / 3;
}

/**
 * Modulate a base learning rate by current capacity.
 *
 * Principle: P24. High capacity → full base rate. Low capacity → reduced
 * rate (proportionally).
 *
 *   effectiveRate = baseRate × capacity(state)
 *
 * @param baseRate The base learning rate (e.g. 0.1).
 * @param state    The brain state.
 * @returns        The modulated learning rate (≥ 0).
 */
export function modulateLearningRate(baseRate: number, state: BrainState): number {
  if (!Number.isFinite(baseRate) || baseRate < 0) return 0;
  return baseRate * capacity(state);
}

/**
 * Decide whether the agent should learn right now.
 *
 * Principle: P24. If capacity is too low, learning is deferred.
 *
 *   shouldLearn = capacity(state) ≥ threshold   (default 0.4)
 *
 * @param state     The brain state.
 * @param threshold Minimum capacity required to learn (default 0.4).
 * @returns         True if learning should proceed now.
 */
export function shouldLearn(
  state: BrainState,
  threshold: number = DEFAULT_LEARN_THRESHOLD
): boolean {
  return capacity(state) >= threshold;
}

/**
 * Update the brain state in response to an internal/external event.
 *
 * Principle: P24.
 *
 *   rest    → energy +0.10, arousal −0.05
 *   effort  → energy −0.05, focus +0.05
 *   reward  → arousal +0.10, focus +0.05
 *   novelty → arousal +0.15, energy −0.05
 *
 * Every component is clamped to [0, 1]. The returned state carries a
 * fresh timestamp (Date.now()).
 *
 * @param state The previous brain state.
 * @param event One of 'rest' | 'effort' | 'reward' | 'novelty'.
 * @returns     A new, clamped brain state.
 */
export function updateState(
  state: BrainState,
  event: 'rest' | 'effort' | 'reward' | 'novelty'
): BrainState {
  let { energy, arousal, focus } = state;
  switch (event) {
    case 'rest':
      energy += 0.1;
      arousal -= 0.05;
      break;
    case 'effort':
      energy -= 0.05;
      focus += 0.05;
      break;
    case 'reward':
      arousal += 0.1;
      focus += 0.05;
      break;
    case 'novelty':
      arousal += 0.15;
      energy -= 0.05;
      break;
  }
  return {
    energy: clamp01(energy),
    arousal: clamp01(arousal),
    focus: clamp01(focus),
    timestamp: Date.now(),
  };
}

// ---- internal helper -----------------------------------------------------

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
