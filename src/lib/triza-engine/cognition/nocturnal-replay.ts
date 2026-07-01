/**
 * ============================================================================
 * P28 — NOCTURNAL REPLAY
 * ============================================================================
 *
 * Principle (P28): Offline memory consolidation during "sleep". The agent
 * does not consolidate memories during active work — it queues them and
 * replays them offline, in TWO streams:
 *
 *   - HIPPOCAMPAL stream: recent memories (age < 1 hour). Replayed FAST
 *     (multiple per iteration). This is the "recent trace" replay that
 *     stabilises short-term memories into longer-term ones.
 *
 *   - NEOCORTICAL stream: older memories (age ≥ 1 hour). Replayed SLOW
 *     (one per iteration). This is the slow generalisation stream that
 *     abstracts patterns across old memories.
 *
 * Outcome of replay:
 *   - high-importance hippocampal  → CONSOLIDATED (promoted to long-term).
 *   - low-importance hippocampal   → FORGOTTEN (pruned — importance < 0.3).
 *   - old neocortical              → GENERALIZED (abstracted).
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** A memory queued for offline replay. */
export interface ReplayEvent {
  /** Id of the memory being replayed. */
  memoryId: string;
  /** Importance score in [0, 1]. */
  importance: number;
  /** Age in milliseconds. */
  age: number;
  /** Which replay stream this event was routed to. */
  stream: 'hippocampal' | 'neocortical';
}

/** Result of one replay session. */
export interface ReplayResult {
  /** Memory ids that were consolidated (promoted to long-term). */
  consolidated: string[];
  /** Memory ids that were forgotten (pruned). */
  forgotten: string[];
  /** Memory ids that were generalized (pattern-abstracted). */
  generalized: string[];
}

/** Age threshold (ms) below which a memory is hippocampal (recent). */
export const HIPPOCAMPAL_AGE_MS = 60 * 60 * 1000; // 1 hour

/** Importance below this → forget (prune). */
export const FORGET_IMPORTANCE = 0.3;

/** Importance above this → consolidate (promote). */
export const CONSOLIDATE_IMPORTANCE = 0.5;

/** How many hippocampal events to replay per iteration (fast stream). */
export const HIPPOCAMPAL_PER_ITER = 3;

/** How many neocortical events to replay per iteration (slow stream). */
export const NEOCORTICAL_PER_ITER = 1;

/**
 * NocturnalReplay — an offline memory consolidation queue with dual streams.
 *
 * Usage:
 *   const r = new NocturnalReplay();
 *   r.add('mem-1', 0.8, 30_000);   // young → hippocampal
 *   r.add('mem-2', 0.1, 2 * 3600_000); // old → neocortical
 *   const out = r.replay(10);
 *   // out.consolidated, out.forgotten, out.generalized
 */
export class NocturnalReplay {
  /** The combined queue (both streams). */
  public queue: ReplayEvent[] = [];

  /** Tracks how many events of each stream have been processed total. */
  private processed = { hippocampal: 0, neocortical: 0 };

  /**
   * Add a memory to the replay queue. Routes to the hippocampal stream
   * if age < 1 hour, otherwise the neocortical stream.
   *
   * @param memoryId   The memory's id.
   * @param importance Importance in [0, 1].
   * @param age        Age in milliseconds.
   */
  add(memoryId: string, importance: number, age: number): void {
    if (!memoryId) return;
    const stream: ReplayEvent['stream'] =
      age < HIPPOCAMPAL_AGE_MS ? 'hippocampal' : 'neocortical';
    this.queue.push({
      memoryId,
      importance: clamp01(importance),
      age: Math.max(0, age),
      stream,
    });
  }

  /**
   * Run a replay session of up to maxIterations iterations.
   *
   * Principle: P28. Each iteration:
   *   - Replay up to HIPPOCAMPAL_PER_ITER (3) hippocampal events (fast).
   *     - importance ≥ CONSOLIDATE_IMPORTANCE (0.5) → consolidated
   *     - importance <  FORGET_IMPORTANCE    (0.3) → forgotten
   *     - otherwise (mid) → kept in queue (no decision yet).
   *   - Replay up to NEOCORTICAL_PER_ITER (1) neocortical event (slow).
   *     - The neocortical stream generalises; all replayed neocortical
   *       events are marked generalized.
   *
   * @param maxIterations Maximum iterations to run.
   * @returns             The consolidated / forgotten / generalized ids.
   */
  replay(maxIterations: number): ReplayResult {
    const result: ReplayResult = {
      consolidated: [],
      forgotten: [],
      generalized: [],
    };
    const iters = Math.max(0, Math.floor(maxIterations ?? 0));

    for (let i = 0; i < iters; i++) {
      // --- Fast hippocampal stream ---------------------------------
      let hipProcessed = 0;
      // We scan the queue and pick the first eligible hippocampal events.
      // We mutate the queue in-place (filter out consumed events).
      const keep: ReplayEvent[] = [];
      let hipIndex = 0;
      for (const ev of this.queue) {
        if (ev.stream === 'hippocampal' && hipProcessed < HIPPOCAMPAL_PER_ITER) {
          // Consume this hippocampal event.
          if (ev.importance >= CONSOLIDATE_IMPORTANCE) {
            result.consolidated.push(ev.memoryId);
          } else if (ev.importance < FORGET_IMPORTANCE) {
            result.forgotten.push(ev.memoryId);
          } else {
            // Mid-importance: leave it in the queue for a future replay.
            keep.push(ev);
          }
          this.processed.hippocampal += 1;
          hipProcessed += 1;
          hipIndex += 1;
        } else {
          keep.push(ev);
        }
      }
      void hipIndex; // (kept for clarity; not used downstream)
      this.queue = keep;

      // --- Slow neocortical stream ---------------------------------
      let neoProcessed = 0;
      const keep2: ReplayEvent[] = [];
      for (const ev of this.queue) {
        if (ev.stream === 'neocortical' && neoProcessed < NEOCORTICAL_PER_ITER) {
          // Generalize.
          result.generalized.push(ev.memoryId);
          this.processed.neocortical += 1;
          neoProcessed += 1;
        } else {
          keep2.push(ev);
        }
      }
      this.queue = keep2;

      // If both streams produced nothing this iteration, the queue is
      // exhausted — stop early.
      if (hipProcessed === 0 && neoProcessed === 0) break;
    }

    return result;
  }

  /**
   * Report on the streams processed so far in this replay session.
   *
   * @returns Counts of hippocampal, neocortical, and total processed events.
   */
  streamReport(): {
    hippocampal: number;
    neocortical: number;
    totalProcessed: number;
  } {
    return {
      hippocampal: this.processed.hippocampal,
      neocortical: this.processed.neocortical,
      totalProcessed:
        this.processed.hippocampal + this.processed.neocortical,
    };
  }
}

// ---- internal helper -----------------------------------------------------

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
