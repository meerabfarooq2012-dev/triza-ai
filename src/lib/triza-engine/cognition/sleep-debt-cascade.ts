/**
 * ============================================================================
 * P30 — SLEEP DEBT CASCADE
 * ============================================================================
 *
 * Principle (P30): Sleep debt is a slow-accumulating integrity failure
 * mode. Every unit of work accrues a small amount of debt. When debt
 * crosses a threshold, integrity starts to erode. Rest pays down debt
 * and slowly restores integrity. If debt × (1 − integrity) climbs too
 * high, the system is at risk of a CASCADE FAILURE — a self-amplifying
 * collapse where low integrity makes further work more costly, which
 * accrues more debt, which lowers integrity further. The agent must
 * REST before the cascade becomes irreversible.
 *
 * Math:
 *   - accrueDebt(state, workDone):
 *       debt      += workDone × 0.1
 *       if debt > 10: integrity -= 0.05   (integrity erodes past threshold)
 *       integrity clamped to [0, 1]
 *       uptime    += workDone   (work takes time)
 *   - rest(state, duration):
 *       debt      -= duration × 0.2   (min 0)
 *       integrity += duration × 0.01  (max 1)
 *       restCycles += 1
 *   - cascadeRisk(state) = (debt / 20) × (1 − integrity)   ∈ [0, 1]
 *   - shouldRest(state):
 *       risk > 0.85 → { needed: true, urgency: 'critical' }
 *       risk > 0.7  → { needed: true, urgency: 'high'     }
 *       risk > 0.5  → { needed: true, urgency: 'medium'   }
 *       risk > 0.3  → { needed: true, urgency: 'low'      }
 *       else        → { needed: false, urgency: 'low'     }
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** Internal system state tracked across work/rest cycles. */
export interface SystemState {
  /** Total uptime (in arbitrary time units; equals cumulative work). */
  uptime: number;
  /** Number of rest cycles taken. */
  restCycles: number;
  /** Accumulated sleep debt (≥ 0). */
  debt: number;
  /** System integrity in [0, 1] (1 = perfect, 0 = failed). */
  integrity: number;
}

/** Result of shouldRest(). */
export interface RestDecision {
  /** Whether rest is needed. */
  needed: boolean;
  /** Urgency level. */
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

/** Debt threshold above which integrity starts to erode. */
export const INTEGRITY_EROSION_DEBT = 10;

/** Amount of integrity lost per work unit once debt is past the threshold. */
export const INTEGRITY_EROSION_STEP = 0.05;

/** Debt accrued per unit of work. */
export const DEBT_PER_WORK = 0.1;

/** Debt paid down per unit of rest. */
export const DEBT_REPAY_PER_REST = 0.2;

/** Integrity restored per unit of rest. */
export const INTEGRITY_RESTORE_PER_REST = 0.01;

/**
 * Accrue sleep debt from work, eroding integrity when debt is high.
 *
 * Principle: P30.
 *
 *   debt      += workDone × 0.1
 *   if debt > 10: integrity -= 0.05
 *   integrity clamped to [0, 1]
 *   uptime    += workDone
 *
 * @param state    Current system state.
 * @param workDone Work units performed (≥ 0).
 * @returns        New system state.
 */
export function accrueDebt(state: SystemState, workDone: number): SystemState {
  const w = Math.max(0, workDone);
  let debt = (state.debt ?? 0) + w * DEBT_PER_WORK;
  let integrity = clamp01(state.integrity ?? 1);
  if (debt > INTEGRITY_EROSION_DEBT) {
    integrity = clamp01(integrity - INTEGRITY_EROSION_STEP);
  }
  return {
    uptime: (state.uptime ?? 0) + w,
    restCycles: state.restCycles ?? 0,
    debt,
    integrity,
  };
}

/**
 * Rest: pay down debt and slowly restore integrity.
 *
 * Principle: P30.
 *
 *   debt      -= duration × 0.2   (min 0)
 *   integrity += duration × 0.01  (max 1)
 *   restCycles += 1
 *
 * @param state    Current system state.
 * @param duration Rest duration (≥ 0).
 * @returns        New system state.
 */
export function rest(state: SystemState, duration: number): SystemState {
  const d = Math.max(0, duration);
  const debt = Math.max(0, (state.debt ?? 0) - d * DEBT_REPAY_PER_REST);
  const integrity = clamp01(
    (state.integrity ?? 0) + d * INTEGRITY_RESTORE_PER_REST
  );
  return {
    uptime: state.uptime ?? 0,
    restCycles: (state.restCycles ?? 0) + 1,
    debt,
    integrity,
  };
}

/**
 * Compute cascade-failure risk.
 *
 * Principle: P30.
 *
 *   risk = (debt / 20) × (1 − integrity)   ∈ [0, 1]
 *
 * Risk is high when BOTH debt is high AND integrity is low — that is the
 * signature of a cascade. High debt with full integrity is not yet a
 * cascade; low integrity with no debt has nothing to amplify.
 *
 * @param state Current system state.
 * @returns     Risk score in [0, 1].
 */
export function cascadeRisk(state: SystemState): number {
  const debt = Math.max(0, state.debt ?? 0);
  const integrity = clamp01(state.integrity ?? 1);
  const raw = (debt / 20) * (1 - integrity);
  if (!Number.isFinite(raw) || raw < 0) return 0;
  if (raw > 1) return 1;
  return raw;
}

/**
 * Decide whether the system must rest, and how urgently.
 *
 * Principle: P30.
 *
 *   risk > 0.85 → critical
 *   risk > 0.7  → high
 *   risk > 0.5  → medium
 *   risk > 0.3  → low
 *   else        → not needed
 *
 * Note: the spec's thresholds are strictly greater-than, so a risk of
 * exactly 0.7 falls into 'medium' (not 'high').
 *
 * @param state Current system state.
 * @returns     The rest decision.
 */
export function shouldRest(state: SystemState): RestDecision {
  const risk = cascadeRisk(state);
  if (risk > 0.85) return { needed: true, urgency: 'critical' };
  if (risk > 0.7) return { needed: true, urgency: 'high' };
  if (risk > 0.5) return { needed: true, urgency: 'medium' };
  if (risk > 0.3) return { needed: true, urgency: 'low' };
  return { needed: false, urgency: 'low' };
}

// ---- internal helper -----------------------------------------------------

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
