/**
 * ============================================================
 *  REPLAY SCHEDULER — P28 Nocturnal Replay Background Service
 * ============================================================
 *
 *  P28 (Nocturnal Replay) defines an offline memory-consolidation
 *  queue with two streams (hippocampal fast / neocortical slow).
 *  The cognition-engine adds an item to that queue on every chat
 *  message — but `replay()` is NEVER called automatically, so the
 *  queue just grows forever.
 *
 *  This module is the "sleep processor". It is an IN-PROCESS
 *  background task (not a separate service — TRIZA's cognition
 *  state is in-memory in the Next.js process, so a separate
 *  service can't reach it). It periodically checks whether TRIZA
 *  is idle/resting and, if so, runs `NocturnalReplay.replay()`
 *  to consolidate memories.
 *
 *  Trigger logic (run on every interval tick):
 *    1. If a resting-checker says TRIZA is resting → run replay.
 *    2. OR if queue depth > 50 → run replay (overflow protection,
 *       so we don't lose memories if TRIZA never sleeps).
 *    3. OR if queue depth > 10 AND it's been > 30 minutes since
 *       the last replay → run replay (low-priority background
 *       sweep while idle but not officially "resting").
 *
 *  The scheduler is decoupled from the sleep-cycle module
 *  (SLEEP-4's work): it exposes `setRestingChecker(fn)` so the
 *  engine can wire it up after both modules are loaded. If no
 *  checker is registered, we treat "isResting" as false.
 *
 *  The interval handle is `unref()`-ed so the scheduler does NOT
 *  keep Node.js alive on shutdown.
 *
 *  Zero external APIs. Pure local TypeScript.
 * ============================================================
 */

import { NocturnalReplay } from './cognition/nocturnal-replay'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** Result of a single replay cycle (counts, not id arrays). */
export interface ReplayResult {
  /** Unix timestamp (ms) when this replay cycle ran. */
  timestamp: number
  /** Number of hippocampal events processed this cycle. */
  hippocampalReplays: number
  /** Number of neocortical events processed this cycle. */
  neocorticalReplays: number
  /** Number of memories consolidated (importance ≥ 0.5). */
  consolidated: number
  /** Number of memories forgotten (importance < 0.3). */
  forgotten: number
  /** Number of old memories generalized (neocortical stream). */
  generalized: number
  /** Items remaining in the queue after this cycle. */
  totalInQueue: number
  /** Wall-clock time spent in `replay()`, in milliseconds. */
  durationMs: number
}

/** Lifetime stats for the transparency endpoint. */
export interface ReplayStats {
  /** Total replay cycles ever run by this scheduler. */
  totalReplaysRun: number
  /** Lifetime count of memories consolidated. */
  totalConsolidated: number
  /** Lifetime count of memories forgotten. */
  totalForgotten: number
  /** Lifetime count of memories generalized. */
  totalGeneralized: number
  /** Last replay result (null if never run). */
  lastReplay: ReplayResult | null
  /** Current queue depth. */
  queueDepth: number
  /** Whether the scheduler is currently running. */
  running: boolean
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

/** Default auto-trigger interval: 5 minutes. */
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000

/** Queue depth above which we ALWAYS replay (overflow protection). */
const OVERFLOW_THRESHOLD = 50

/** Below this depth, we don't bother with the low-priority sweep. */
const SWEEP_MIN_DEPTH = 10

/** If queue > SWEEP_MIN_DEPTH and last replay was > this long ago,
 *  run a low-priority sweep even when not "resting". 30 minutes. */
const SWEEP_STALE_MS = 30 * 60 * 1000

/** Default max iterations for an auto-triggered replay cycle. */
const DEFAULT_AUTO_ITERATIONS = 20

// ─────────────────────────────────────────────
// ReplayScheduler
// ─────────────────────────────────────────────

/**
 * ReplayScheduler — periodically runs NocturnalReplay.replay() when
 * TRIZA is idle or when the queue overflows.
 *
 * Usage:
 *   const scheduler = new ReplayScheduler(replay)
 *   scheduler.start()                    // 5-minute auto-replay
 *   scheduler.setRestingChecker(() => sleepCycle.current().isResting)
 *   const result = scheduler.runOnce()   // force a cycle now
 *   const stats  = scheduler.stats()     // for transparency UI
 */
export class ReplayScheduler {
  private replay: NocturnalReplay
  private intervalHandle: NodeJS.Timeout | null = null
  private intervalMs: number = DEFAULT_INTERVAL_MS
  private lastReplay: ReplayResult | null = null
  private totalReplaysRun = 0
  private totalConsolidated = 0
  private totalForgotten = 0
  private totalGeneralized = 0

  /**
   * Resting checker — injected by the engine (decoupled from
   * SLEEP-4's sleep-cycle module). Returns true when TRIZA is
   * currently in a resting/sleeping state and should be
   * consolidating memories. Defaults to "never resting".
   */
  private restingChecker: () => boolean = () => false

  constructor(replay: NocturnalReplay) {
    this.replay = replay
  }

  /**
   * Register a function that reports whether TRIZA is currently
   * resting. The scheduler will run replay cycles whenever this
   * returns true. Decouples us from SLEEP-4's sleep-cycle module.
   */
  setRestingChecker(fn: () => boolean): void {
    if (typeof fn === 'function') this.restingChecker = fn
  }

  /**
   * Start the scheduler — runs `maybeReplay()` every `intervalMs`
   * milliseconds. Default: every 5 minutes (300000ms). The
   * interval is `unref()`-ed so it does not keep the Node.js
   * process alive on shutdown. Calling start() twice is a no-op.
   */
  start(intervalMs: number = DEFAULT_INTERVAL_MS): void {
    if (this.intervalHandle) return
    this.intervalMs = intervalMs
    this.intervalHandle = setInterval(() => this.maybeReplay(), intervalMs)
    // Don't keep the process alive just for this background sweep.
    if (this.intervalHandle && typeof this.intervalHandle.unref === 'function') {
      this.intervalHandle.unref()
    }
    console.log(
      `[ReplayScheduler] Started — auto-replay every ${intervalMs / 1000}s`,
    )
  }

  /** Stop the scheduler. Safe to call when not running. */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
      console.log('[ReplayScheduler] Stopped')
    }
  }

  /** Whether the scheduler is currently running. */
  isRunning(): boolean {
    return this.intervalHandle !== null
  }

  /**
   * Decide whether to run a replay cycle right now, and if so,
   * run it. Trigger logic:
   *   1. restingChecker() returns true  → always replay
   *   2. queue depth > OVERFLOW_THRESHOLD (50) → replay (overflow)
   *   3. queue > 10 AND last replay > 30min ago → replay (sweep)
   * Wrapped in try/catch so a buggy checker can't kill the loop.
   */
  private maybeReplay(): void {
    try {
      const isResting = safeCall(this.restingChecker, false)
      const queueDepth = this.replay.queue.length
      const stale =
        this.lastReplay !== null &&
        Date.now() - this.lastReplay.timestamp > SWEEP_STALE_MS

      const shouldReplay =
        isResting ||
        queueDepth > OVERFLOW_THRESHOLD ||
        (queueDepth > SWEEP_MIN_DEPTH && stale)

      if (!shouldReplay) return

      this.runOnce(DEFAULT_AUTO_ITERATIONS)
    } catch (err) {
      console.warn('[ReplayScheduler] maybeReplay error:', err)
    }
  }

  /**
   * Force a replay cycle NOW. Public so the API route can call it
   * for manual testing / admin dashboards. Returns the result.
   *
   * @param maxIterations Max iterations to pass to NocturnalReplay.replay().
   *                      Default 20 (matches the auto-trigger default).
   */
  runOnce(maxIterations: number = DEFAULT_AUTO_ITERATIONS): ReplayResult {
    const t0 = Date.now()
    const raw = this.replay.replay(maxIterations)
    const durationMs = Date.now() - t0
    this.totalReplaysRun++

    // NocturnalReplay.replay() returns { consolidated: string[],
    // forgotten: string[], generalized: string[] } — arrays of
    // memory ids. We report counts.
    const consolidated = raw.consolidated.length
    const forgotten = raw.forgotten.length
    const generalized = raw.generalized.length

    // streamReport() returns { hippocampal, neocortical, totalProcessed }
    // — cumulative processed counts (lifetime of this NocturnalReplay
    // instance). We surface them as "this cycle" deltas by snapshotting
    // before/after... but since NocturnalReplay's processed counters are
    // cumulative, we record them as "replays this cycle" approximations.
    // For per-cycle counts, derive from raw arrays: hippocampal events
    // that were consolidated/forgotten + neocortical events generalized.
    const hippocampalReplays = consolidated + forgotten
    const neocorticalReplays = generalized

    const result: ReplayResult = {
      timestamp: Date.now(),
      hippocampalReplays,
      neocorticalReplays,
      consolidated,
      forgotten,
      generalized,
      totalInQueue: this.replay.queue.length,
      durationMs,
    }

    this.lastReplay = result
    this.totalConsolidated += consolidated
    this.totalForgotten += forgotten
    this.totalGeneralized += generalized

    console.log(
      `[ReplayScheduler] Replay #${this.totalReplaysRun}: ` +
        `+${consolidated} consolidated, -${forgotten} forgotten, ` +
        `~${generalized} generalized, ${result.totalInQueue} left in queue ` +
        `(${durationMs}ms)`,
    )

    return result
  }

  /**
   * Get lifetime stats for the transparency endpoint. Pulls queue
   * depth straight from `replay.queue.length` (the live count),
   * NOT from `streamReport().totalProcessed` (which is a lifetime
   * counter of items ever replayed).
   */
  stats(): ReplayStats {
    let queueDepth = 0
    try {
      queueDepth = this.replay.queue.length
    } catch {
      queueDepth = 0
    }
    return {
      totalReplaysRun: this.totalReplaysRun,
      totalConsolidated: this.totalConsolidated,
      totalForgotten: this.totalForgotten,
      totalGeneralized: this.totalGeneralized,
      lastReplay: this.lastReplay,
      queueDepth,
      running: this.isRunning(),
    }
  }
}

// ─────────────────────────────────────────────
// internal helper
// ─────────────────────────────────────────────

/** Call fn() and return its boolean result; on throw, return fallback. */
function safeCall(fn: () => boolean, fallback: boolean): boolean {
  try {
    const v = fn()
    return v === true
  } catch {
    return fallback
  }
}
