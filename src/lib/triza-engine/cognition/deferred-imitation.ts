/**
 * ============================================================================
 * P22 — DEFERRED IMITATION
 * ============================================================================
 *
 * Principle (P22): Deferred Imitation. The agent does not slavishly copy
 * an observed action the instant it sees it. It buffers the observation,
 * waits for a delay, then re-replays it — but only up to a small number
 * of repetitions. After enough replays (the repetition threshold) the
 * imitation is "consumed" and the buffer is retired.
 *
 * This models the human-infant finding that a baby can see an action at
 * time T and reproduce it minutes/hours later — but with limited,
 * bounded repetition (it does not loop forever).
 *
 * Math / rules:
 *   - shouldImitate(now, threshold):
 *       eligible iff (now - observedAt) > DELAY_MS (default 5000ms)
 *                  AND replays < threshold (default 3)
 *   - imitate(buffer):
 *       returns buffer.observedAction,
 *       increments replays,
 *       updates lastReplayed = now (passed implicitly via caller expectation
 *       — we set lastReplayed to Date.now() here so the call site does not
 *       need to thread `now` everywhere).
 *   - decay():
 *       removes buffers older than 1 hour (3600_000 ms) that have NEVER
 *       been replayed (replays === 0). Stale-but-imitated buffers are
 *       kept because their replay count is part of the agent's history.
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** A buffered observed action awaiting deferred imitation. */
export interface ImitationBuffer {
  /** The observed action token (e.g. "wave", "press:button"). */
  observedAction: string;
  /** Timestamp (ms) when the action was observed. */
  observedAt: number;
  /** How many times the action has been imitated so far. */
  replays: number;
  /** Timestamp (ms) of the most recent imitation (0 if never imitated). */
  lastReplayed: number;
}

/** Default delay (ms) between observation and first imitation. */
export const DEFAULT_DELAY_MS = 5000;

/** Default maximum number of replays before the buffer is "consumed". */
export const DEFAULT_REPETITION_THRESHOLD = 3;

/** Buffers older than this (with 0 replays) are decayed away. */
export const DECAY_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * DeferredImitator — buffers observed actions and produces them, after a
 * delay, up to a repetition threshold.
 */
export class DeferredImitator {
  /** The in-memory buffer of observed-but-not-yet-consumed actions. */
  private buffers: ImitationBuffer[] = [];

  /**
   * Observe an action. Stores it in the buffer with replays = 0 and
   * lastReplayed = 0.
   *
   * @param action   The observed action token.
   * @param observedAt Optional timestamp (ms). Defaults to Date.now().
   */
  observe(action: string, observedAt: number = Date.now()): void {
    if (!action) return;
    this.buffers.push({
      observedAction: action,
      observedAt,
      replays: 0,
      lastReplayed: 0,
    });
  }

  /**
   * Decide whether any buffered action is ready for imitation now.
   *
   * Rule: a buffer is eligible iff
   *   (now - observedAt) > DEFAULT_DELAY_MS   AND
   *   replays < repetitionThreshold
   *
   * @param now                 Current timestamp (ms).
   * @param repetitionThreshold Optional cap on replays (default 3).
   * @returns                   The first eligible buffer, or null.
   */
  shouldImitate(
    now: number,
    repetitionThreshold: number = DEFAULT_REPETITION_THRESHOLD
  ): ImitationBuffer | null {
    for (const b of this.buffers) {
      if (now - b.observedAt > DEFAULT_DELAY_MS && b.replays < repetitionThreshold) {
        return b;
      }
    }
    return null;
  }

  /**
   * Imitate the given buffer: returns the action, increments replays,
   * and updates lastReplayed.
   *
   * @param buffer The buffer to imitate (must be a buffer this imitator
   *               holds; we mutate the actual record in-place).
   * @returns      The observed action string.
   */
  imitate(buffer: ImitationBuffer): string {
    // If this buffer is not actually in our list, still return the action
    // but do not mutate anything (defensive — caller may pass a snapshot).
    const live = this.buffers.find(
      (b) =>
        b.observedAction === buffer.observedAction &&
        b.observedAt === buffer.observedAt &&
        b.lastReplayed === buffer.lastReplayed
    );
    if (live) {
      live.replays += 1;
      live.lastReplayed = Date.now();
    } else {
      // Fallback: mutate the passed-in object so caller sees consistency.
      buffer.replays += 1;
      buffer.lastReplayed = Date.now();
    }
    return buffer.observedAction;
  }

  /**
   * Decay stale buffers. Removes buffers older than DECAY_WINDOW_MS that
   * have never been replayed (replays === 0). Imitated buffers are kept
   * because their replay count is part of the agent's behavioural history.
   *
   * @param now Optional current timestamp (ms). Defaults to Date.now().
   */
  decay(now: number = Date.now()): void {
    this.buffers = this.buffers.filter((b) => {
      const stale = now - b.observedAt > DECAY_WINDOW_MS;
      const unused = b.replays === 0;
      return !(stale && unused);
    });
  }

  /** Read-only snapshot of the current buffer (for inspection/tests). */
  snapshot(): ImitationBuffer[] {
    return this.buffers.map((b) => ({ ...b }));
  }

  /** Number of buffers currently held. */
  size(): number {
    return this.buffers.length;
  }
}
