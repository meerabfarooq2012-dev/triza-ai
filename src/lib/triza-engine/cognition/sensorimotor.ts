/**
 * ============================================================================
 * P39 — SENSORIMOTOR GROUNDING
 * ============================================================================
 *
 * Principle: Sensorimotor Grounding — Action-effect coupling + mental
 * simulation + embodied necessity. Every action the agent can perform is
 * COUPLED to a set of expected effects. Before acting, the agent
 * SIMULATES (mentally runs the action and predicts the effects). After
 * acting, it VERIFIES that the observed effects match the simulated ones.
 * An action is GROUNDED only if simulated ≈ observed. An action is
 * NECESSARY if no other action achieves the same effects.
 *
 * Math:
 *   - couple(action, effects): register coupling with strength 1.0,
 *     grounded = false (until verified).
 *   - simulate(action): return registered effects; confidence = couplingStrength.
 *     If unregistered, return { [], 0 }.
 *   - verify(action, observed): matchScore = Jaccard(simulated, observed).
 *     grounded = matchScore ≥ 0.5. Updates the coupling's grounded flag.
 *   - necessity(action): TRUE if no OTHER action has effects with
 *     Jaccard ≥ 0.9 (i.e., no other action achieves the same effects).
 *   - groundedActions(): list of all grounded actions.
 *
 * Seeded with:
 *   "observe" → ["features extracted"]
 *   "respond" → ["reply generated"]
 *   "learn"   → ["memory updated"]
 *   "decide"  → ["decision made"]
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface ActionEffect {
  action: string;
  effects: string[];
  couplingStrength: number;
  grounded: boolean;
}

/**
 * Compute Jaccard similarity between two arrays (treated as sets).
 *   J(A, B) = |A ∩ B| / |A ∪ B|
 * Returns 0 if both are empty (no overlap → no grounding).
 */
function jaccard(a: string[], b: string[]): number {
  const setA: Set<string> = new Set(a);
  const setB: Set<string> = new Set(b);
  let intersection: number = 0;
  for (const x of setA) {
    if (setB.has(x)) intersection++;
  }
  const unionSize: number = new Set([...setA, ...setB]).size;
  if (unionSize === 0) return 0;
  return intersection / unionSize;
}

/**
 * SensorimotorGrounding — action-effect couplings verified by mental
 * simulation. An action is "grounded" only after its simulated effects
 * match the observed effects (Jaccard ≥ 0.5).
 *
 * Pre-seeded with: observe, respond, learn, decide.
 */
export class SensorimotorGrounding {
  private couplings: Map<string, ActionEffect> = new Map();

  constructor() {
    // Seed with 4 default couplings.
    this.couple('observe', ['features extracted']);
    this.couple('respond', ['reply generated']);
    this.couple('learn', ['memory updated']);
    this.couple('decide', ['decision made']);
  }

  /**
   * Register (or overwrite) an action-effect coupling. Newly registered
   * couplings start with strength 1.0 and grounded = false — they must
   * be verified through simulation before being considered grounded.
   *
   * Principle: P39 — Sensorimotor Grounding (action-effect coupling).
   *
   * @param action   The action name.
   * @param effects  The expected effects of the action.
   */
  couple(action: string, effects: string[]): void {
    this.couplings.set(action, {
      action,
      effects: [...effects],
      couplingStrength: 1.0,
      grounded: false,
    });
  }

  /**
   * Mentally simulate an action: return its registered (expected)
   * effects and a confidence equal to the coupling strength. If the
   * action is not registered, returns an empty effect list with
   * confidence 0.
   *
   * Principle: P39 — Sensorimotor Grounding (mental simulation).
   * Math: simulate(a) = (couplings[a].effects, couplings[a].couplingStrength).
   *
   * @param action  The action to simulate.
   */
  simulate(action: string): { predictedEffects: string[]; confidence: number } {
    const c = this.couplings.get(action);
    if (!c) return { predictedEffects: [], confidence: 0 };
    return { predictedEffects: [...c.effects], confidence: c.couplingStrength };
  }

  /**
   * Verify an action against observed effects. The match score is the
   * Jaccard similarity between simulated and observed effects. The
   * action is GROUNDED if matchScore ≥ 0.5 — i.e., the simulated
   * effects substantially match what was actually observed. Updates
   * the coupling's grounded flag in place.
   *
   * Principle: P39 — Sensorimotor Grounding (embodied necessity).
   * Math: matchScore = Jaccard(simulated, observed); grounded = matchScore ≥ 0.5.
   *
   * @param action           The action to verify.
   * @param observedEffects  The effects actually observed.
   */
  verify(action: string, observedEffects: string[]): { grounded: boolean; matchScore: number } {
    const c = this.couplings.get(action);
    if (!c) {
      return { grounded: false, matchScore: 0 };
    }
    const matchScore: number = jaccard(c.effects, observedEffects);
    const grounded: boolean = matchScore >= 0.5;
    c.grounded = grounded;
    return { grounded, matchScore };
  }

  /**
   * Determine whether an action is NECESSARY — i.e., no other action
   * achieves the same effect set. Returns true if the action is the
   * ONLY one with its effect set (or close to it: no other action has
   * effects with Jaccard ≥ 0.9). Returns false if the action is
   * unknown or if another action achieves the same effects.
   *
   * Principle: P39 — Sensorimotor Grounding (embodied necessity).
   * Math: necessity(a) = ¬∃ b ≠ a : Jaccard(effects(b), effects(a)) ≥ 0.9.
   *
   * @param action  The action to test.
   */
  necessity(action: string): boolean {
    const c = this.couplings.get(action);
    if (!c) return false;
    for (const [otherName, other] of this.couplings) {
      if (otherName === action) continue;
      if (jaccard(other.effects, c.effects) >= 0.9) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return the list of all grounded actions (actions whose simulated
   * effects have been verified against observed effects).
   *
   * Principle: P39 — Sensorimotor Grounding.
   */
  groundedActions(): string[] {
    const result: string[] = [];
    for (const [name, c] of this.couplings) {
      if (c.grounded) result.push(name);
    }
    return result;
  }
}
