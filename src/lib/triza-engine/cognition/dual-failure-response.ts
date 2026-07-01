/**
 * ============================================================================
 * P27 — DUAL FAILURE RESPONSE
 * ============================================================================
 *
 * Principle (P27): When an action fails, the agent has TWO possible
 * responses — PERSEVERATE (try the same action again) or MOVE-ON (try a
 * different action). The choice depends on the number of failures and
 * how recent the last failure was. Very recent, few failures → try
 * again (it might have been bad luck). Many failures, or no alternative
 * available, or extremely many failures → move on. Old failures decay
 * (they matter less than fresh ones).
 *
 * Math / rules:
 *   - respondToFailure(ctx):
 *       failures ≥ 5                       → mode = 'move-on'  (forced)
 *                                            reason = "forced: 5+ failures"
 *       failures < 2 AND timeSinceLast ≤ 10s → mode = 'perseverate'
 *                                            reason = "recent few failures"
 *       failures ≥ 2 OR no alternative      → mode = 'move-on'
 *                                            reason = "exhausted retries" /
 *                                                     "no alternative but forced"
 *
 *       NOTE: when failures ≥ 5 we move on even if there is no
 *       alternative (the rule says "forced move-on even if no
 *       alternative").
 *
 *   - perseverationDecay(failures, timeSinceLast):
 *       effective = failures / (1 + timeSinceLast / 60000)
 *       Older failures count less; failures within the same minute are
 *       counted at roughly full strength.
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** Context describing the failure state of a single action. */
export interface FailureContext {
  /** The action that failed. */
  action: string;
  /** Total number of consecutive failures so far. */
  failures: number;
  /** Timestamp (ms) of the most recent failure. */
  lastFailureAt: number;
  /** Whether an alternative action is available. */
  alternativeAvailable: boolean;
}

/** Result of the dual-failure decision. */
export interface FailureResponse {
  /** 'perseverate' = try again; 'move-on' = try something else. */
  mode: 'perseverate' | 'move-on';
  /** Human-readable reason for the decision. */
  reason: string;
}

/** Time (ms) within which a failure still counts as "recent". */
export const RECENT_FAILURE_WINDOW_MS = 10_000;

/** Failures at or above this count force a move-on (no alternative allowed). */
export const FORCED_MOVE_ON_THRESHOLD = 5;

/** Failures at or above this count trigger move-on (unless very recent). */
export const MOVE_ON_THRESHOLD = 2;

/**
 * Decide whether to perseverate or move on after a failure.
 *
 * Principle: P27.
 *
 * Decision tree (applied in order, faithful to the spec):
 *   1. failures ≥ 5
 *        → move-on (forced), even if no alternative.
 *   2. failures < 2 AND timeSinceLast < 10s
 *        → perseverate (try again).
 *   3. failures ≥ 2
 *        → move-on (exhausted retries).
 *   4. no alternative available
 *        → move-on (nothing else to try).
 *   5. otherwise (failures < 2 AND alternative available AND stale failure)
 *        → perseverate (a stale single failure may have been transient;
 *          with an alternative available we may still want to retry first).
 *
 * @param ctx The failure context. We compute "time since last" against
 *            Date.now() here.
 * @returns   The chosen response with a reason.
 */
export function respondToFailure(ctx: FailureContext): FailureResponse {
  const failures = Math.max(0, Math.floor(ctx.failures ?? 0));
  const now = Date.now();
  const timeSinceLast = Math.max(0, now - (ctx.lastFailureAt ?? now));

  // (1) Forced move-on at 5+ failures, regardless of alternative.
  if (failures >= FORCED_MOVE_ON_THRESHOLD) {
    return {
      mode: 'move-on',
      reason: `forced: ${failures} failures (≥ ${FORCED_MOVE_ON_THRESHOLD})`,
    };
  }

  // (2) Few recent failures → try again.
  if (failures < MOVE_ON_THRESHOLD && timeSinceLast < RECENT_FAILURE_WINDOW_MS) {
    return {
      mode: 'perseverate',
      reason: `recent few failures (${failures}, ${Math.round(timeSinceLast / 1000)}s ago)`,
    };
  }

  // (3) Many failures (≥ 2) → move-on.
  if (failures >= MOVE_ON_THRESHOLD) {
    return {
      mode: 'move-on',
      reason: `exhausted retries (${failures} failures)`,
    };
  }

  // (4) No alternative available → move-on (nothing else to try).
  if (!ctx.alternativeAvailable) {
    return {
      mode: 'move-on',
      reason: 'no alternative available',
    };
  }

  // (5) Stale single failure WITH an alternative available → still try
  //     again first. The previous failure is old enough that it may have
  //     been transient; we'll escalate to move-on only on the next failure.
  return {
    mode: 'perseverate',
    reason: `stale failure (${Math.round(timeSinceLast / 1000)}s ago), retrying`,
  };
}

/**
 * Perseveration decay — older failures matter less.
 *
 * Principle: P27.
 *
 *   effectiveFailures = failures / (1 + timeSinceLast / 60000)
 *
 * A failure that happened 0 ms ago counts at full strength. One that
 * happened 1 minute ago counts at half strength. One that happened an
 * hour ago counts at ~1/61 of its raw count.
 *
 * @param failures       Raw failure count.
 * @param timeSinceLast  Milliseconds since the last failure.
 * @returns              The decayed (effective) failure count, ≥ 0.
 */
export function perseverationDecay(
  failures: number,
  timeSinceLast: number
): number {
  const f = Math.max(0, failures);
  const t = Math.max(0, timeSinceLast);
  if (!Number.isFinite(f) || !Number.isFinite(t)) return 0;
  return f / (1 + t / 60000);
}
